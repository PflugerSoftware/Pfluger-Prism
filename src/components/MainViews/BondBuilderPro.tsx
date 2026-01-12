import { useState, useEffect } from 'react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import {
  CheckCircle,
  Circle,
  ArrowRight,
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  DollarSign
} from 'lucide-react'
import { useTheme } from "../System/ThemeManager"
import { BondBuilderProBondInfo } from '../BondBuilder/BondBuilderPro-BondInfo'
import { BondBuilderProProjectSelection } from '../BondBuilder/BondBuilderPro-ProjectSelection'
import { BondBuilderProTimeline } from '../BondBuilder/BondBuilderPro-Timeline'
import { BondBuilderProReview } from '../BondBuilder/BondBuilderPro-Review'
import { loadProjects, Project as APIProject } from '../../data/loadProjects'

// Shared interfaces
export interface Project {
  id: string
  name: string
  type: 'new-construction' | 'renovation' | 'addition' | 'equity' | 'specialty'
  cost: number
  squareFootage?: number
  duration: number // in months
  status: 'ready' | 'draft' | 'incomplete'
  phases: {
    design: number // months
    bidding: number // months  
    construction: number // months
    closeout: number // months
  }
  startDate?: string // YYYY-MM format
  endDate?: string // YYYY-MM format
}

export interface Package {
  id: string
  name: string
  projects: Project[]
  totalCost: number
  dateRange: {
    start: number
    end: number
  }
}

// BondBuilderTempBond interface - temporary bond state during building
export interface BondBuilderTempBond {
  bondName: string
  bondDescription: string
  timelineYears: number
  bondStartYear: number // Year the bond will start (e.g., 2026)
  annualInflationRate: number // Annual inflation rate percentage for cost projections
  generalObligations: string[]
  selectedProjectIds: string[]
  // Financial calculation parameters
  interestRate: number // Annual interest rate percentage
  taxablePropertyValue: number // Total taxable property value in the district
  exampleHomeValue: number // Example property value for tax calculation
  targetBondAmount?: number // Optional manual override for target bond amount
}

// Mock available projects
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'New High School',
    type: 'new-construction',
    cost: 87500000,
    squareFootage: 350000,
    duration: 24,
    status: 'ready',
    phases: { design: 6, bidding: 2, construction: 15, closeout: 1 }
  },
  {
    id: '2', 
    name: 'Middle School HVAC & Interior Update',
    type: 'renovation',
    cost: 12800000,
    squareFootage: 180000,
    duration: 8,
    status: 'ready',
    phases: { design: 2, bidding: 1, construction: 4, closeout: 1 }
  },
  {
    id: '3',
    name: 'Elementary School - 12 Classroom Addition',
    type: 'addition', 
    cost: 8200000,
    squareFootage: 15000,
    duration: 12,
    status: 'draft',
    phases: { design: 3, bidding: 1, construction: 7, closeout: 1 }
  },
  {
    id: '4',
    name: 'District-Wide Safety & Playground Upgrades',
    type: 'equity',
    cost: 4500000,
    duration: 6,
    status: 'ready',
    phases: { design: 1, bidding: 1, construction: 3, closeout: 1 }
  },
  {
    id: '5',
    name: 'Competition Natatorium',
    type: 'specialty',
    cost: 15800000,
    squareFootage: 45000,
    duration: 18,
    status: 'incomplete',
    phases: { design: 4, bidding: 2, construction: 11, closeout: 1 }
  },
  {
    id: '6',
    name: 'Elementary School Roof Replacement',
    type: 'renovation',
    cost: 2100000,
    duration: 4,
    status: 'ready',
    phases: { design: 1, bidding: 1, construction: 2, closeout: 0 }
  },
  {
    id: '7',
    name: 'Athletic Complex Expansion',
    type: 'addition',
    cost: 22000000,
    squareFootage: 75000,
    duration: 18,
    status: 'ready',
    phases: { design: 4, bidding: 2, construction: 11, closeout: 1 }
  },
  {
    id: '8',
    name: 'Technology Infrastructure Upgrade',
    type: 'equity',
    cost: 6200000,
    duration: 10,
    status: 'ready',
    phases: { design: 2, bidding: 1, construction: 6, closeout: 1 }
  }
]

interface BondBuilderProProps {
  onNavigate?: (view: 'my-bonds') => void
}

