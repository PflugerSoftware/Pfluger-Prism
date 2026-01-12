import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, RefreshCw, ChevronDown, Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { API_CONFIG } from '../../config/apiConfig';

interface CostRate {
  id: number;
  building_type: string;
  elemental_code: string;
  code_name: string;
  category: string;
  cost_per_sf_low: number;
  cost_per_sf_avg: number;
  cost_per_sf_high: number;
  // Procurement multipliers
  mult_procurement_cmar: number;
  mult_procurement_hard_bid: number;
  mult_procurement_design_build: number;
  mult_procurement_csp: number;
  // Construction type multipliers
  mult_construction_concrete: number;
  mult_construction_steel: number;
  mult_construction_mass_timber: number;
  mult_construction_wood_frame: number;
  // Stories multipliers
  mult_stories_1: number;
  mult_stories_2: number;
  mult_stories_3: number;
  mult_stories_4: number;
  updated_at: string;
}

const BUILDING_TYPES = [
  'Elementary',
  'Middle',
  'High School',
  'Specialty',
  'Administration Building',
  'District'
];

type MultiplierField =
  | 'mult_procurement_cmar' | 'mult_procurement_hard_bid' | 'mult_procurement_design_build' | 'mult_procurement_csp'
  | 'mult_construction_concrete' | 'mult_construction_steel' | 'mult_construction_mass_timber' | 'mult_construction_wood_frame'
  | 'mult_stories_1' | 'mult_stories_2' | 'mult_stories_3' | 'mult_stories_4';

type CostField = 'cost_per_sf_low' | 'cost_per_sf_avg' | 'cost_per_sf_high';

type EditableField = CostField | MultiplierField;

const MULTIPLIER_GROUPS = {
  procurement: {
    label: 'Procurement',
    fields: [
      { key: 'mult_procurement_cmar' as MultiplierField, label: 'CMAR' },
      { key: 'mult_procurement_hard_bid' as MultiplierField, label: 'Hard Bid' },
      { key: 'mult_procurement_design_build' as MultiplierField, label: 'Design Build' },
      { key: 'mult_procurement_csp' as MultiplierField, label: 'CSP' },
    ]
  },
  construction: {
    label: 'Construction Type',
    fields: [
      { key: 'mult_construction_concrete' as MultiplierField, label: 'Concrete' },
      { key: 'mult_construction_steel' as MultiplierField, label: 'Steel' },
      { key: 'mult_construction_mass_timber' as MultiplierField, label: 'Mass Timber' },
      { key: 'mult_construction_wood_frame' as MultiplierField, label: 'Wood Frame' },
    ]
  },
  stories: {
    label: 'Stories',
    fields: [
      { key: 'mult_stories_1' as MultiplierField, label: '1' },
      { key: 'mult_stories_2' as MultiplierField, label: '2' },
      { key: 'mult_stories_3' as MultiplierField, label: '3' },
      { key: 'mult_stories_4' as MultiplierField, label: '4' },
    ]
  }
};

