import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'


import { 
  Building2, 
  CheckCircle, 
  Circle, 
  ArrowRight,
  ArrowLeft,
  Settings,
  FileText,
  Calculator,
  Calendar,
  Users,
  MapPin,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"
import { ProjectBuilderProSpaceProgramming } from '../ProjectBuilder/ProjectBuilderPro-SpaceProgramming'
import { ProjectBuilderProLocationSite } from '../ProjectBuilder/ProjectBuilderPro-LocationSite'
import { ProjectBuilderProProjectOverview } from '../ProjectBuilder/ProjectBuilderPro-ProjectOverview'
import { ProjectBuilderProSchedulePhases } from '../ProjectBuilder/ProjectBuilderPro-SchedulePhases'
import { ProjectBuilderProReviewFinalize } from '../ProjectBuilder/ProjectBuilderPro-ReviewFinalize'

// ProjectBuilderTempProject interface - temporary project state during building
export interface ProjectBuilderTempProject {
  // Overview data
  projectName: string
  projectType: string
  buildingType: string
  constructionType: string
  numberOfStories?: number
  procurementMethod: string
  leedCost: number
  constructionYear: number

  // Facility data
  facilityOption: 'existing' | 'new' | null // Which option user selected
  selectedFacilityId?: number // If attaching to existing facility
  newFacilityData?: {
    name: string
    facility_type: 'Elementary' | 'Middle' | 'High School' | 'Specialty' | 'Administration' | 'District'
    current_enrollment: number
    capacity: number
    status: 'Existing' | 'Under Construction' | 'Planned'
  }

  // Location & Site data
  address?: string
  latitude?: number
  longitude?: number
  siteAcreage?: number
  siteCosts: number

  // Space Programming data
  spaceCosts: number
  totalSquareFootage: number
  numberOfPods: number
  projectPods: any[]
  customPods: any[]

  // Schedule & Phases data
  phases: Array<{
    id: string
    name: string
    duration: number
    cost: number
  }>
  inflationRate: number
  projectStartDate?: string

  // Calculated totals
  baseCost: number
  totalDuration: number
  inflationAmount: number
  totalCost: number
}

// Project Stats Cards Component with Dropdown
function ProjectStatsCards({ 
  totalBaseCost, 
  inflationAmount, 
  inflationRate, 
  totalCostWithInflation, 
  totalDuration,
  tempProject
}: {
  totalBaseCost: number
  inflationAmount: number
  inflationRate: number
  totalCostWithInflation: number
  totalDuration: number
  tempProject: ProjectBuilderTempProject
}) {
  const [isBaseCostOpen, setIsBaseCostOpen] = useState(false)
  
  // Calculate cost per square foot
  const costPerSF = tempProject.totalSquareFootage > 0 
    ? totalCostWithInflation / tempProject.totalSquareFootage 
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      {/* Combined Cost Card with Dropdown */}
      <Card>
        <CardContent className="p-4">
          <Collapsible open={isBaseCostOpen} onOpenChange={setIsBaseCostOpen}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
                <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Project Cost</span>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isBaseCostOpen ? (
                    <ChevronUp className="h-4 w-4" style={{ color: 'var(--theme-text-tertiary)' }} />
                  ) : (
                    <ChevronDown className="h-4 w-4" style={{ color: 'var(--theme-text-tertiary)' }} />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            <div className="text-xl font-semibold" style={{ color: 'var(--theme-primary)' }}>
              ${totalCostWithInflation.toLocaleString()}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--theme-text-tertiary)' }}>
              Base: ${totalBaseCost.toLocaleString()} + ${inflationAmount.toLocaleString()} inflation
            </div>
            <CollapsibleContent className="mt-3 space-y-1.5 pt-2 border-t">
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--theme-text-secondary)' }}>Building Base Cost:</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>${tempProject.baseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--theme-text-secondary)' }}>Space Costs:</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>${tempProject.spaceCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--theme-text-secondary)' }}>Site Costs:</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>${tempProject.siteCosts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--theme-text-secondary)' }}>LEED Costs:</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>${tempProject.leedCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--theme-text-secondary)' }}>Phase Costs:</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>${tempProject.phases.reduce((sum, phase) => sum + phase.cost, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 mt-1.5 border-t">
                <span style={{ color: 'var(--theme-text-secondary)' }}>Base Subtotal:</span>
                <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>${totalBaseCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--theme-text-secondary)' }}>Inflation Impact:</span>
                <span className="font-medium" style={{ color: 'var(--theme-accent)' }}>+${inflationAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 mt-1.5 border-t">
                <span style={{ color: 'var(--theme-text-secondary)' }}>Total Cost:</span>
                <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>${totalCostWithInflation.toLocaleString()}</span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* Cost per SF Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Cost / SF</span>
          </div>
          <div className="text-xl font-semibold" style={{ color: 'var(--theme-primary)' }}>
            ${costPerSF.toLocaleString(undefined, { maximumFractionDigits: 0 })}/SF
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--theme-text-tertiary)' }}>
            {tempProject.totalSquareFootage > 0
              ? `${tempProject.totalSquareFootage.toLocaleString()} SF total`
              : 'No square footage set'
            }
          </div>
        </CardContent>
      </Card>

      {/* Number of Pods Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Pods</span>
          </div>
          <div className="text-xl font-semibold" style={{ color: 'var(--theme-primary)' }}>
            {tempProject.numberOfPods || 0}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--theme-text-tertiary)' }}>
            {tempProject.numberOfPods === 1 ? 'Pod configured' : 'Pods configured'}
          </div>
        </CardContent>
      </Card>

      {/* Project Selections Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
            <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Selections</span>
          </div>
          <div className="space-y-1.5">
            <div className="text-sm">
              <span style={{ color: 'var(--theme-text-secondary)' }}>Type:</span>{' '}
              <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                {tempProject.buildingType === 'high-school' ? 'High School' :
                 tempProject.buildingType === 'middle' ? 'Middle School' :
                 tempProject.buildingType === 'elementary' ? 'Elementary School' :
                 tempProject.buildingType || 'Not set'}
              </span>
            </div>
            <div className="text-sm">
              <span style={{ color: 'var(--theme-text-secondary)' }}>Construction:</span>{' '}
              <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                {tempProject.constructionType === 'timber' ? 'Mass Timber' :
                 tempProject.constructionType === 'concrete' ? 'Concrete' :
                 tempProject.constructionType === 'steel' ? 'Steel' :
                 tempProject.constructionType || 'Not set'}
              </span>
            </div>
            <div className="text-sm">
              <span style={{ color: 'var(--theme-text-secondary)' }}>Procurement:</span>{' '}
              <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                {tempProject.procurementMethod === 'gmax' ? 'GMAX' :
                 tempProject.procurementMethod === 'cmar' ? 'CMAR' :
                 tempProject.procurementMethod === 'bid' ? 'BID' :
                 tempProject.procurementMethod || 'Not set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ProjectBuilderProProps {
  onNavigate?: (view: 'projects') => void
}

export function ProjectBuilderPro({ onNavigate }: ProjectBuilderProProps) {
  const { colors } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  
  // Shared project state that all steps can update
  const [tempProject, setTempProject] = useState<ProjectBuilderTempProject>({
    projectName: '',
    projectType: '',
    buildingType: '',
    constructionType: '',
    procurementMethod: '',
    leedCost: 0,
    constructionYear: new Date().getFullYear(),
    facilityOption: null,
    siteCosts: 0,
    spaceCosts: 0,
    totalSquareFootage: 0,
    numberOfPods: 0,
    projectPods: [],
    customPods: [],
    phases: [
      {
        id: 'procurement',
        name: 'Procurement',
        duration: 6,
        cost: 0 // Cost will be calculated as % of project base cost
      },
      {
        id: 'design',
        name: 'Design',
        duration: 12,
        cost: 0 // Cost will be calculated as % of project base cost
      },
      {
        id: 'construction',
        name: 'Construction',
        duration: 24,
        cost: 0 // Cost will be calculated as % of project base cost
      }
    ],
    inflationRate: 3.5,
    baseCost: 0,
    totalDuration: 0,
    inflationAmount: 0,
    totalCost: 0
  })
  
  // Calculate totals whenever tempProject changes
  const totalDuration = tempProject.phases.reduce((sum, phase) => sum + phase.duration, 0)

  // Base cost is building cost + site + spaces + LEED (does NOT include phase costs or pause costs)
  // Phase percentages are applied to this base cost in the Schedule component
  const projectBaseCost = tempProject.baseCost + tempProject.leedCost + tempProject.siteCosts + tempProject.spaceCosts

  // Only pause costs should be added (standard phase costs are percentages of projectBaseCost, not additions)
  // Pause phases have id starting with 'pause-'
  const pauseCosts = tempProject.phases
    .filter(phase => phase.id.startsWith('pause-'))
    .reduce((sum, phase) => sum + phase.cost, 0)

  const totalBaseCost = projectBaseCost + pauseCosts

  // Calculate inflation based on years from now until midpoint of construction
  const currentYear = new Date().getFullYear()
  const yearsUntilConstruction = tempProject.constructionYear - currentYear
  const constructionDurationYears = totalDuration / 12
  const yearsToMidpoint = yearsUntilConstruction + (constructionDurationYears / 2)

  // Apply compound inflation formula: FV = PV * (1 + r)^n
  const inflationMultiplier = Math.pow(1 + tempProject.inflationRate / 100, yearsToMidpoint)
  const totalCostWithInflation = Math.round((totalBaseCost * inflationMultiplier) / 1000) * 1000
  const inflationAmount = totalCostWithInflation - totalBaseCost

  // Update tempProject with calculated totals (don't update baseCost as it comes from Overview)
  useEffect(() => {
    setTempProject(prev => ({
      ...prev,
      totalDuration: totalDuration,
      inflationAmount: inflationAmount,
      totalCost: totalCostWithInflation
    }))
  }, [totalDuration, inflationAmount, totalCostWithInflation])

  // Define the steps for the project builder workflow
  const steps = [
    {
      id: 1,
      title: 'Project Overview',
      description: 'Define basic project information, type, and scope',
      icon: FileText,
      isCompleted: false,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: 'Location & Site',
      description: 'Select site location and site-specific requirements',
      icon: MapPin,
      isCompleted: false,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: 'Space Programming',
      description: 'Define spaces, square footage, and educational requirements',
      icon: Building2,
      isCompleted: false,
      isActive: currentStep === 3
    },
    {
      id: 4,
      title: 'Schedule & Phases',
      description: 'Set project timeline, phases, and milestone dates',
      icon: Calendar,
      isCompleted: false,
      isActive: currentStep === 4
    },
    {
      id: 5,
      title: 'Review & Finalize',
      description: 'Review all project details and generate final documentation',
      icon: CheckCircle,
      isCompleted: false,
      isActive: currentStep === 5
    }
  ]

  const getStepIcon = (step: typeof steps[0]) => {
    const IconComponent = step.icon
    if (step.isCompleted) {
      return <CheckCircle className="h-5 w-5" style={{ color: 'var(--theme-success)' }} />
    } else if (step.isActive) {
      return <IconComponent className="h-5 w-5" style={{ color: colors.secondary.skyBlue }} />
    } else {
      return <Circle className="h-5 w-5" style={{ color: 'var(--theme-text-tertiary)' }} />
    }
  }

  const getStepConnector = (index: number) => {
    return null
  }











  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--theme-bg)' }}>
      {/* Header with Progress */}
      <div className="px-6 py-4">
        {/* Project Stats - Live updates as user progresses */}
        <ProjectStatsCards
          totalBaseCost={totalBaseCost}
          inflationAmount={inflationAmount}
          inflationRate={tempProject.inflationRate}
          totalCostWithInflation={totalCostWithInflation}
          totalDuration={totalDuration}
          tempProject={tempProject}
        />

        <div className="flex items-center gap-4 mt-4">
          <div className="flex-shrink-0">
            {getStepIcon(steps[currentStep - 1])}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Step {currentStep}/{steps.length} {steps[currentStep - 1].title}</h2>
            <div className="w-full rounded-full h-2 mt-2" style={{ backgroundColor: 'var(--theme-muted-bg)' }}>
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentStep / steps.length) * 100}%`,
                  backgroundColor: colors.secondary.skyBlue
                }}
              />
            </div>
            <p className="text-sm mt-1" style={{ color: 'var(--theme-text-secondary)' }}>{steps[currentStep - 1].description}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            {currentStep < steps.length && (
              <Button
                onClick={handleNext}
                style={{ backgroundColor: colors.secondary.skyBlue, color: colors.primary.white }}
                className="gap-2"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Step Content */}
        <div className="h-full p-6 overflow-auto">
          <div className={`max-w-4xl mx-auto ${currentStep === 3 || currentStep === 5 ? 'p-0' : 'p-6'}`}>
            {currentStep === 1 ? <ProjectBuilderProProjectOverview tempProject={tempProject} setTempProject={setTempProject} /> :
             currentStep === 2 ? <ProjectBuilderProLocationSite tempProject={tempProject} setTempProject={setTempProject} /> :
             currentStep === 3 ? <ProjectBuilderProSpaceProgramming tempProject={tempProject} setTempProject={setTempProject} /> :
             currentStep === 4 ? <ProjectBuilderProSchedulePhases tempProject={tempProject} setTempProject={setTempProject} /> :
             currentStep === 5 ? <ProjectBuilderProReviewFinalize tempProject={tempProject} setTempProject={setTempProject} onNavigate={onNavigate} /> : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--theme-muted-bg)' }}>
                  <Building2 className="h-8 w-8" style={{ color: 'var(--theme-text-tertiary)' }} />
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--theme-text-primary)' }}>
                  Step Content Coming Soon
                </h3>
                <p className="max-w-md mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
                  This step's detailed interface will be implemented next. Each step will provide
                  detailed forms and tools for that phase of project creation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}