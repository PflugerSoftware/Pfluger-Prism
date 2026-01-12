import { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Switch } from '../ui/switch'
import { Calendar } from '../ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import {
  Plus,
  Minus,
  Info,
  School,
  GraduationCap,
  BookOpen,
  Building2,
  Leaf,
  CalendarIcon,
  Construction,
  Wrench,
  Home,
  Scale,
  Hammer,
  Box,
  TreePine,
  Layers,
  SquareStack,
  Grid3x3,
  FileText,
  Handshake,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"
import { format } from 'date-fns'
import { ProjectBuilderTempProject } from '../MainViews/ProjectBuilderPro'
import { useFacilities } from '../System/FacilitiesContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface ProjectBuilderProProjectOverviewProps {
  tempProject: ProjectBuilderTempProject
  setTempProject: React.Dispatch<React.SetStateAction<ProjectBuilderTempProject>>
}

export function ProjectBuilderProProjectOverview({ tempProject, setTempProject }: ProjectBuilderProProjectOverviewProps) {
  const { colors } = useTheme()
  const { facilities } = useFacilities()

  // Form state for Project Overview
  const [projectName, setProjectName] = useState('')
  const [selectedProjectType, setSelectedProjectType] = useState('new-construction')
  const [selectedBuildingType, setSelectedBuildingType] = useState('high-school')
  const [squareFootage, setSquareFootage] = useState(200000) // Default to high school typical 200k SF
  const [baseCost, setBaseCost] = useState(40000000) // Default to high school $40M
  const [selectedConstructionType, setSelectedConstructionType] = useState('steel')
  const [numberOfStories, setNumberOfStories] = useState(1)
  const [customStories, setCustomStories] = useState(1)
  const [selectedProcurementMethod, setSelectedProcurementMethod] = useState('cmar')
  const [estimatedStartDate, setEstimatedStartDate] = useState<Date | undefined>()
  const [constructionYear, setConstructionYear] = useState<number>(new Date().getFullYear())
  const [inflationRate, setInflationRate] = useState<number>(8)

  // Facility state
  const [facilityOption, setFacilityOption] = useState<'existing' | 'new' | null>(null)
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | undefined>()
  const [newFacilityName, setNewFacilityName] = useState('')
  const [newFacilityType, setNewFacilityType] = useState<'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration' | 'District'>('High School')
  const [newFacilityEnrollment, setNewFacilityEnrollment] = useState(0)
  const [newFacilityCapacity, setNewFacilityCapacity] = useState(0)
  const [newFacilityStatus, setNewFacilityStatus] = useState<'Existing' | 'Under Construction' | 'Planned'>('Planned')

  // LEED state
  const [leedEnabled, setLeedEnabled] = useState(false)
  const [selectedLeedRating, setSelectedLeedRating] = useState('')

  // CHIPS state
  const [chipsEnabled, setChipsEnabled] = useState(false)

  // Optional section state
  const [showOptionalSection, setShowOptionalSection] = useState(false)

  // Project type options
  const projectTypes = [
    {
      id: 'new-construction',
      title: 'New Construction',
      description: 'Build a new facility from the ground up',
      icon: Construction
    },
    {
      id: 'renovations',
      title: 'Renovations',
      description: 'Modernize and upgrade existing facilities',
      icon: Wrench
    },
    {
      id: 'additions',
      title: 'Additions',
      description: 'Expand existing buildings with new spaces',
      icon: Home
    },
    {
      id: 'equity-improvements',
      title: 'Equity Improvements',
      description: 'Ensure equal access and quality across facilities',
      icon: Scale
    }
  ]

  // Building type options
  const buildingTypes = [
    {
      id: 'elementary',
      title: 'Elementary School',
      subtitle: 'K-5 | 80,000-120,000 SF typical',
      icon: School,
      typicalRange: { min: 80000, max: 120000, typical: 100000 },
      baseCost: 20000000, // $20M
      available: true
    },
    {
      id: 'middle',
      title: 'Middle School',
      subtitle: '6-8 | 120,000-180,000 SF typical',
      icon: BookOpen,
      typicalRange: { min: 120000, max: 180000, typical: 150000 },
      baseCost: 30000000, // $30M
      available: true
    },
    {
      id: 'high-school',
      title: 'High School',
      subtitle: '9-12 | 150,000-250,000 SF typical',
      icon: GraduationCap,
      typicalRange: { min: 150000, max: 250000, typical: 200000 },
      baseCost: 40000000, // $40M
      available: true
    },
    {
      id: 'natatorium',
      title: 'Natatorium',
      subtitle: 'Aquatic Center | 15,000-25,000 SF typical',
      icon: Building2,
      typicalRange: { min: 15000, max: 25000, typical: 20000 },
      available: false,
      comingSoon: 'Phase 1B'
    },
    {
      id: 'central-stadium',
      title: 'Central Stadium',
      subtitle: 'Multi-use Athletic Complex | 5,000-15,000 SF typical',
      icon: Building2,
      typicalRange: { min: 5000, max: 15000, typical: 10000 },
      available: false,
      comingSoon: 'Phase 1B'
    },
    {
      id: 'hs-stadium',
      title: 'HS-specific Stadium',
      subtitle: 'High School Athletics | 3,000-8,000 SF typical',
      icon: Building2,
      typicalRange: { min: 3000, max: 8000, typical: 5000 },
      available: false,
      comingSoon: 'Phase 1B'
    },
    {
      id: 'career-tech',
      title: 'Career Technology',
      subtitle: 'CTE Center | 40,000-80,000 SF typical',
      icon: Building2,
      typicalRange: { min: 40000, max: 80000, typical: 60000 },
      available: false,
      comingSoon: 'Phase 1B'
    },
    {
      id: 'performing-arts',
      title: 'Central Performing Arts Center',
      subtitle: 'Theater & Fine Arts | 25,000-45,000 SF typical',
      icon: Building2,
      typicalRange: { min: 25000, max: 45000, typical: 35000 },
      available: false,
      comingSoon: 'Phase 1B'
    },
    {
      id: 'agri-facility',
      title: 'Agri-Facility',
      subtitle: 'Agricultural Education | 15,000-30,000 SF typical',
      icon: Building2,
      typicalRange: { min: 15000, max: 30000, typical: 22000 },
      available: false,
      comingSoon: 'Phase 1B'
    },
    {
      id: 'transportation',
      title: 'Transportation',
      subtitle: 'Bus Maintenance & Storage | 20,000-40,000 SF typical',
      icon: Building2,
      typicalRange: { min: 20000, max: 40000, typical: 30000 },
      available: false,
      comingSoon: 'Phase 1B'
    }
  ]

  // Construction type options
  const constructionTypes = [
    {
      id: 'concrete',
      title: 'Concrete (Tilt-up)',
      description: 'Pre-cast concrete panels, cost-effective',
      cost: '$ - Most economical',
      timeline: '22-26 months typical',
      icon: Box
    },
    {
      id: 'steel',
      title: 'Steel Frame',
      description: 'Traditional structural steel construction',
      cost: '$ - Standard pricing',
      timeline: '24-28 months typical',
      icon: Hammer
    },

    {
      id: 'timber',
      title: 'Mass Timber',
      description: 'Sustainable, innovative construction method',
      cost: '$ - Premium pricing',
      timeline: '22-24 months typical',
      icon: TreePine,
      isNew: true,
      isOptional: true
    },
    {
      id: 'not-sure',
      title: 'Not Sure',
      description: 'We\'ll help determine the best option',
      cost: 'TBD based on project needs',
      timeline: 'Will be determined during design',
      icon: Info
    }
  ]

  // Number of stories options
  const storiesOptions = [
    {
      id: 1,
      title: 'Single Story',
      description: 'One level, maximum accessibility',
      icon: Layers,
      typical: 'Most common for elementary schools'
    },
    {
      id: 2,
      title: 'Two Story',
      description: 'Two levels, efficient land use',
      icon: SquareStack,
      typical: 'Common for middle and high schools'
    },
    {
      id: 3,
      title: 'Three Story',
      description: 'Three levels, high-density urban sites',
      icon: Building2,
      typical: 'Urban campuses with limited acreage'
    },
    {
      id: 'custom',
      title: 'Custom',
      description: 'Specify exact number of stories',
      icon: Grid3x3,
      typical: 'For unique project requirements'
    },
    {
      id: 'not-sure',
      title: 'Not Sure',
      description: 'We\'ll help determine based on site',
      icon: Info,
      typical: 'Will be determined during design'
    }
  ]

  // Procurement method options
  const procurementMethods = [
    {
      id: 'competitive-sealed-proposal',
      title: 'Competitive Sealed Proposal',
      fullName: 'Competitive Sealed Proposal',
      description: 'Competitive process based on qualifications and price',
      benefits: 'Best value selection, qualifications-based, flexible criteria',
      timeline: 'Standard delivery, comprehensive evaluation',
      icon: FileText
    },
    {
      id: 'hard-bid',
      title: 'Hard Bid',
      fullName: 'Hard Bid (Design-Bid-Build)',
      description: 'Traditional low-bid process after complete design',
      benefits: 'Competitive pricing, proven process, clear separation',
      timeline: 'Longer delivery, sequential phases',
      icon: Hammer
    },
    {
      id: 'design-build',
      title: 'Design Build',
      fullName: 'Design Build',
      description: 'Single entity responsible for both design and construction',
      benefits: 'Single point of contact, faster delivery, integrated team',
      timeline: 'Accelerated delivery, overlapping phases',
      icon: Construction
    },
    {
      id: 'cmar',
      title: 'CMAR',
      fullName: 'Construction Manager At Risk',
      description: 'Early contractor involvement with guaranteed maximum price',
      benefits: 'Collaborative approach, early cost certainty, risk management',
      timeline: 'Faster delivery, overlapping phases possible',
      icon: Handshake
    },
    {
      id: 'not-sure',
      title: 'Not Sure',
      fullName: 'Not Sure / Need Help',
      description: 'We\'ll help recommend the best procurement method',
      benefits: 'Expert guidance, tailored recommendation, best fit for project',
      timeline: 'Will be determined based on project requirements',
      icon: Info
    }
  ]

  // LEED rating options
  const leedRatings = [
    {
      id: 'silver',
      title: 'LEED Silver',
      cost: 85000,
      color: 'border-gray-400',
      glowColor: 'shadow-gray-400/30',
      breakdown: [
        { item: 'Lighting Analysis', cost: 12000 },
        { item: 'Energy Analysis', cost: 25000 },
        { item: 'Material Selection', cost: 18000 },
        { item: 'Site Evaluation', cost: 15000 },
        { item: 'Certification & Documentation', cost: 15000 }
      ]
    },
    {
      id: 'gold',
      title: 'LEED Gold',
      cost: 125000,
      color: 'border-yellow-400',
      glowColor: 'shadow-yellow-400/30',
      breakdown: [
        { item: 'Lighting Analysis', cost: 18000 },
        { item: 'Energy Analysis', cost: 38000 },
        { item: 'Material Selection', cost: 28000 },
        { item: 'Site Evaluation', cost: 21000 },
        { item: 'Certification & Documentation', cost: 20000 }
      ]
    },
    {
      id: 'platinum',
      title: 'LEED Platinum',
      cost: 175000,
      color: 'border-slate-300',
      glowColor: 'shadow-slate-300/30',
      breakdown: [
        { item: 'Lighting Analysis', cost: 25000 },
        { item: 'Energy Analysis', cost: 55000 },
        { item: 'Material Selection', cost: 38000 },
        { item: 'Site Evaluation', cost: 30000 },
        { item: 'Certification & Documentation', cost: 27000 }
      ]
    }
  ]

  // CHIPS certification
  const chipsCost = 10000
  const chipsBreakdown = [
    { item: 'Registration', cost: 900 },
    { item: 'Design Review', cost: 4600 },
    { item: 'Construction Review', cost: 3100 },
    { item: 'Contingency (misc., plaque, letters, etc.)', cost: 1000 }
  ]

  // Get selected LEED rating details
  const getSelectedLeedCost = () => {
    if (!leedEnabled || !selectedLeedRating) return 0
    const rating = leedRatings.find(r => r.id === selectedLeedRating)
    return rating?.cost || 0
  }

  const getCardGlowClass = () => {
    if (!leedEnabled || !selectedLeedRating) return ''
    const rating = leedRatings.find(r => r.id === selectedLeedRating)
    return rating ? `${rating.glowColor} shadow-lg` : ''
  }

  // Handle square footage changes
  const handleSquareFootageChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setSquareFootage(numValue)
  }

  const adjustSquareFootage = (increment: number) => {
    setSquareFootage(Math.max(0, squareFootage + increment))
  }

  const getCurrentTypicalRange = () => {
    const selectedType = buildingTypes.find(type => type.id === selectedBuildingType)
    return selectedType?.typicalRange
  }

  const currentRange = getCurrentTypicalRange()

  // Update tempProject when any project overview settings change
  useEffect(() => {
    const leedCost = getSelectedLeedCost()
    const chipsCostTotal = chipsEnabled ? chipsCost : 0
    const finalStories = numberOfStories === 'custom' ? customStories : numberOfStories
    setTempProject(prev => ({
      ...prev,
      projectName: projectName,
      leedCost: leedCost + chipsCostTotal,
      projectType: selectedProjectType,
      buildingType: selectedBuildingType,
      constructionType: selectedConstructionType,
      numberOfStories: finalStories,
      procurementMethod: selectedProcurementMethod,
      totalSquareFootage: squareFootage,
      constructionYear: constructionYear,
      inflationRate: inflationRate,
      baseCost: baseCost,
      facilityOption: facilityOption,
      selectedFacilityId: selectedFacilityId,
      newFacilityData: facilityOption === 'new' ? {
        name: newFacilityName,
        facility_type: newFacilityType,
        current_enrollment: newFacilityEnrollment,
        capacity: newFacilityCapacity,
        status: newFacilityStatus
      } : undefined
    }))
  }, [projectName, leedEnabled, selectedLeedRating, chipsEnabled, selectedProjectType, selectedBuildingType, selectedConstructionType, numberOfStories, customStories, selectedProcurementMethod, squareFootage, constructionYear, inflationRate, baseCost, facilityOption, selectedFacilityId, newFacilityName, newFacilityType, newFacilityEnrollment, newFacilityCapacity, newFacilityStatus, setTempProject])

  return (
    <div className="space-y-6">
      {/* Project Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Name
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name (e.g., Liberty Hill High School Renovation)"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-2">
              Give your project a descriptive name that will appear throughout the system
            </p>
          </div>
        </CardContent>
      </Card>

  

      {/* Project Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hammer className="h-5 w-5" />
            Project Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the type of project you are planning
          </p>
          <div className="flex gap-4">
            {projectTypes.map((type) => {
              const isSelected = selectedProjectType === type.id
              const IconComponent = type.icon

              return (
                <div
                  key={type.id}
                  className={`relative flex-1 p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md`}
                  style={{
                    borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                    backgroundColor: isSelected ? 'var(--theme-card-hover)' : 'transparent'
                  }}
                  onClick={() => setSelectedProjectType(type.id)}
                >
                  <div className="absolute top-4 right-4">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                        backgroundColor: isSelected ? 'var(--theme-primary)' : 'transparent'
                      }}
                    >
                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3">
                      <IconComponent className="h-10 w-10" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-tertiary)' }} />
                    </div>
                    <h3 className="text-sm font-medium" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-primary)' }}>
                      {type.title}
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{type.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>



      {/* Facility Selection - Show only for Renovations, Additions, or Equity Improvements */}
      {(selectedProjectType === 'renovations' || selectedProjectType === 'additions' || selectedProjectType === 'equity-improvements') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Facility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose which existing facility this project will be attached to
            </p>
            <div>
              <Label htmlFor="facilitySelect">Existing Facility *</Label>
              <Select
                value={selectedFacilityId?.toString()}
                onValueChange={(value) => {
                  const facilityId = parseInt(value)
                  setSelectedFacilityId(facilityId)
                  setFacilityOption('existing')

                  // Also set the facility's location data if available
                  const facility = facilities.find(f => f.id === facilityId)
                  if (facility && (facility.address || facility.latitude || facility.longitude)) {
                    setTempProject(prev => ({
                      ...prev,
                      address: facility.address || prev.address,
                      latitude: facility.latitude || prev.latitude,
                      longitude: facility.longitude || prev.longitude
                    }))
                  }
                }}
              >
                <SelectTrigger id="facilitySelect" className="w-full mt-2">
                  <SelectValue placeholder="Choose a facility..." />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id.toString()}>
                      {facility.name} ({facility.facility_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFacilityId && (() => {
                const selectedFacility = facilities.find(f => f.id === selectedFacilityId)
                return selectedFacility ? (
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-info-bg)', border: '1px solid var(--theme-info-border)' }}>
                    <h4 className="font-medium mb-2" style={{ color: 'var(--theme-info)' }}>Facility Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedFacility.name}</p>
                      <p><span className="font-medium">Type:</span> {selectedFacility.facility_type}</p>
                      <p><span className="font-medium">Status:</span> {selectedFacility.status || 'Existing'}</p>
                      {selectedFacility.address && (
                        <p><span className="font-medium">Address:</span> {selectedFacility.address}</p>
                      )}
                      {(selectedFacility.current_enrollment !== undefined || selectedFacility.capacity !== undefined) && (
                        <p><span className="font-medium">Enrollment:</span> {selectedFacility.current_enrollment || 0} / {selectedFacility.capacity || 0} capacity</p>
                      )}
                      <p className="mt-2 text-xs" style={{ color: 'var(--theme-info-text)' }}>
                        This project will be linked to this facility and inherit its location data.
                      </p>
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Construction automatically creates new facility */}
      {selectedProjectType === 'new-construction' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              New Facility Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--theme-success-bg)', borderColor: 'var(--theme-success-border)' }}>
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--theme-success)' }} />
                <div>
                  <h4 className="font-medium mb-1" style={{ color: 'var(--theme-success)' }}>New Facility Will Be Created</h4>
                  <p className="text-sm" style={{ color: 'var(--theme-success-text)' }}>
                    This new construction project will automatically create a new facility in the system.
                    Facility details will be populated from your project information.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Building Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-5 w-5" />
            Building Type
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Select the type of building or facility you're planning
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildingTypes.map((type) => {
              const IconComponent = type.icon
              const isSelected = selectedBuildingType === type.id
              const isAvailable = type.available

              return (
                <div
                  key={type.id}
                  className={`relative p-6 rounded-lg border-2 transition-all duration-200 ${
                    !isAvailable
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer hover:shadow-md'
                  }`}
                      style={{
                        borderColor: !isAvailable
                          ? 'var(--theme-border)'
                          : isSelected
                            ? 'var(--theme-primary)'
                            : 'var(--theme-border)',
                        backgroundColor: !isAvailable
                          ? 'var(--theme-muted-bg)'
                          : isSelected
                            ? 'var(--theme-card-hover)'
                            : 'transparent'
                      }}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedBuildingType(type.id)
                          setSquareFootage(type.typicalRange.typical)
                          // Update base cost based on building type
                          setBaseCost(type.baseCost)
                        }
                      }}
                    >
                      {!isAvailable && (
                        <div className="absolute top-3 left-3">
                          <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: 'var(--theme-muted-bg)', color: 'var(--theme-text-secondary)' }}
                          >
                            {type.comingSoon}
                          </Badge>
                        </div>
                      )}

                      <div className="absolute top-4 right-4">
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{
                            borderColor: !isAvailable
                              ? 'var(--theme-border)'
                              : isSelected
                                ? 'var(--theme-primary)'
                                : 'var(--theme-border)',
                            backgroundColor: !isAvailable
                              ? 'var(--theme-muted-bg)'
                              : isSelected
                                ? 'var(--theme-primary)'
                                : 'transparent'
                          }}
                        >
                          {isSelected && isAvailable && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center text-center">
                        <div className="mb-3">
                          <IconComponent
                            className="h-8 w-8"
                            style={{
                              color: !isAvailable
                                ? 'var(--theme-text-tertiary)'
                                : isSelected
                                  ? 'var(--theme-primary)'
                                  : 'var(--theme-text-tertiary)'
                            }}
                          />
                        </div>
                        <h3
                          style={{
                            color: !isAvailable
                              ? 'var(--theme-text-tertiary)'
                              : isSelected
                                ? 'var(--theme-primary)'
                                : 'var(--theme-text-primary)'
                          }}
                        >
                          {type.title}
                        </h3>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{type.subtitle}</p>
                      </div>
                    </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-500">
            Grayed out building types will be available in Phase 1B
          </p>
        </CardContent>
      </Card>

 

      {/* Square Footage Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3x3 className="h-5 w-5" />
            Project Size
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the approximate square footage for your project (optional)
          </p>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                type="number"
                value={squareFootage || ''}
                onChange={(e) => handleSquareFootageChange(e.target.value)}
                placeholder="0"
                className="text-lg py-3 pr-16"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                <span className="text-sm mr-2" style={{ color: 'var(--theme-text-tertiary)' }}>SF</span>
                <div className="flex flex-col">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 p-1"
                    onClick={() => adjustSquareFootage(1000)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 p-1"
                    onClick={() => adjustSquareFootage(-1000)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {currentRange && (
            <p className="text-xs text-gray-500">
              Typical range: {currentRange.min.toLocaleString()} - {currentRange.max.toLocaleString()} SF
            </p>
          )}
        </CardContent>
      </Card>



      {/* Construction Year and Inflation Rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Construction Timeline & Cost Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Set the expected construction start year and inflation rate for cost projections
          </p>
          <div className="grid grid-cols-2 gap-6">
            {/* Construction Start Year */}
            <div>
              <Label className="mb-2 block">Construction Start Year</Label>
              <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--theme-info-bg)', borderColor: 'var(--theme-info-border)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Year construction begins</p>
                    <Input
                      type="number"
                      min={new Date().getFullYear()}
                      max={new Date().getFullYear() + 20}
                      value={constructionYear}
                      onChange={(e) => setConstructionYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="mt-1 text-xl font-semibold border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  </div>
                  <CalendarIcon className="h-4 w-4" style={{ color: 'var(--theme-text-secondary)' }} />
                </div>
              </div>
            </div>

            {/* Rate of Inflation */}
            <div>
              <Label className="mb-2 block">Annual Inflation Rate (Optional)</Label>
              <div className="p-3 rounded-lg border" style={{ backgroundColor: 'var(--theme-info-bg)', borderColor: 'var(--theme-info-border)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Expected annual cost increase</p>
                    <div className="relative mt-1">
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        step={0.1}
                        value={inflationRate}
                        onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
                        className="text-xl font-semibold border-0 bg-transparent p-0 h-auto pr-6 focus-visible:ring-0"
                      />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-xl font-semibold" style={{ color: 'var(--theme-primary)' }}>
                        %
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Optional Details */}
      <Card>
        <CardHeader
          className="cursor-pointer"
          onClick={() => setShowOptionalSection(!showOptionalSection)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Optional Details
            </CardTitle>
            {showOptionalSection ? (
              <ChevronUp className="h-6 w-6" style={{ color: 'var(--theme-text-secondary)' }} />
            ) : (
              <ChevronDown className="h-6 w-6" style={{ color: 'var(--theme-text-secondary)' }} />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Additional specifications for more accurate estimates
          </p>
        </CardHeader>

        {showOptionalSection && (
          <CardContent className="space-y-8 pt-6">
          {/* Construction Type */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Label className="text-lg">Construction Type</Label>
          <Info className="h-4 w-4" style={{ color: 'var(--theme-text-tertiary)' }} />
        </div>

        <div className="flex gap-4">
          {constructionTypes.map((type) => {
            const isSelected = selectedConstructionType === type.id
            const IconComponent = type.icon

            return (
              <div
                key={type.id}
                className="relative flex-1 p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                  backgroundColor: isSelected ? 'var(--theme-card-hover)' : 'transparent'
                }}
                onClick={() => setSelectedConstructionType(type.id)}
              >
                <div className="absolute top-4 right-4">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                      backgroundColor: isSelected ? 'var(--theme-primary)' : 'transparent'
                    }}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-3">
                    <IconComponent className="h-10 w-10" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-tertiary)' }} />
                  </div>
                  <h3 className="text-sm font-medium" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-primary)' }}>
                    {type.title}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{type.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>



      {/* Number of Stories */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Label className="text-lg">Number of Stories</Label>
          <Info className="h-4 w-4" style={{ color: 'var(--theme-text-tertiary)' }} />
        </div>

        <div className="flex gap-4 flex-wrap md:flex-nowrap">
          {storiesOptions.map((option) => {
            const isSelected = numberOfStories === option.id
            const IconComponent = option.icon

            return (
              <div
                key={option.id}
                className="relative flex-1 p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                  backgroundColor: isSelected ? 'var(--theme-card-hover)' : 'transparent'
                }}
                onClick={() => setNumberOfStories(option.id)}
              >
                <div className="absolute top-4 right-4">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                      backgroundColor: isSelected ? 'var(--theme-primary)' : 'transparent'
                    }}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-3">
                    <IconComponent className="h-10 w-10" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-tertiary)' }} />
                  </div>
                  <h3 style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-primary)' }}>
                    {option.title}
                  </h3>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{option.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Custom Stories Input */}
        {numberOfStories === 'custom' && (
          <div className="mt-4 max-w-md">
            <Label className="mb-2 block">Enter Number of Stories</Label>
            <Input
              type="number"
              min={1}
              max={20}
              value={customStories}
              onChange={(e) => setCustomStories(parseInt(e.target.value) || 1)}
              className="w-full"
            />
            <p className="text-sm mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
              Specify the exact number of stories for your project (1-20)
            </p>
          </div>
        )}
      </div>


      {/* Procurement Method */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Label className="text-lg">Procurement Method</Label>
          <Info className="h-4 w-4" style={{ color: 'var(--theme-text-tertiary)' }} />
        </div>

        <div className="flex gap-4">
          {procurementMethods.map((method) => {
            const isSelected = selectedProcurementMethod === method.id
            const IconComponent = method.icon

            return (
              <div
                key={method.id}
                className="relative flex-1 p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{
                  borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                  backgroundColor: isSelected ? 'var(--theme-card-hover)' : 'transparent'
                }}
                onClick={() => setSelectedProcurementMethod(method.id)}
              >
                <div className="absolute top-4 right-4">
                  <div
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                      backgroundColor: isSelected ? 'var(--theme-primary)' : 'transparent'
                    }}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-3">
                    <IconComponent className="h-10 w-10" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-tertiary)' }} />
                  </div>
                  <h3 className="text-sm font-medium" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-primary)' }}>
                    {method.title}
                  </h3>
                  <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{method.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

 

      {/* LEED V5 Studies */}
      <div>
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Switch
                  checked={leedEnabled}
                  onCheckedChange={(checked) => {
                    setLeedEnabled(checked)
                    if (!checked) {
                      setSelectedLeedRating('')
                    }
                  }}
                  checkedColor="#16a34a"
                />
              </div>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5" style={{ color: 'var(--theme-success)' }} />
                <div>
                  <h5 className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>LEED Rating Studies</h5>
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Required LEED assessments</p>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {leedEnabled && selectedLeedRating ? (
                <div className="text-lg font-medium" style={{ color: 'var(--theme-success)' }}>
                  +${getSelectedLeedCost().toLocaleString()}
                </div>
              ) : (
                <div className="text-sm" style={{ color: 'var(--theme-text-tertiary)' }}>
                  Based on option selected
                </div>
              )}
            </div>
          </div>

          {leedEnabled && (
            <div className="mt-4 space-y-3">
              <Label className="text-sm block mb-2">Select LEED Rating Target:</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {leedRatings.map((rating) => {
                  const isSelected = selectedLeedRating === rating.id
                  return (
                    <Button
                      key={rating.id}
                      variant={isSelected ? "default" : "outline"}
                      className="p-4 h-auto flex flex-col items-center gap-2 transition-all duration-200 border-2"
                      style={{
                        borderColor: isSelected ? 'var(--theme-primary)' : 'var(--theme-border)',
                        backgroundColor: isSelected ? 'var(--theme-card-hover)' : 'transparent'
                      }}
                      onClick={() => setSelectedLeedRating(rating.id)}
                    >
                      <div className="font-medium" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-primary)' }}>{rating.title}</div>
                      <div className="text-sm" style={{ color: isSelected ? 'var(--theme-primary)' : 'var(--theme-text-secondary)' }}>
                        ${rating.cost.toLocaleString()}
                      </div>
                    </Button>
                  )
                })}
              </div>

              {selectedLeedRating && (
                <div className="mt-3">
                  <div className="text-sm mb-3" style={{ color: 'var(--theme-text-primary)' }}>
                    <strong>
                      {leedRatings.find(r => r.id === selectedLeedRating)?.title}
                    </strong> certification selected
                  </div>
                  <div className="space-y-1.5">
                    {leedRatings.find(r => r.id === selectedLeedRating)?.breakdown.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span style={{ color: 'var(--theme-text-secondary)' }}>{item.item}</span>
                        <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>${item.cost.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-2 border-t flex justify-between items-center" style={{ borderColor: 'var(--theme-border)' }}>
                    <span className="text-sm" style={{ color: 'var(--theme-text-primary)' }}>Total</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--theme-success)' }}>
                      ${leedRatings.find(r => r.id === selectedLeedRating)?.cost.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
      </div>


      {/* CHPS Certification */}
      <div>
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Switch
                  checked={chipsEnabled}
                  onCheckedChange={setChipsEnabled}
                  checkedColor="#2563eb"
                />
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                <div>
                  <h5 className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>CHPS Certification</h5>
                  <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Collaborative for High Performance Schools</p>
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {chipsEnabled ? (
                <div className="text-lg font-medium" style={{ color: 'var(--theme-primary)' }}>
                  +${chipsCost.toLocaleString()}
                </div>
              ) : (
                <div className="text-sm" style={{ color: 'var(--theme-text-tertiary)' }}>
                  ${chipsCost.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {chipsEnabled && (
            <div className="mt-3">
              <div className="text-sm mb-3" style={{ color: 'var(--theme-text-primary)' }}>
                <strong>CHPS Certification</strong> breakdown
              </div>
              <div className="space-y-1.5">
                {chipsBreakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span style={{ color: 'var(--theme-text-secondary)' }}>{item.item}</span>
                    <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>${item.cost.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t flex justify-between items-center" style={{ borderColor: 'var(--theme-border)' }}>
                <span className="text-sm" style={{ color: 'var(--theme-text-primary)' }}>Total</span>
                <span className="text-sm font-medium" style={{ color: 'var(--theme-primary)' }}>
                  ≈ ${chipsBreakdown.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
      </div>
          </CardContent>
        )}
      </Card>


    </div>
  )
}