export function CostEntry() {
  const [rates, setRates] = useState<CostRate[]>([]);
  const [selectedBuildingType, setSelectedBuildingType] = useState<string>('Elementary');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [importStats, setImportStats] = useState<{ loaded: number; total: number } | null>(null);

  // Track edited values across ALL building types (keyed by "buildingType:elementalCode")
  const [editedRates, setEditedRates] = useState<Map<string, Partial<CostRate>>>(new Map());

  // File input ref for CSV import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle CSV Export - downloads all rates
  const handleExport = () => {
    // Open export URL in new tab to trigger download
    window.open(`${API_CONFIG.baseUrl}/cost-rates.php?resource=export`, '_blank');
  };

  // Handle CSV Import - loads into UI only
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccessMessage(null);
    setImportStats(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        setError('CSV file is empty or has no data rows');
        return;
      }

      // Parse header row
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

      // Validate required columns
      const requiredCols = ['building_type', 'elemental_code', 'cost_per_sf_low', 'cost_per_sf_avg', 'cost_per_sf_high'];
      const missingCols = requiredCols.filter(col => !headers.includes(col));
      if (missingCols.length > 0) {
        setError(`Missing required columns: ${missingCols.join(', ')}`);
        return;
      }

      // Parse ALL data rows (all building types) into editedRates
      const newEditedRates = new Map<string, Partial<CostRate>>();
      const buildingTypesFound = new Set<string>();
      let totalRows = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue;

        const rowData: Record<string, string> = {};
        headers.forEach((header, idx) => {
          rowData[header] = values[idx]?.replace(/^"|"$/g, '') || '';
        });

        const buildingType = rowData['building_type'];
        const elementalCode = rowData['elemental_code'];

        if (!buildingType || !elementalCode) continue;

        buildingTypesFound.add(buildingType);
        totalRows++;

        // Key by "buildingType:elementalCode" to track all building types
        const key = `${buildingType}:${elementalCode}`;
        newEditedRates.set(key, {
          building_type: buildingType,
          elemental_code: elementalCode,
          cost_per_sf_low: parseFloat(rowData['cost_per_sf_low']) || 0,
          cost_per_sf_avg: parseFloat(rowData['cost_per_sf_avg']) || 0,
          cost_per_sf_high: parseFloat(rowData['cost_per_sf_high']) || 0,
          mult_procurement_cmar: parseFloat(rowData['mult_procurement_cmar']) || 1,
          mult_procurement_hard_bid: parseFloat(rowData['mult_procurement_hard_bid']) || 1,
          mult_procurement_design_build: parseFloat(rowData['mult_procurement_design_build']) || 1,
          mult_procurement_csp: parseFloat(rowData['mult_procurement_csp']) || 1,
          mult_construction_concrete: parseFloat(rowData['mult_construction_concrete']) || 1,
          mult_construction_steel: parseFloat(rowData['mult_construction_steel']) || 1,
          mult_construction_mass_timber: parseFloat(rowData['mult_construction_mass_timber']) || 1,
          mult_construction_wood_frame: parseFloat(rowData['mult_construction_wood_frame']) || 1,
          mult_stories_1: parseFloat(rowData['mult_stories_1']) || 1,
          mult_stories_2: parseFloat(rowData['mult_stories_2']) || 1,
          mult_stories_3: parseFloat(rowData['mult_stories_3']) || 1,
          mult_stories_4: parseFloat(rowData['mult_stories_4']) || 1,
        });
      }

      if (totalRows === 0) {
        setError('No valid data rows found in CSV');
        return;
      }

      // Store all imported rates
      setEditedRates(newEditedRates);
      setHasChanges(true);

      // Apply imported data to current view (for currently selected building type)
      setRates(prev =>
        prev.map(rate => {
          const key = `${selectedBuildingType}:${rate.elemental_code}`;
          const imported = newEditedRates.get(key);
          if (imported) {
            return { ...rate, ...imported };
          }
          return rate;
        })
      );

      setImportStats({ loaded: totalRows, total: lines.length - 1 });
      setSuccessMessage(`Loaded ${totalRows} rates across ${buildingTypesFound.size} building types. Click Save to apply to database.`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Parse CSV line handling quoted values with commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const fetchRates = useCallback(async (clearEdits = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/cost-rates.php?building_type=${encodeURIComponent(selectedBuildingType)}`,
        { credentials: 'include' }
      );
      if (!response.ok) throw new Error('Failed to fetch rates');
      const data = await response.json();

      // Merge any pending edits for this building type into the fetched data
      setRates(data.map((rate: CostRate) => {
        const key = `${selectedBuildingType}:${rate.elemental_code}`;
        const edited = editedRates.get(key);
        if (edited) {
          return { ...rate, ...edited };
        }
        return rate;
      }));

      if (clearEdits) {
        setEditedRates(new Map());
        setHasChanges(false);
      }
    } catch (err) {
      setError('Failed to load cost rates');
    } finally {
      setIsLoading(false);
    }
  }, [selectedBuildingType, editedRates]);

  useEffect(() => {
    fetchRates();
  }, [selectedBuildingType]);

  const handleFieldChange = (
    code: string,
    field: EditableField,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    const key = `${selectedBuildingType}:${code}`;

    setEditedRates(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(key) || {};
      newMap.set(key, {
        ...existing,
        building_type: selectedBuildingType,
        elemental_code: code,
        [field]: numValue
      });
      return newMap;
    });

    setRates(prev =>
      prev.map(rate =>
        rate.elemental_code === code ? { ...rate, [field]: numValue } : rate
      )
    );

    setHasChanges(true);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    if (editedRates.size === 0) return;

    setIsSaving(true);
    setError(null);

    try {
      // Build rates to update from all edited entries (all building types)
      const ratesToUpdate = Array.from(editedRates.entries()).map(([key, edited]) => {
        // Key format is "buildingType:elementalCode"
        const [buildingType, elementalCode] = key.split(':');
        return {
          building_type: buildingType,
          elemental_code: elementalCode,
          // Costs
          cost_per_sf_low: edited.cost_per_sf_low ?? 0,
          cost_per_sf_avg: edited.cost_per_sf_avg ?? 0,
          cost_per_sf_high: edited.cost_per_sf_high ?? 0,
          // Procurement
          mult_procurement_cmar: edited.mult_procurement_cmar ?? 1,
          mult_procurement_hard_bid: edited.mult_procurement_hard_bid ?? 1,
          mult_procurement_design_build: edited.mult_procurement_design_build ?? 1,
          mult_procurement_csp: edited.mult_procurement_csp ?? 1,
          // Construction
          mult_construction_concrete: edited.mult_construction_concrete ?? 1,
          mult_construction_steel: edited.mult_construction_steel ?? 1,
          mult_construction_mass_timber: edited.mult_construction_mass_timber ?? 1,
          mult_construction_wood_frame: edited.mult_construction_wood_frame ?? 1,
          // Stories
          mult_stories_1: edited.mult_stories_1 ?? 1,
          mult_stories_2: edited.mult_stories_2 ?? 1,
          mult_stories_3: edited.mult_stories_3 ?? 1,
          mult_stories_4: edited.mult_stories_4 ?? 1,
        };
      });

      // Count unique building types being saved
      const buildingTypesSaved = new Set(ratesToUpdate.map(r => r.building_type));

      const response = await fetch(`${API_CONFIG.baseUrl}/cost-rates.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates: ratesToUpdate })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');

      setSuccessMessage(`Saved ${result.updated_count} cost rates across ${buildingTypesSaved.size} building type(s)`);
      setEditedRates(new Map());
      setHasChanges(false);
      await fetchRates(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  // Group rates by category
  const groupedRates = rates.reduce((acc, rate) => {
    const cat = rate.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(rate);
    return acc;
  }, {} as Record<string, CostRate[]>);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#f9fafb' }}>
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Cost Data Entry</h1>
          <p className="text-gray-900 mt-1">
            Manage base cost rates and multipliers per elemental code
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-900">Building Type:</label>
              <div className="relative">
                <select
                  value={selectedBuildingType}
                  onChange={e => setSelectedBuildingType(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
                >
                  {BUILDING_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Hidden file input for CSV import */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Export all building types to CSV"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={handleImportClick}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Import CSV data for current building type"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <div className="w-px h-6 bg-gray-300" />
              <button
                onClick={fetchRates}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={`flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg transition-colors ${
                  hasChanges && !isSaving
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                {successMessage}
                {importStats && (
                  <span className="ml-2 text-xs text-green-600">
                    ({importStats.loaded} of {importStats.total} rows in CSV)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Import/Export help */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm">
            <strong>Workflow:</strong> Export CSV to edit in Excel, then Import CSV to load all building types into the UI. Click <strong>Save Changes</strong> to apply to database.
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-900">Loading cost rates...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th rowSpan={2} className="text-left px-3 py-2 text-xs font-semibold text-gray-900 uppercase tracking-wider w-16 border-r border-gray-200">Code</th>
                    <th rowSpan={2} className="text-left px-3 py-2 text-xs font-semibold text-gray-900 uppercase tracking-wider w-40 border-r border-gray-200">Name</th>
                    <th colSpan={3} className="text-center px-2 py-1 text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200 bg-blue-50">Base $/SF</th>
                    <th colSpan={4} className="text-center px-2 py-1 text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200 bg-green-50">Procurement</th>
                    <th colSpan={4} className="text-center px-2 py-1 text-xs font-semibold text-gray-900 uppercase tracking-wider border-r border-gray-200 bg-yellow-50">Construction Type</th>
                    <th colSpan={4} className="text-center px-2 py-1 text-xs font-semibold text-gray-900 uppercase tracking-wider bg-purple-50">Stories</th>
                  </tr>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {/* Base costs */}
                    <th className="text-center px-2 py-1 text-xs font-medium text-gray-900 w-20 bg-blue-50">Low</th>
                    <th className="text-center px-2 py-1 text-xs font-medium text-gray-900 w-20 bg-blue-50">Avg</th>
                    <th className="text-center px-2 py-1 text-xs font-medium text-gray-900 w-20 border-r border-gray-200 bg-blue-50">High</th>
                    {/* Procurement */}
                    {MULTIPLIER_GROUPS.procurement.fields.map((f, i) => (
                      <th key={f.key} className={`text-center px-2 py-1 text-xs font-medium text-gray-900 w-16 bg-green-50 ${i === 3 ? 'border-r border-gray-200' : ''}`}>{f.label}</th>
                    ))}
                    {/* Construction */}
                    {MULTIPLIER_GROUPS.construction.fields.map((f, i) => (
                      <th key={f.key} className={`text-center px-2 py-1 text-xs font-medium text-gray-900 w-16 bg-yellow-50 ${i === 3 ? 'border-r border-gray-200' : ''}`}>{f.label}</th>
                    ))}
                    {/* Stories */}
                    {MULTIPLIER_GROUPS.stories.fields.map(f => (
                      <th key={f.key} className="text-center px-2 py-1 text-xs font-medium text-gray-900 w-12 bg-purple-50">{f.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedRates).map(([category, categoryRates]) => (
                    <>
                      <tr key={`cat-${category}`} className="bg-gray-100">
                        <td colSpan={19} className="px-3 py-2 text-sm font-semibold text-gray-900">
                          {category}
                        </td>
                      </tr>
                      {categoryRates.map(rate => (
                        <tr key={rate.elemental_code} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-1.5 font-mono font-medium text-gray-900 border-r border-gray-100">
                            {rate.elemental_code}
                          </td>
                          <td className="px-3 py-1.5 text-gray-900 border-r border-gray-100 truncate max-w-40" title={rate.code_name}>
                            {rate.code_name}
                          </td>
                          {/* Base costs */}
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={rate.cost_per_sf_low || ''}
                              onChange={e => handleFieldChange(rate.elemental_code, 'cost_per_sf_low', e.target.value)}
                              placeholder="0"
                              className="w-full text-right px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-900"
                            />
                          </td>
                          <td className="px-1 py-1">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={rate.cost_per_sf_avg || ''}
                              onChange={e => handleFieldChange(rate.elemental_code, 'cost_per_sf_avg', e.target.value)}
                              placeholder="0"
                              className="w-full text-right px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-900"
                            />
                          </td>
                          <td className="px-1 py-1 border-r border-gray-200">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={rate.cost_per_sf_high || ''}
                              onChange={e => handleFieldChange(rate.elemental_code, 'cost_per_sf_high', e.target.value)}
                              placeholder="0"
                              className="w-full text-right px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white text-gray-900"
                            />
                          </td>
                          {/* Procurement multipliers */}
                          {MULTIPLIER_GROUPS.procurement.fields.map((f, i) => (
                            <td key={f.key} className={`px-1 py-1 ${i === 3 ? 'border-r border-gray-200' : ''}`}>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate[f.key] || ''}
                                onChange={e => handleFieldChange(rate.elemental_code, f.key, e.target.value)}
                                placeholder="1"
                                className="w-full text-right px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-green-400 bg-white text-gray-900"
                              />
                            </td>
                          ))}
                          {/* Construction multipliers */}
                          {MULTIPLIER_GROUPS.construction.fields.map((f, i) => (
                            <td key={f.key} className={`px-1 py-1 ${i === 3 ? 'border-r border-gray-200' : ''}`}>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate[f.key] || ''}
                                onChange={e => handleFieldChange(rate.elemental_code, f.key, e.target.value)}
                                placeholder="1"
                                className="w-full text-right px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 bg-white text-gray-900"
                              />
                            </td>
                          ))}
                          {/* Stories multipliers */}
                          {MULTIPLIER_GROUPS.stories.fields.map(f => (
                            <td key={f.key} className="px-1 py-1">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate[f.key] || ''}
                                onChange={e => handleFieldChange(rate.elemental_code, f.key, e.target.value)}
                                placeholder="1"
                                className="w-full text-right px-1 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-400 bg-white text-gray-900"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Formula Explanation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">How Costs Are Calculated</h3>
          <p className="text-sm text-gray-900">
            <code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs text-gray-900">
              Element Cost = Base $/SF x Square Footage x Procurement Mult x Construction Mult x Stories Mult
            </code>
          </p>
          <p className="text-sm text-gray-900 mt-2">
            Each elemental code has its own base rate and multipliers. The project builder will select the appropriate multipliers based on project settings.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CostEntry;
