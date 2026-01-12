# ProjectDetailContent Refactor Task

## Objective
Refactor `/src/components/SideBars/ProjectDetailContent.tsx` (1749 lines) into smaller, focused components placed in this directory.

## Current File Structure
The monolithic component contains:
- State management and hooks
- Cost calculation logic
- Date/phase helper functions
- CRUD handlers
- Gantt timeline logic
- Multiple card components inline
- Two tabs (Details, Costs) with all content inline

## Components to Extract

### 1. `ElementalCostsSection.tsx` (PRIORITY - needs refactor)
**Source lines:** 1388-1679
**Props needed:**
- `isEditMode: boolean`
- `project: Project`
- `editedProject: Project | null`
- `costRates: CostRateData[]`
- `costRatesLoading: boolean`
- `sliderPositions: Record<string, number>`
- `onSliderChange: (code: string, position: number) => void`
- `onElementalCostUpdate: (costs: ElementalCost[]) => void`
- `calculateElementCost: function` (or move into component)

**Key refactor:** Unify edit and read-only modes to use the SAME grouped-by-category layout. Both modes should show:
- Categories grouped with colored headers (Substructure, Shell, Enclosure, Interiors, Services, Equipment, Site, General)
- Slider bar ALWAYS visible (disabled in read-only mode for visual reference)
- Min/max values in small font at slider ends
- Current $/SF and total cost prominently displayed
- Category subtotals
- Grand total row

### 2. `CostSummaryRings.tsx`
**Source lines:** 1144-1277
**Props needed:**
- `baseCost: number`
- `siteCost: number`
- `designCost: number`
- `contingencyCost: number`
- `squareFootage: number`
- `isEditMode: boolean`
- `onSiteCostChange?: (value: number) => void`
- `onDesignCostChange?: (value: number) => void`
- `onContingencyChange?: (value: number) => void`

### 3. `TechnicalDetailsCard.tsx`
**Source lines:** 1279-1386
**Props needed:**
- `project: Project`
- `editedProject: Project | null`
- `isEditMode: boolean`
- `onFieldChange: (field: string, value: any) => void`

### 4. `TimelineCard.tsx`
**Source lines:** 1016-1139 (plus Gantt task memo logic from 530-675)
**Props needed:**
- `project: Project`
- `editedProject: Project | null`
- `isEditMode: boolean`
- `ganttTasks: Task[]`
- `onTaskChange?: (task: Task) => void`
- `onStartDateChange?: (date: string) => void`

### 5. `ProjectOverviewCard.tsx`
**Source lines:** 946-1013
**Props needed:**
- `project: Project`
- `editedProject: Project | null`
- `isEditMode: boolean`
- `onFieldChange: (field: string, value: any) => void`

### 6. `LocationCard.tsx`
**Source lines:** 908-943
**Props needed:**
- `project: Project`
- `editedProject: Project | null`
- `isEditMode: boolean`
- `onOpenAddressDialog: () => void`

## Shared Types (create `types.ts`)
```typescript
export interface CostRateData {
  elemental_code: string;
  code_name: string;
  category: string;
  cost_per_sf_low: number;
  cost_per_sf_avg: number;
  cost_per_sf_high: number;
  mult_procurement_cmar: number;
  mult_procurement_hard_bid: number;
  mult_procurement_design_build: number;
  mult_procurement_csp: number;
  mult_construction_concrete: number;
  mult_construction_steel: number;
  mult_construction_mass_timber: number;
  mult_construction_wood_frame: number;
  mult_stories_1: number;
  mult_stories_2: number;
  mult_stories_3: number;
  mult_stories_4: number;
}

export const CATEGORY_ORDER = ['Substructure', 'Shell', 'Enclosure', 'Interiors', 'Services', 'Equipment', 'Site', 'General']

export const CATEGORY_COLORS: Record<string, string> = {
  'Substructure': '#00A9E0',
  'Shell': '#67823A',
  'Enclosure': '#003C71',
  'Interiors': '#F2A900',
  'Services': '#8B5CF6',
  'Equipment': '#EC4899',
  'Site': '#14B8A6',
  'General': '#6B7280'
}
```

## Shared Utilities (create `utils.ts`)
Move these helper functions:
- `getProcurementMultiplierKey`
- `getConstructionMultiplierKey`
- `getStoriesMultiplierKey`
- `calculateElementCost`

## Final Structure
```
/src/components/SideBars/ProjectDetailContent/
├── index.tsx                    # Main component (reduced to ~400-500 lines)
├── types.ts                     # Shared types and constants
├── utils.ts                     # Shared helper functions
├── ElementalCostsSection.tsx    # Unified elemental costs with sliders
├── CostSummaryRings.tsx         # Activity rings visualization
├── TechnicalDetailsCard.tsx     # Construction details
├── TimelineCard.tsx             # Gantt timeline
├── ProjectOverviewCard.tsx      # SF, capacity, site area
└── LocationCard.tsx             # Address and coordinates
```

## Important Notes
1. Preserve all existing functionality
2. Use the same styling patterns (CSS variables like `var(--theme-text-primary)`)
3. Keep the same Tailwind classes
4. Do not use emojis in code or comments
5. The main index.tsx should import and compose all sub-components
6. Update the import in AppSidebar.tsx or wherever ProjectDetailContent is imported from

## ElementalCostsSection Specific Requirements
The MAIN goal is to unify the edit/read-only views:

**Current read-only (good layout):**
- Grouped by category with colored headers
- Shows code, name, $/SF, cost
- Category subtotals
- Clean, organized

**Current edit mode (needs work):**
- Flat table layout
- Sliders visible
- No category grouping

**Target unified layout (BOTH modes):**
```
[Category Header - colored] .............. Subtotal: $X/SF  $XXK
  [Code] [Name] [----slider----] [$XX.XX/SF] [$XXXK]
                 ^min          ^max
  [Code] [Name] [----slider----] [$XX.XX/SF] [$XXXK]

[Next Category Header] ................... Subtotal: $X/SF  $XXK
  ...

[Grand Total] ............................ $XXX/SF  $X.XXM
```

- Slider is always visible
- In read-only mode: slider is disabled but shows position visually
- Min/max in small text (10px) at slider ends
- Current value prominent
- Collapsible categories (optional)