export function BondBuilderPro({ onNavigate }: BondBuilderProProps = {}) {
  const { colors, themeColors } = useTheme()
  const [currentStep, setCurrentStep] = useState(1)
  const [availableProjects, setAvailableProjects] = useState<Project[]>(mockProjects)
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  // Shared bond state that all steps can update
  const [tempBond, setTempBond] = useState<BondBuilderTempBond>({
    bondName: '',
    bondDescription: '',
    timelineYears: 10,
    bondStartYear: new Date().getFullYear() + 1, // Default to next year
    annualInflationRate: 3.5, // 3.5% default inflation rate
    generalObligations: [],
    selectedProjectIds: [],
    interestRate: 4.5,
    taxablePropertyValue: 5000000000, // $5 billion default
    exampleHomeValue: 350000 // $350k default
  })

  // Timeline-specific state
  const [timelineProjects, setTimelineProjects] = useState<Project[]>([])
  const [packages, setPackages] = useState<Package[]>([])

  // Load projects from API on mount
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoadingProjects(true)
      try {
        const loadedProjects = await loadProjects()
        if (loadedProjects.length > 0) {
          // Convert API projects to Bond Builder format
          const convertedProjects: Project[] = loadedProjects.map(apiProject => ({
            id: apiProject.id.toString(),
            name: apiProject.name,
            type: convertProjectType(apiProject.projectType),
            cost: apiProject.costEstimate,
            squareFootage: apiProject.squareFootage,
            duration: parseInt(apiProject.duration) || 12, // Extract months from duration string
            status: convertStatus(apiProject.status),
            phases: {
              design: 3,
              bidding: 1,
              construction: 6,
              closeout: 1
            }
          }))
          setAvailableProjects(convertedProjects)
        }
      } catch (error) {
        // Keep using mockProjects as fallback
      } finally {
        setIsLoadingProjects(false)
      }
    }

    fetchProjects()
  }, [])

  // Convert API project type to Bond Builder type
  const convertProjectType = (apiType: string): Project['type'] => {
    const typeMap: Record<string, Project['type']> = {
      'New Construction': 'new-construction',
      'Renovations': 'renovation',
      'Renovation': 'renovation',
      'Addition': 'addition',
      'Additions': 'addition',
      'Equity Improvements': 'equity',
      'Equity': 'equity',
      'Specialty': 'specialty'
    }
    return typeMap[apiType] || 'new-construction'
  }

  // Convert API status to Bond Builder status
  const convertStatus = (apiStatus: string): Project['status'] => {
    const statusMap: Record<string, Project['status']> = {
      'Complete': 'ready',
      'In Progress': 'draft',
      'Draft': 'draft',
      'Planning': 'incomplete'
    }
    return statusMap[apiStatus] || 'ready'
  }

  // Define the steps for the bond builder workflow
  const steps = [
    {
      id: 1,
      title: 'Bond Information',
      description: 'Define bond details, timeline, and general obligations',
      icon: FileText,
      isCompleted: false,
      isActive: currentStep === 1
    },
    {
      id: 2,
      title: 'Project Selection',
      description: 'Choose which projects to include in the bond',
      icon: Building2,
      isCompleted: false,
      isActive: currentStep === 2
    },
    {
      id: 3,
      title: 'Timeline',
      description: 'Arrange projects on the bond timeline',
      icon: Calendar,
      isCompleted: false,
      isActive: currentStep === 3
    },
    {
      id: 4,
      title: 'Review & Finalize',
      description: 'Review bond package and generate documentation',
      icon: ClipboardCheck,
      isCompleted: false,
      isActive: currentStep === 4
    }
  ]

  const getStepIcon = (step: typeof steps[0]) => {
    const IconComponent = step.icon
    if (step.isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-600" />
    } else if (step.isActive) {
      return <IconComponent className="h-5 w-5" style={{ color: colors.secondary.skyBlue }} />
    } else {
      return <Circle className="h-5 w-5 text-gray-400" />
    }
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

  // Calculate summary stats
  const selectedProjects = availableProjects.filter(p => 
    tempBond.selectedProjectIds.includes(p.id)
  )
  const currentYear = new Date().getFullYear()
  const yearsUntilStart = tempBond.bondStartYear - currentYear
  const inflationMultiplier = Math.pow(1 + tempBond.annualInflationRate / 100, yearsUntilStart)
  const totalBaseCost = selectedProjects.reduce((sum, p) => sum + p.cost, 0)
  const totalCost = totalBaseCost * inflationMultiplier
  
  // Calculate total interest over bond term
  const calculateTotalInterest = () => {
    const principal = totalCost
    const rate = tempBond.interestRate / 100
    const years = tempBond.timelineYears
    return principal * rate * (years + 1) / 2
  }
  
  const totalInterest = calculateTotalInterest()
  const totalCostWithInterest = totalCost + totalInterest
  const inflationCost = totalCost - totalBaseCost

  // State for expandable cost card
  const [isCostExpanded, setIsCostExpanded] = useState(false)

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: themeColors.appBg }}>
      {/* Header with Progress */}
      <div className="px-6 py-4 flex-shrink-0">
        {/* Bond Stats - Live updates as user progresses */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Bond Total Card - First position */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setIsCostExpanded(!isCostExpanded)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">
                    Bond Total {yearsUntilStart > 0 && `(${tempBond.bondStartYear})`}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  {isCostExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              <div className="text-xl font-semibold text-green-600">
                ${(totalCostWithInterest / 1000000).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Base: ${(totalBaseCost / 1000000).toFixed(1)}M + ${(inflationCost / 1000000).toFixed(1)}M inflation
              </div>

              {isCostExpanded && (
                <div className="mt-3 space-y-1.5 pt-2 border-t">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Base Projects:</span>
                    <span className="font-medium">${(totalBaseCost / 1000000).toFixed(1)}M</span>
                  </div>

                  {yearsUntilStart > 0 && inflationCost > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Inflation Impact:</span>
                      <span className="font-medium text-orange-600">+${(inflationCost / 1000000).toFixed(1)}M</span>
                    </div>
                  )}

                  {totalInterest > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Interest Cost:</span>
                      <span className="font-medium text-blue-600">+${(totalInterest / 1000000).toFixed(1)}M</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs pt-1.5 mt-1.5 border-t">
                    <span className="text-gray-600">Total Cost:</span>
                    <span className="font-semibold text-green-600">${(totalCostWithInterest / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* General Obligations Card - Second position */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Obligations</span>
              </div>
              <div className="text-xl font-semibold text-purple-600">
                {tempBond.generalObligations.length || 0}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {tempBond.generalObligations.length === 1 ? 'Type configured' : 'Types configured'}
              </div>
            </CardContent>
          </Card>

          {/* Timeline Card - Third position */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Timeline</span>
              </div>
              {(() => {
                const projectsWithDates = timelineProjects.filter(p => p.startDate && p.endDate)
                if (projectsWithDates.length > 0) {
                  const startYears = projectsWithDates.map(p => parseInt(p.startDate!.split('-')[0]))
                  const endYears = projectsWithDates.map(p => parseInt(p.endDate!.split('-')[0]))
                  const minYear = Math.min(...startYears)
                  const maxYear = Math.max(...endYears)
                  const constructionYears = maxYear - minYear + 1
                  return (
                    <>
                      <div className="text-xl font-semibold text-blue-600">
                        {minYear}-{maxYear}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {constructionYears} years construction • {tempBond.timelineYears}-year bond
                      </div>
                    </>
                  )
                }
                return (
                  <>
                    <div className="text-xl font-semibold text-blue-600">
                      {tempBond.timelineYears} years
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Starting in {tempBond.bondStartYear}
                    </div>
                  </>
                )
              })()}
            </CardContent>
          </Card>

          {/* Projects Card - Fourth position */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-cyan-600" />
                <span className="text-sm text-gray-600">
                  {currentStep === 3 ? 'Projects on Timeline' : 'Projects'}
                </span>
              </div>
              <div className="text-xl font-semibold text-cyan-600">
                {currentStep === 3 ? timelineProjects.length : tempBond.selectedProjectIds.length}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {(() => {
                  const count = currentStep === 3 ? timelineProjects.length : tempBond.selectedProjectIds.length
                  return count === 1 ? 'Project selected' : 'Projects selected'
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center gap-4 mt-4">
          <div className="flex-shrink-0">
            {getStepIcon(steps[currentStep - 1])}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold">Step {currentStep}/{steps.length}: {steps[currentStep - 1].title}</h2>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(currentStep / steps.length) * 100}%`,
                  backgroundColor: colors.secondary.skyBlue
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">{steps[currentStep - 1].description}</p>
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
            <Button
              onClick={handleNext}
              disabled={currentStep === steps.length}
              style={{ backgroundColor: colors.secondary.skyBlue, color: colors.primary.white }}
              className="gap-2"
            >
              {currentStep === steps.length ? 'Finish' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Step Content */}
        {currentStep === 3 ? (
          // Step 3 (Timeline) - No Card wrapper, full height layout
          <div className="h-full">
            <BondBuilderProTimeline 
              tempBond={tempBond} 
              setTempBond={setTempBond} 
              availableProjects={availableProjects} 
              timelineProjects={timelineProjects} 
              setTimelineProjects={setTimelineProjects} 
              packages={packages} 
              setPackages={setPackages} 
            />
          </div>
        ) : (
          <div className="h-full p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {currentStep === 1 ? <BondBuilderProBondInfo tempBond={tempBond} setTempBond={setTempBond} /> : 
               currentStep === 2 ? <BondBuilderProProjectSelection tempBond={tempBond} setTempBond={setTempBond} availableProjects={availableProjects} /> :
               currentStep === 4 ? <BondBuilderProReview tempBond={tempBond} setTempBond={setTempBond} availableProjects={timelineProjects.length > 0 ? timelineProjects : availableProjects} packages={packages} onNavigate={onNavigate} /> : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Step Content Coming Soon
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    This step's detailed interface will be implemented next.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
