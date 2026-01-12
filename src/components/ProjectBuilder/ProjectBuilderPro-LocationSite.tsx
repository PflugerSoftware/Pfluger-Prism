import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { Input } from '../ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  MapPin,
  Map,
  DollarSign,
  Info,
  AlertTriangle,
  Leaf,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"
import { ProjectBuilderTempProject } from '../MainViews/ProjectBuilderPro'
import { InteractiveMapPickerWithDistrict } from '../SideBars/InteractiveMapPickerWithDistrict'
import { useFacilities } from '../System/FacilitiesContext'

interface ProjectBuilderProLocationSiteProps {
  tempProject: ProjectBuilderTempProject
  setTempProject: React.Dispatch<React.SetStateAction<ProjectBuilderTempProject>>
}

export function ProjectBuilderProLocationSite({ tempProject, setTempProject }: ProjectBuilderProLocationSiteProps) {
  const { colors } = useTheme()
  const { getFacilityById } = useFacilities()

  // Get the selected facility if there is one
  const selectedFacility = tempProject.selectedFacilityId ? getFacilityById(tempProject.selectedFacilityId) : null

  // Check if this is a renovation/addition/equity project with facility location
  const isRenovationType = tempProject.projectType === 'renovations' ||
                           tempProject.projectType === 'additions' ||
                           tempProject.projectType === 'equity-improvements'
  const hasFacilityLocation = isRenovationType && selectedFacility && selectedFacility.address

  // State for Location & Site
  const [siteAcreage, setSiteAcreage] = useState([85])
  const [selectedAddress, setSelectedAddress] = useState(tempProject.address || '')
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  
  // State for new site preparation items
  const [asbestosEnabled, setAsbestosEnabled] = useState(false)
  const [asbestosArea, setAsbestosArea] = useState(25000)
  const [asbestosRate, setAsbestosRate] = useState(15)
  const [environmentalEnabled, setEnvironmentalEnabled] = useState(false)
  const [asbestosInfoOpen, setAsbestosInfoOpen] = useState(false)
  const [environmentalInfoOpen, setEnvironmentalInfoOpen] = useState(false)
  
  // State for land and transportation costs
  const [landCost, setLandCost] = useState(2500000)
  const [transportationCost, setTransportationCost] = useState(150000)
  
  // State for expandable sections
  const [isLandExpanded, setIsLandExpanded] = useState(false)
  const [isTransportationExpanded, setIsTransportationExpanded] = useState(false)
  const [showOptionalSiteCosts, setShowOptionalSiteCosts] = useState(false)

  // Calculate total site costs
  const calculateTotalSiteCosts = () => {
    const basePreparationCosts = 25000 + 15000 + 8500 // geotechnical + traffic + utilities
    const asbestosCost = asbestosEnabled ? (asbestosArea * asbestosRate) : 0
    const environmentalCost = environmentalEnabled ? 45000 : 0
    
    return landCost + transportationCost + basePreparationCosts + asbestosCost + environmentalCost
  }

  // Update tempProject when site costs change
  useEffect(() => {
    const totalSiteCosts = calculateTotalSiteCosts()
    setTempProject(prev => ({
      ...prev,
      siteAcreage: siteAcreage[0],
      siteCosts: totalSiteCosts
    }))
  }, [siteAcreage, landCost, transportationCost, asbestosEnabled, asbestosArea, asbestosRate, environmentalEnabled, setTempProject])

  // Site preparation cost items
  const sitePreparationCosts = [
    {
      id: 'geotechnical',
      title: 'Geotechnical',
      unit: '$/site',
      estimatedCost: '$25,000',
      description: 'Soil analysis and foundation recommendations'
    },
    {
      id: 'traffic',
      title: 'Traffic Studies',
      unit: '$/site', 
      estimatedCost: '$15,000',
      description: 'Traffic impact analysis and mitigation planning'
    },
    {
      id: 'utilities',
      title: 'Utility Extensions',
      unit: '$/acre',
      estimatedCost: '$8,500',
      description: 'Water, sewer, electric, and data infrastructure'
    },
    {
      id: 'permits',
      title: 'Zoning & Building Permits',
      unit: '% construction',
      estimatedCost: '2.5%',
      description: 'Municipal approvals and permit fees'
    }
  ]

  // Calculate asbestos cost
  const asbestosCost = asbestosEnabled ? asbestosArea * asbestosRate : 0
  const environmentalCost = environmentalEnabled ? 32500 : 0 // Average of $15,000-$50,000

  // Calculate total site preparation cost
  const baseSitePrep = 25000 + 15000 + (8500 * siteAcreage[0])
  const totalSitePrep = baseSitePrep + asbestosCost + environmentalCost
  
  // Calculate overall total including land and transportation
  const overallTotal = totalSitePrep + landCost + transportationCost

  const handleLocationSelect = (address: string, latitude: number, longitude: number) => {
    setSelectedAddress(address)
    setTempProject(prev => ({
      ...prev,
      address,
      latitude,
      longitude
    }))
  }

  return (
    <div className="space-y-6">
      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Site Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address Picker */}
          <div>
            <Label className="text-sm mb-2 block">Site Address</Label>

            {/* Show facility location info for renovation/addition/equity projects */}
            {hasFacilityLocation && (
              <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--theme-info-bg)', border: '1px solid var(--theme-info-border)' }}>
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--theme-info)' }} />
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--theme-info-text)' }}>
                      This project is linked to <strong>{selectedFacility?.name}</strong>.
                      The location has been set to the facility's address.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-12"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedAddress || 'Select site address on map'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl h-[700px] flex flex-col p-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                  <DialogTitle>Select Site Location</DialogTitle>
                  <DialogDescription>
                    Click on the map to select a location, search for an address, or drag the marker to adjust. The purple shaded area shows the Liberty Hill ISD district boundary.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden">
                  <InteractiveMapPickerWithDistrict
                    selectedAddress={selectedAddress}
                    selectedLatitude={tempProject.latitude}
                    selectedLongitude={tempProject.longitude}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
                <div className="p-4 border-t flex justify-end gap-2" style={{ backgroundColor: 'var(--theme-muted-bg)', borderColor: 'var(--theme-border)' }}>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddressDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => setIsAddressDialogOpen(false)}
                    disabled={!selectedAddress}
                  >
                    Confirm Location
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Acreage Slider */}
          <div>
            <Label className="text-sm mb-4 block">Site Acreage</Label>
            <div className="px-4">
              <div className="relative">
                {/* Current value display */}
                <div
                  className="absolute -top-8 text-white text-sm px-2 py-1 rounded transform -translate-x-1/2"
                  style={{
                    left: `${((siteAcreage[0] - 60) / (100 - 60)) * 100}%`,
                    backgroundColor: 'var(--theme-text-primary)'
                  }}
                >
                  {siteAcreage[0]} acres
                </div>

                {/* Recommended range background */}
                <div
                  className="absolute h-2 rounded-full"
                  style={{
                    left: `${((70 - 60) / (100 - 60)) * 100}%`,
                    width: `${((90 - 70) / (100 - 60)) * 100}%`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'var(--theme-success-bg)'
                  }}
                />
                
                <Slider
                  value={siteAcreage}
                  onValueChange={setSiteAcreage}
                  max={100}
                  min={60}
                  step={1}
                  className="w-full"
                />
              </div>
              
              {/* Min/Max labels */}
              <div className="flex justify-between text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
                <span>60</span>
                <span>100</span>
              </div>

              {/* Helper text */}
              <p className="text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
                High schools typically require 60-100 acres
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--theme-success-text)' }}>
                Recommended range: 70-90 acres (highlighted in green)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Land Purchase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Land Purchase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm text-gray-600 mb-4">Select a preset or customize the land acquisition cost</p>
              
              {/* Quick Start Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant={landCost === 500000 ? "default" : "outline"}
                  className="flex items-center justify-center gap-1.5 h-auto py-2"
                  style={landCost === 500000 ? { backgroundColor: colors.secondary.skyBlue, color: colors.primary.white } : {}}
                  onClick={() => {
                    setLandCost(500000)
                    setIsLandExpanded(false)
                  }}
                >
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Low</span>
                  <span className="font-medium">$500K</span>
                </Button>
                <Button
                  variant={landCost === 1500000 ? "default" : "outline"}
                  className="flex items-center justify-center gap-1.5 h-auto py-2"
                  style={landCost === 1500000 ? { backgroundColor: colors.secondary.skyBlue, color: colors.primary.white } : {}}
                  onClick={() => {
                    setLandCost(1500000)
                    setIsLandExpanded(false)
                  }}
                >
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Medium</span>
                  <span className="font-medium">$1.5M</span>
                </Button>
                <Button
                  variant={landCost === 2500000 ? "default" : "outline"}
                  className="flex items-center justify-center gap-1.5 h-auto py-2"
                  style={landCost === 2500000 ? { backgroundColor: colors.secondary.skyBlue, color: colors.primary.white } : {}}
                  onClick={() => {
                    setLandCost(2500000)
                    setIsLandExpanded(false)
                  }}
                >
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>High</span>
                  <span className="font-medium">$2.5M</span>
                </Button>
              </div>

              {/* Expandable Custom Input */}
              <Collapsible open={isLandExpanded} onOpenChange={setIsLandExpanded}>
                <CollapsibleContent>
                  <div className="mt-2 p-4 rounded-lg border" style={{ backgroundColor: 'var(--theme-muted-bg)', borderColor: 'var(--theme-border)' }}>
                    <Label className="text-sm mb-2 block">Fine-tune Land Cost</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>$</span>
                      <Input
                        type="number"
                        value={landCost}
                        onChange={(e) => setLandCost(parseInt(e.target.value) || 0)}
                        className="flex-1"
                        placeholder="Enter custom land cost"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Transportation Infrastructure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Transportation Infrastructure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm text-gray-600 mb-4">Roads, parking, bus circulation, and access improvements</p>
              
              {/* Quick Start Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant={transportationCost === 100000 ? "default" : "outline"}
                  className="flex items-center justify-center gap-1.5 h-auto py-2"
                  style={transportationCost === 100000 ? { backgroundColor: colors.secondary.skyBlue, color: colors.primary.white } : {}}
                  onClick={() => {
                    setTransportationCost(100000)
                    setIsTransportationExpanded(false)
                  }}
                >
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Minimal</span>
                  <span className="font-medium">$100K</span>
                </Button>
                <Button
                  variant={transportationCost === 250000 ? "default" : "outline"}
                  className="flex items-center justify-center gap-1.5 h-auto py-2"
                  style={transportationCost === 250000 ? { backgroundColor: colors.secondary.skyBlue, color: colors.primary.white } : {}}
                  onClick={() => {
                    setTransportationCost(250000)
                    setIsTransportationExpanded(false)
                  }}
                >
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Standard</span>
                  <span className="font-medium">$250K</span>
                </Button>
                <Button
                  variant={transportationCost === 500000 ? "default" : "outline"}
                  className="flex items-center justify-center gap-1.5 h-auto py-2"
                  style={transportationCost === 500000 ? { backgroundColor: colors.secondary.skyBlue, color: colors.primary.white } : {}}
                  onClick={() => {
                    setTransportationCost(500000)
                    setIsTransportationExpanded(false)
                  }}
                >
                  <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>Extensive</span>
                  <span className="font-medium">$500K</span>
                </Button>
              </div>

              {/* Expandable Custom Input */}
              <Collapsible open={isTransportationExpanded} onOpenChange={setIsTransportationExpanded}>
                <CollapsibleContent>
                  <div className="mt-2 p-4 rounded-lg border" style={{ backgroundColor: 'var(--theme-muted-bg)', borderColor: 'var(--theme-border)' }}>
                    <Label className="text-sm mb-2 block">Fine-tune Transportation Cost</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>$</span>
                      <Input
                        type="number"
                        value={transportationCost}
                        onChange={(e) => setTransportationCost(parseInt(e.target.value) || 0)}
                        className="flex-1"
                        placeholder="Enter custom transportation cost"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
          </div>
        </CardContent>
      </Card>

      {/* Optional Site Costs */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowOptionalSiteCosts(!showOptionalSiteCosts)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Optional Site Costs
            </CardTitle>
            {showOptionalSiteCosts ? (
              <ChevronUp className="h-6 w-6" style={{ color: 'var(--theme-text-secondary)' }} />
            ) : (
              <ChevronDown className="h-6 w-6" style={{ color: 'var(--theme-text-secondary)' }} />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Specialized studies and site preparation requirements
          </p>
        </CardHeader>

        {showOptionalSiteCosts && (
          <CardContent className="space-y-6 pt-6">

            {/* Standard site preparation costs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {sitePreparationCosts.map((cost) => (
                <div
                  key={cost.id}
                  className="p-4 border rounded-lg"
                  style={{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-muted-bg)' }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" style={{ color: 'var(--theme-text-secondary)' }} />
                      <h4 className="text-sm font-medium">{cost.title}</h4>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium" style={{ color: 'var(--theme-success)' }}>
                        {cost.estimatedCost}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--theme-text-tertiary)' }}>
                        {cost.unit}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                    {cost.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Environmental Studies Card */}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={environmentalEnabled}
                    onCheckedChange={setEnvironmentalEnabled}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <div className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" style={{ color: 'var(--theme-success)' }} />
                    <div>
                      <h5 className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>Environmental Impact Studies</h5>
                      <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Required assessments for protected species, wetlands, etc.</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm" style={{ color: 'var(--theme-text-tertiary)' }}>
                    $15,000-$50,000
                  </div>
                  {environmentalEnabled && (
                    <div className="text-lg font-medium" style={{ color: 'var(--theme-success)' }}>
                      +${environmentalCost.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <Collapsible open={environmentalInfoOpen} onOpenChange={setEnvironmentalInfoOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-0 h-auto" style={{ color: 'var(--theme-primary)' }}>
                    <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${environmentalInfoOpen ? 'rotate-180' : ''}`} />
                    Why might I need this?
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="text-sm p-3 rounded-lg" style={{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-info-bg)' }}>
                    <p>Environmental studies may be required for:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Sites near protected habitats or wetlands</li>
                      <li>Areas with endangered or protected species</li>
                      <li>Properties with potential contamination concerns</li>
                      <li>Compliance with NEPA or state environmental regulations</li>
                      <li>Sites requiring federal or state permits</li>
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
           

            {/* Asbestos Abatement Card */}

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={asbestosEnabled}
                    onCheckedChange={setAsbestosEnabled}
                    className="data-[state=checked]:bg-green-600"
                  />
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" style={{ color: 'var(--theme-warning)' }} />
                    <div>
                      <h5 className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>Asbestos Abatement</h5>
                      <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Testing and removal of hazardous materials from site</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-medium" style={{ color: 'var(--theme-success)' }}>
                    +${asbestosCost.toLocaleString()}
                  </div>
                </div>
              </div>

              {asbestosEnabled && (
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm mb-2 block">Estimated area requiring abatement</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={asbestosArea}
                        onChange={(e) => setAsbestosArea(parseInt(e.target.value) || 0)}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600">SF</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Based on existing structures on site</p>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700">Cost Calculation:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                        onClick={() => {
                          const newRate = prompt('Enter new rate per SF:', asbestosRate.toString())
                          if (newRate && !isNaN(parseFloat(newRate))) {
                            setAsbestosRate(parseFloat(newRate))
                          }
                        }}
                      >
                        ${asbestosRate}/SF
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {asbestosArea.toLocaleString()} SF × ${asbestosRate}/SF = ${(asbestosArea * asbestosRate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <Collapsible open={asbestosInfoOpen} onOpenChange={setAsbestosInfoOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start p-0 h-auto" style={{ color: 'var(--theme-primary)' }}>
                    <ChevronDown className={`h-4 w-4 mr-1 transition-transform ${asbestosInfoOpen ? 'rotate-180' : ''}`} />
                    Why might I need this?
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2">
                  <div className="text-sm p-3 rounded-lg" style={{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-info-bg)' }}>
                    <p>Asbestos abatement may be required if:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Existing buildings constructed before 1980 are present</li>
                      <li>Demolition or renovation of older structures is planned</li>
                      <li>Environmental assessments indicate asbestos-containing materials</li>
                      <li>Local regulations require testing and removal</li>
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
          
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  Estimated Site Preparation Total:
                </span>
                <span className="text-sm font-medium text-blue-900">
                  ${totalSitePrep.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                + 2.5% of construction cost for permits
              </p>
              {(asbestosCost > 0 || environmentalCost > 0) && (
                <div className="mt-2 pt-2 border-t border-blue-300">
                  <div className="text-xs text-blue-700 space-y-1">
                    {asbestosCost > 0 && (
                      <div className="flex justify-between">
                        <span>Asbestos Abatement:</span>
                        <span>+${asbestosCost.toLocaleString()}</span>
                      </div>
                    )}
                    {environmentalCost > 0 && (
                      <div className="flex justify-between">
                        <span>Environmental Studies:</span>
                        <span>+${environmentalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Overall Site & Land Costs Summary */}
      <div className="mt-6 p-4 bg-sky-blue/10 border-2 border-sky-blue rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Location & Site Total</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Land Acquisition:</span>
            <span className="font-medium">${landCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Transportation Infrastructure:</span>
            <span className="font-medium">${transportationCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Site Preparation:</span>
            <span className="font-medium">${totalSitePrep.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 border-t-2 border-sky-blue">
            <span className="font-medium text-gray-900">Overall Total:</span>
            <span className="font-medium text-sky-blue text-lg">${overallTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>


    </div>
  )
}