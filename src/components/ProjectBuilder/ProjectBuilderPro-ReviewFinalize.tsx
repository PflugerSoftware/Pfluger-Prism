import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import {
  CheckCircle,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Download,
  Clock,
  ChevronDown,
  ChevronUp,
  Save,
  AlertTriangle
} from 'lucide-react'
import { ProjectBuilderTempProject } from '../MainViews/ProjectBuilderPro'
import { useProjects } from '../System/ProjectsContext'
import { useFacilities } from '../System/FacilitiesContext'
import { Project } from '../../data/loadProjects'

interface ProjectBuilderProReviewFinalizeProps {
  tempProject: ProjectBuilderTempProject
  setTempProject: React.Dispatch<React.SetStateAction<ProjectBuilderTempProject>>
  onNavigate?: (view: 'projects') => void
}

export function ProjectBuilderProReviewFinalize({ tempProject, setTempProject, onNavigate }: ProjectBuilderProReviewFinalizeProps) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const { projects, addProject } = useProjects()
  const { addFacility, facilities, getFacilityById } = useFacilities()

  // Collapsible state for each card
  const [isOverviewOpen, setIsOverviewOpen] = useState(true)
  const [isLocationOpen, setIsLocationOpen] = useState(true)
  const [isSpaceOpen, setIsSpaceOpen] = useState(true)
  const [isScheduleOpen, setIsScheduleOpen] = useState(true)
  const [isCostOpen, setIsCostOpen] = useState(true)

  // Format address to remove extra details
  const formatAddress = (address: string) => {
    if (!address) return "No address selected"

    // Split by commas and trim each part
    const parts = address.split(',').map(s => s.trim())

    // Remove the first part if it looks like a place name (not a number)
    const startIndex = parts[0] && /^\d/.test(parts[0]) ? 0 : 1

    // Find state, zip, and country
    const stateIndex = parts.findIndex(p => p === 'Texas' || p.length === 2) // State
    const zipIndex = parts.findIndex(p => /^\d{5}/.test(p)) // ZIP code

    // Extract relevant parts: street number, street name, city, state, zip
    // Skip "County" and "United States"
    const relevantParts = []
    for (let i = startIndex; i < parts.length; i++) {
      const part = parts[i]
      if (part.includes('County') || part === 'United States') continue
      relevantParts.push(part)
    }

    return relevantParts.join(', ')
  }

  // Use calculated values from tempProject (calculated in ProjectBuilderPro)
  const totalBaseCost = tempProject.baseCost
  const totalCostWithInflation = tempProject.totalCost
  const escalation = tempProject.inflationAmount
  const costPerSquareFoot = tempProject.totalSquareFootage > 0
    ? Math.round(totalCostWithInflation / tempProject.totalSquareFootage)
    : 0

  // Check location consistency for renovation/addition/equity projects
  const isRenovationType = tempProject.projectType === 'renovations' ||
                           tempProject.projectType === 'additions' ||
                           tempProject.projectType === 'equity-improvements'
  const selectedFacility = tempProject.selectedFacilityId ? getFacilityById(tempProject.selectedFacilityId) : null
  const locationMismatch = isRenovationType && selectedFacility &&
                           selectedFacility.address &&
                           tempProject.address &&
                           selectedFacility.address !== tempProject.address

  // Mock data from all previous steps - in real app this would come from state/context
  const projectData = {
    // Step 1: Project Overview
    overview: {
      projectName: tempProject.projectName || "Liberty Hill Elementary Expansion",
      projectType: tempProject.projectType || "New Construction",
      buildingType: tempProject.buildingType || "Elementary School",
      targetCapacity: 850,
      projectPriority: "High",
      estimatedDuration: `${tempProject.totalDuration || 0} months`,
      projectDescription: "Expansion of existing elementary school to accommodate growing student population with modern educational facilities including STEM labs, competition gymnasium, and flexible learning spaces."
    },

    // Step 2: Location & Site
    location: {
      siteName: tempProject.projectName || "Project Site",
      address: formatAddress(tempProject.address || ""),
      latitude: tempProject.latitude,
      longitude: tempProject.longitude,
      siteArea: tempProject.siteAcreage ? `${tempProject.siteAcreage} acres` : "Not specified",
      siteCosts: tempProject.siteCosts || 0,
      soilConditions: "Clay/Rock",
      utilities: ["Water", "Sewer", "Electric", "Gas", "Fiber"],
      siteChallenges: ["Slope variations", "Existing tree preservation"],
      parkingSpaces: 125,
      accessibility: "Full ADA compliance"
    },

    // Step 3: Space Programming
    spaceProgramming: {
      totalSquareFootage: tempProject.totalSquareFootage || 0,
      numberOfPods: tempProject.numberOfPods || 0,
      totalSpaces: 28,
      pods: [
        {
          name: "Academic Wing Pod",
          spaces: 15,
          squareFootage: 18900,
          cost: 1129000
        },
        {
          name: "Athletics Pod",
          spaces: 8,
          squareFootage: 4800,
          cost: 1300000
        },
        {
          name: "Dining Pod",
          spaces: 5,
          squareFootage: 2800,
          cost: 1075000
        }
      ],
      totalSpaceCost: tempProject.spaceCosts || 3504000
    },

    // Step 4: Schedule & Phases - Use actual data from tempProject
    schedule: {
      totalDuration: `${tempProject.totalDuration || 0} months`,
      phases: tempProject.phases.map(phase => ({
        name: phase.name,
        duration: `${phase.duration} months`,
        cost: phase.cost
      })),
      pausePhases: tempProject.phases.filter(p => p.id.startsWith('pause')).length,
      startDate: "January 2025",
      completionDate: "June 2028"
    },

    // Step 5: Cost Summary - Use calculated values from tempProject
    costs: {
      baseCost: totalBaseCost,
      siteCosts: tempProject.siteCosts || 0,
      spaceCosts: tempProject.spaceCosts || 0,
      leedCosts: tempProject.leedCost || 0,
      phaseCosts: tempProject.phases.reduce((sum, phase) => sum + phase.cost, 0),
      contingency: Math.round(totalBaseCost * 0.15), // 15% contingency
      escalation: escalation,
      totalProjectCost: totalCostWithInflation,
      costPerSquareFoot: costPerSquareFoot
    }
  }

  const handleGenerateReport = () => {
    setIsGeneratingReport(true)
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false)
      // In real app, this would trigger file download
    }, 2000)
  }

  const handleSaveProject = async () => {
    setIsSaving(true)

    try {
      let facilityId: number | undefined = undefined

      // Handle facility creation/linking
      if (tempProject.projectType === 'new-construction') {
        // For new construction, always create a new facility
        const newFacility = await addFacility({
          name: tempProject.projectName || 'New Facility',
          facility_type: tempProject.buildingType === 'high-school' ? 'High School' :
                        tempProject.buildingType === 'middle' ? 'Middle' :
                        tempProject.buildingType === 'elementary' ? 'Elementary' : 'Specialty',
          address: tempProject.address,
          latitude: tempProject.latitude,
          longitude: tempProject.longitude,
          current_enrollment: 0,
          capacity: 0,
          status: 'Planned'
        })
        // Get the ID from the newly created facility
        facilityId = newFacility.id
      } else if (tempProject.selectedFacilityId) {
        // For renovations/additions/equity, link to the selected existing facility
        facilityId = tempProject.selectedFacilityId
      }

      // Generate new project ID (max existing ID + 1)
      const maxId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) : 0
      const newProjectId = maxId + 1

      // Get current date for lastModified
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

      // Map project type
      const projectTypeMap: Record<string, string> = {
        'new-construction': 'New Construction',
        'renovations': 'Renovations',
        'additions': 'Additions',
        'equity-improvements': 'Equity',
        'specialty': 'Specialty'
      }

      // Map building type
      const buildingTypeMap: Record<string, string> = {
        'high-school': 'High School',
        'middle': 'Middle School',
        'elementary': 'Elementary',
        'specialty': 'Specialty'
      }

      // Calculate start and completion dates
      // Use the projectStartDate from tempProject if available, otherwise use current date + 6 months
      const startDate = tempProject.projectStartDate ? new Date(tempProject.projectStartDate) : new Date()
      if (!tempProject.projectStartDate) {
        startDate.setMonth(startDate.getMonth() + 6) // Add 6 months for procurement if no start date set
      }
      const completionDate = new Date(startDate)
      completionDate.setMonth(completionDate.getMonth() + tempProject.totalDuration)

      const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      }

      // Extract phase durations and costs from tempProject.phases
      const procurementPhase = tempProject.phases.find(p => p.id === 'procurement')
      const designPhase = tempProject.phases.find(p => p.id === 'design')
      const constructionPhase = tempProject.phases.find(p => p.id === 'construction')

      // Extract pause phases for JSON storage
      const pausePhases = tempProject.phases.filter(p => p.id.startsWith('pause'))


      // Create new project object
      const newProject: Project = {
        id: newProjectId,
        name: tempProject.projectName || 'Untitled Project',
        buildingType: buildingTypeMap[tempProject.buildingType] || 'Not Specified',
        projectType: projectTypeMap[tempProject.projectType] || 'New Construction',
        costEstimate: tempProject.totalCost,
        lastModified: currentDate,
        status: 'Draft',
        squareFootage: tempProject.totalSquareFootage,
        address: tempProject.address || 'Address TBD',
        siteArea: tempProject.siteAcreage ? `${tempProject.siteAcreage} acres` : 'Not specified',
        capacity: 0, // Not captured in builder yet
        duration: `${tempProject.totalDuration} months`,
        startDate: formatDate(startDate),
        completionDate: formatDate(completionDate),
        baseCost: tempProject.baseCost + tempProject.spaceCosts,
        siteCosts: tempProject.siteCosts,
        designCosts: designPhase?.cost || 0,
        contingency: Math.round(tempProject.totalCost * 0.15),
        latitude: tempProject.latitude,
        longitude: tempProject.longitude,
        facility_id: facilityId, // Link to facility
        // Phase data for Gantt chart
        procurementPhaseDuration: procurementPhase?.duration || 0,
        procurementPhaseCost: procurementPhase?.cost || 0,
        designPhaseDuration: designPhase?.duration || 0,
        designPhaseCost: designPhase?.cost || 0,
        constructionPhaseDuration: constructionPhase?.duration || 0,
        constructionPhaseCost: constructionPhase?.cost || 0,
        // Save pause phases as JSON
        projectPauses: pausePhases.length > 0 ? JSON.stringify(pausePhases) : undefined,
        // Auto-generate elemental costs by dividing total cost by 12
        elementalCosts: (() => {
          const costPerElement = tempProject.totalCost / 12
          const costPerSF = tempProject.totalSquareFootage > 0 ? costPerElement / tempProject.totalSquareFootage : 0
          return [
            { code: 'A1', name: 'Substructure', costPerSF, cost: costPerElement },
            { code: 'A2', name: 'Structure', costPerSF, cost: costPerElement },
            { code: 'A3', name: 'Enclosure', costPerSF, cost: costPerElement },
            { code: 'B1', name: 'Partitions & Doors', costPerSF, cost: costPerElement },
            { code: 'B2', name: 'Finishes', costPerSF, cost: costPerElement },
            { code: 'B3', name: 'Fittings & Equipment', costPerSF, cost: costPerElement },
            { code: 'C1', name: 'Mechanical', costPerSF, cost: costPerElement },
            { code: 'C2', name: 'Electrical', costPerSF, cost: costPerElement },
            { code: 'C3', name: 'Site Work', costPerSF, cost: costPerElement },
            { code: 'D2', name: 'Ancillary Work', costPerSF, cost: costPerElement },
            { code: 'Z1', name: 'General Requirements', costPerSF, cost: costPerElement },
            { code: 'Z2', name: 'Contingency', costPerSF, cost: costPerElement },
          ]
        })()
      }

      // Add project to context
      await addProject(newProject)

      // Simulate saving delay
      setTimeout(() => {
        setIsSaving(false)
        // Navigate back to projects view
        if (onNavigate) {
          onNavigate('projects')
        }
      }, 1500)
    } catch (error) {
      setIsSaving(false)
      // TODO: Show error message to user
    }
  }

  return (
    <div className="h-full">
      {/* Main Content Area */}
      <div className="overflow-auto">
        <div className="space-y-6">
          
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Project Creation Complete</h2>
                  <p className="text-gray-600">Review your project details and finalize documentation</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                  style={{
                    backgroundColor: isButtonHovered ? 'rgba(22, 163, 74, 1)' : 'rgba(22, 163, 74, 0.5)',
                    color: isButtonHovered ? 'white' : 'black',
                    transform: isButtonHovered ? 'translateY(-1px)' : 'translateY(0)',
                    boxShadow: isButtonHovered ? '0 4px 12px rgba(22, 163, 74, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.15s ease-out'
                  }}
                >
                  {isSaving ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </div>

            <Alert className="bg-white border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle className="text-green-800">Project Ready for Approval</AlertTitle>
              <AlertDescription className="text-green-700">
                All required information has been collected and validated. Your project is ready for stakeholder review and board approval.
              </AlertDescription>
            </Alert>
          </div>

          {/* Project Summary Cards */}
          <div className="space-y-6">
            {/* Project Overview Card */}
            <Card>
              <Collapsible open={isOverviewOpen} onOpenChange={setIsOverviewOpen}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Overview
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-blue-900">{projectData.overview.projectName}</div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isOverviewOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 mt-1">{projectData.overview.projectDescription}</p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Project Type</div>
                          <div className="font-medium">{projectData.overview.projectType}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Building Type</div>
                          <div className="font-medium">{projectData.overview.buildingType}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Total Cost</div>
                          <div className="font-medium">${projectData.costs.totalProjectCost.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Duration</div>
                          <div className="font-medium">{tempProject.totalDuration} months</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Square Footage</div>
                          <div className="font-medium">{projectData.spaceProgramming.totalSquareFootage.toLocaleString()} SF</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Capacity</div>
                          <div className="font-medium">{projectData.overview.targetCapacity} students</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Location Consistency Warning */}
            {locationMismatch && (
              <Alert className="mb-4" style={{ backgroundColor: 'var(--theme-warning-bg)', borderColor: 'var(--theme-warning-border)' }}>
                <AlertDescription className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--theme-warning)' }} />
                  <div>
                    <div className="font-medium mb-1" style={{ color: 'var(--theme-warning)' }}>Location Difference Detected</div>
                    <p className="text-sm" style={{ color: 'var(--theme-warning-text)' }}>
                      The project location differs from the facility location.
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--theme-warning-text)' }}>
                      <strong>Facility:</strong> {selectedFacility?.address}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--theme-warning-text)' }}>
                      <strong>Project:</strong> {tempProject.address}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Location & Site Card */}
            <Card>
              <Collapsible open={isLocationOpen} onOpenChange={setIsLocationOpen}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location & Site
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">{projectData.location.siteName}</div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isLocationOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Address</div>
                        <div className="font-medium">{projectData.location.address}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Site Area</div>
                          <div className="font-medium">{projectData.location.siteArea}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Site Costs</div>
                          <div className="font-medium">${projectData.location.siteCosts.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Space Programming Card */}
            <Card>
              <Collapsible open={isSpaceOpen} onOpenChange={setIsSpaceOpen}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Space Programming
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">{projectData.spaceProgramming.totalSquareFootage.toLocaleString()} SF • {projectData.spaceProgramming.numberOfPods} Pods</div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isSpaceOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded">
                          <div className="text-2xl font-bold text-blue-700">{projectData.spaceProgramming.totalSquareFootage.toLocaleString()}</div>
                          <div className="text-xs text-blue-600">Total SF</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded">
                          <div className="text-2xl font-bold text-green-700">{projectData.spaceProgramming.numberOfPods}</div>
                          <div className="text-xs text-green-600">Pods</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded">
                          <div className="text-2xl font-bold text-purple-700">{projectData.spaceProgramming.totalSpaces}</div>
                          <div className="text-xs text-purple-600">Spaces</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {projectData.spaceProgramming.pods.map((pod, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium text-sm">{pod.name}</div>
                              <div className="text-xs text-gray-600">{pod.spaces} spaces • {pod.squareFootage.toLocaleString()} SF</div>
                            </div>
                            <div className="text-sm font-semibold">${pod.cost.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Schedule & Timeline Card */}
            <Card>
              <Collapsible open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Schedule & Timeline
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">{tempProject.totalDuration} months • {tempProject.phases.length} Phases</div>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          {isScheduleOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Project Duration</div>
                          <div className="font-medium">{projectData.schedule.totalDuration}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Construction Phases</div>
                          <div className="font-medium">{projectData.schedule.phases.length}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Start Date</div>
                          <div className="font-medium">{projectData.schedule.startDate}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Completion Date</div>
                          <div className="font-medium">{projectData.schedule.completionDate}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {projectData.schedule.phases.map((phase, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                              <span className="font-medium">{phase.name}</span>
                              <span className="text-gray-600 ml-2">({phase.duration})</span>
                            </div>
                            <span className="font-semibold">${phase.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Cost Summary Section */}
          <Card className="border-2 border-green-200 bg-green-50">
            <Collapsible open={isCostOpen} onOpenChange={setIsCostOpen}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <DollarSign className="h-5 w-5" />
                    Final Cost Summary
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold text-green-800">${projectData.costs.totalProjectCost.toLocaleString()}</div>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isCostOpen ? (
                          <ChevronUp className="h-4 w-4 text-green-800" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-green-800" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      {/* List each phase cost dynamically */}
                      {tempProject.phases.map((phase, index) => (
                        <div key={phase.id} className="flex justify-between">
                          <span className="text-gray-700">{phase.name}:</span>
                          <span className="font-semibold">${phase.cost.toLocaleString()}</span>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-gray-700">Contingency (15%):</span>
                        <span className="font-semibold">${projectData.costs.contingency.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Escalation ({tempProject.inflationRate}%):</span>
                        <span className="font-semibold">${projectData.costs.escalation.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-green-800">Total Project Cost:</span>
                        <span className="font-bold text-green-800">${projectData.costs.totalProjectCost.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-green-700 mb-2">
                          ${projectData.costs.costPerSquareFoot}/SF
                        </div>
                        <div className="text-sm text-green-600">Cost per Square Foot</div>
                        <div className="text-xs text-gray-600 mt-1">
                          Based on {projectData.spaceProgramming.totalSquareFootage.toLocaleString()} SF
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

        </div>
      </div>
    </div>
  )
}