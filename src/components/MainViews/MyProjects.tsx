import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Building2,
  Plus,
  BarChart3,
  School,
  GraduationCap,
  FileText,
  MapPin,
  Calendar,
  DollarSign,
  Download,
  TrendingUp,
  GitCompare,
  Maximize2,
  Search,
  Filter
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Separator } from "../ui/separator"
import { ProjectHero } from "../MainCards/ProjectCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Checkbox } from "../ui/checkbox"
import { ProjectCompare } from "../MyProjects/ProjectCompare"
import { loadProjects, Project } from "../../data/loadProjects"
import { HeroCard } from "../MainCards"
import { useProjects } from "../System/ProjectsContext"
import { useFacilities } from "../System/FacilitiesContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

interface MyProjectsProps {
  onNavigate?: (view: 'bond-builder' | 'project-builder' | 'my-facilities') => void
  isSidebarExpanded?: boolean
  onOpenProjectSidebar?: (project: Project) => void
}

// Mock data for projects (fallback)
const mockProjects: Project[] = [
  {
    id: 1,
    name: "Liberty Hill High School Renovation",
    buildingType: "High School",
    projectType: "Renovations",
    costEstimate: 15500000,
    lastModified: "2 days ago",
    status: "In Progress",
    squareFootage: 285000,
    address: "15200 W State Hwy 29, Liberty Hill, TX 78642",
    siteArea: "75 acres",
    capacity: 1850,
    duration: "28 months",
    startDate: "March 2025",
    completionDate: "July 2027",
    baseCost: 12500000,
    siteCosts: 1200000,
    designCosts: 950000,
    contingency: 850000,
    elementalCosts: [
      { code: 'A1', name: 'Substructure', costPerSF: 25, cost: 1125000 },
      { code: 'A2', name: 'Structure', costPerSF: 60, cost: 2700000 },
      { code: 'A3', name: 'Enclosure', costPerSF: 120, cost: 5400000 },
      { code: 'B1', name: 'Partitions & Doors', costPerSF: 50, cost: 2250000 },
      { code: 'B2', name: 'Finishes', costPerSF: 40, cost: 1800000 },
      { code: 'B3', name: 'Fittings & Equipment', costPerSF: 62, cost: 2790000 },
      { code: 'C1', name: 'Mechanical', costPerSF: 81, cost: 3645000 },
      { code: 'C2', name: 'Electrical', costPerSF: 30, cost: 1350000 },
      { code: 'C3', name: 'Site Work', costPerSF: 15, cost: 675000 },
      { code: 'D2', name: 'Ancillary Work', costPerSF: 5, cost: 225000 },
      { code: 'Z1', name: 'General Requirements', costPerSF: 17, cost: 765000 },
      { code: 'Z2', name: 'Contingency', costPerSF: 15, cost: 675000 }
    ]
  },
  {
    id: 2,
    name: "Cedar Park Elementary Addition",
    buildingType: "Elementary",
    projectType: "Additions",
    costEstimate: 8200000,
    lastModified: "1 week ago",
    status: "Draft",
    squareFootage: 42500,
    address: "12800 County Road 175, Cedar Park, TX 78613",
    siteArea: "18 acres",
    capacity: 650,
    duration: "18 months",
    startDate: "June 2025",
    completionDate: "December 2026",
    baseCost: 6500000,
    siteCosts: 750000,
    designCosts: 580000,
    contingency: 370000
  },
  {
    id: 3,
    name: "Sports Complex Expansion",
    buildingType: "Specialty",
    projectType: "New Construction",
    costEstimate: 12800000,
    lastModified: "3 days ago",
    status: "Complete",
    squareFootage: 65000,
    address: "16789 Highway 29, Liberty Hill, TX 78642",
    siteArea: "45 acres",
    capacity: 2500,
    duration: "22 months",
    startDate: "January 2024",
    completionDate: "November 2025",
    baseCost: 9800000,
    siteCosts: 1350000,
    designCosts: 820000,
    contingency: 830000
  },
  {
    id: 4,
    name: "Middle School HVAC Upgrade",
    buildingType: "Middle",
    projectType: "Equity Improvements",
    costEstimate: 2100000,
    lastModified: "5 days ago",
    status: "In Progress",
    squareFootage: 145000,
    address: "10500 Ranch Road 620, Austin, TX 78726",
    siteArea: "28 acres",
    capacity: 950,
    duration: "12 months",
    startDate: "February 2025",
    completionDate: "February 2026",
    baseCost: 1650000,
    siteCosts: 180000,
    designCosts: 150000,
    contingency: 120000
  }
]


const buildingTypeColors = {
  "Elementary": "bg-green-100 text-green-800",
  "Middle": "bg-blue-100 text-blue-800", 
  "High School": "bg-purple-100 text-purple-800",
  "Specialty": "bg-orange-100 text-orange-800"
}

const statusColors = {
  "Draft": "bg-gray-100 text-gray-800",
  "In Progress": "bg-yellow-100 text-yellow-800",
  "Complete": "bg-green-100 text-green-800"
}

export function MyProjects({ onNavigate, isSidebarExpanded = false, onOpenProjectSidebar }: MyProjectsProps = {}) {
  const { projects } = useProjects() // Use projects from context
  const { facilities } = useFacilities() // Use facilities from context

  // Local state for modals (export, stats) - NOT for detail sidebar
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false)
  const [escalationYear, setEscalationYear] = useState(2026)
  const [escalationRate, setEscalationRate] = useState(3.5)
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [selectedProjectsForCompare, setSelectedProjectsForCompare] = useState<number[]>([])
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProjectType, setSelectedProjectType] = useState<string>('All')
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('All')
  const [groupByFacility, setGroupByFacility] = useState(false)

  // Loading state is handled by the context now
  const isLoading = projects.length === 0

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handleViewProject = (project: Project) => {
    // Call the callback from App level
    if (onOpenProjectSidebar) {
      onOpenProjectSidebar(project)
    }
  }

  const handleExportEstimate = () => {
    if (!selectedProject) return

    // Create CSV content
    const csvContent = `Liberty Hill ISD - Project Estimate
Project: ${selectedProject.name}
Building Type: ${selectedProject.buildingType}
Square Footage: ${selectedProject.squareFootage.toLocaleString()} SF
Total Cost: ${selectedProject.costEstimate.toLocaleString()}
Cost per SF: ${Math.round(selectedProject.costEstimate / selectedProject.squareFootage)}

Elemental Cost Summary
Code,Element,Cost/SF,Cost
${selectedProject.elementalCosts?.map(item => `${item.code},${item.name},${item.costPerSF},${item.cost}`).join('\n')}
`

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedProject.name.replace(/\s+/g, '_')}_Estimate.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const calculateEscalatedCost = () => {
    if (!selectedProject) return 0
    const currentYear = 2025
    const yearDiff = escalationYear - currentYear
    const escalationMultiplier = Math.pow(1 + (escalationRate / 100), yearDiff)
    return Math.round(selectedProject.costEstimate * escalationMultiplier)
  }

  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode)
    if (isCompareMode) {
      setSelectedProjectsForCompare([])
    }
  }

  const handleToggleProjectForCompare = (projectId: number) => {
    if (selectedProjectsForCompare.includes(projectId)) {
      setSelectedProjectsForCompare(selectedProjectsForCompare.filter(id => id !== projectId))
    } else {
      setSelectedProjectsForCompare([...selectedProjectsForCompare, projectId])
    }
  }

  const handleOpenCompareDialog = () => {
    if (selectedProjectsForCompare.length > 0) {
      setIsCompareDialogOpen(true)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.buildingType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.status.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = selectedProjectType === 'All' || project.projectType === selectedProjectType

    const matchesFacility = selectedFacilityId === 'All' ||
      (selectedFacilityId === 'No Facility' ? !project.facility_id : project.facility_id === parseInt(selectedFacilityId))

    return matchesSearch && matchesType && matchesFacility
  })

  // Get unique project types for filter
  const projectTypes = ['All', ...Array.from(new Set(projects.map(p => p.projectType)))]

  // Helper function to get facility name by ID
  const getFacilityName = (facilityId?: number) => {
    if (!facilityId) return 'District-Wide Projects'
    const facility = facilities.find(f => f.id === facilityId)
    return facility?.name || 'Unknown Facility'
  }

  // Group projects by facility if grouping is enabled
  const groupedProjects = groupByFacility ? filteredProjects.reduce((acc, project) => {
    const facilityKey = project.facility_id ? project.facility_id.toString() : 'no-facility'
    if (!acc[facilityKey]) {
      acc[facilityKey] = []
    }
    acc[facilityKey].push(project)
    return acc
  }, {} as Record<string, Project[]>) : null

  // Calculate dynamic stats from actual project data
  const renovationCount = projects.filter(p => p.projectType === "Renovations").length
  const activeCount = projects.filter(p => p.status === "In Progress").length
  const totalValue = projects.reduce((sum, p) => sum + p.costEstimate, 0)
  const totalSF = projects.reduce((sum, p) => sum + p.squareFootage, 0)

  const quickStats = [
    {
      title: "Total Value",
      subtitle: "Current Portfolio",
      number: totalValue / 1000000,
      format: (val: number) => `$${val.toFixed(1)}M`,
      icon: DollarSign
    },
    {
      title: "Total Square Footage",
      subtitle: "All Projects Combined",
      number: totalSF / 1000000,
      format: (val: number) => `${val.toFixed(1)}M SF`,
      icon: Maximize2
    },
    {
      title: "Renovation Projects",
      subtitle: "Existing Building",
      number: renovationCount,
      icon: BarChart3
    },
    {
      title: "Active Projects",
      subtitle: "In Development",
      number: activeCount,
      icon: Building2
    }
  ]

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2">No projects yet</h3>
      <p className="text-muted-foreground mb-4">Create your first cost projection</p>
      <Button onClick={() => {}} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        Create New Project
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const iconColors = [
            "text-orange-600",
            "text-blue-600",
            "text-green-600",
            "text-purple-600"
          ]
          return (
            <HeroCard
              key={index}
              title={stat.title}
              icon={stat.icon}
              iconClassName={iconColors[index]}
              primaryValue={{
                value: stat.number,
                className: "text-gray-900",
                animate: true,
                format: stat.format
              }}
              footer={stat.subtitle}
            />
          )
        })}
      </div>

      {/* Filters Section */}
      <div className="space-y-3">
        {/* Project Type Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>Project Type:</span>
          <div className="flex gap-2">
            {projectTypes.map((type) => (
              <Button
                key={type}
                variant={selectedProjectType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProjectType(type)}
                className={selectedProjectType === type ? "bg-sky-blue hover:bg-lhisd-dark-blue" : ""}
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Facility Filter and Grouping */}
        <div className="flex items-center gap-4 p-3 rounded-lg border" style={{ backgroundColor: 'var(--theme-muted-bg)', borderColor: 'var(--theme-muted-bg)', opacity: 0.5 }}>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" style={{ color: 'var(--theme-text-secondary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>Facility:</span>
          </div>
          <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
            <SelectTrigger className="w-[280px] bg-white">
              <SelectValue placeholder="All Facilities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Facilities</SelectItem>
              <SelectItem value="No Facility">District-Wide Projects</SelectItem>
              {facilities
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((facility) => (
                  <SelectItem key={facility.id} value={facility.id.toString()}>
                    {facility.name}
                    <span className="ml-2 text-xs" style={{ color: 'var(--theme-text-tertiary)' }}>
                      ({facility.project_count || 0} {facility.project_count === 1 ? 'project' : 'projects'})
                    </span>
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button
            variant={groupByFacility ? "default" : "outline"}
            size="sm"
            onClick={() => setGroupByFacility(!groupByFacility)}
            className={groupByFacility ? "bg-sky-blue hover:bg-lhisd-dark-blue" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            {groupByFacility ? 'Grouped View' : 'Group by Facility'}
          </Button>
        </div>
      </div>

      {/* Projects Section Header */}
      <div className="flex items-center justify-between">
        <h2>Recent Projects</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects..." 
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isCompareMode && selectedProjectsForCompare.length > 0 && (
            <Button 
              onClick={handleOpenCompareDialog}
              className="bg-sky-blue hover:bg-lhisd-dark-blue"
            >
              <GitCompare className="h-4 w-4 mr-2" />
              Compare {selectedProjectsForCompare.length} Project{selectedProjectsForCompare.length !== 1 ? 's' : ''}
            </Button>
          )}
          <Button
            variant={isCompareMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleCompareMode}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {isCompareMode ? 'Cancel Compare' : 'Compare Projects'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.('my-facilities')}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Manage Facilities
          </Button>
          <Button
            size="sm"
            onClick={() => onNavigate?.('project-builder')}
            className="bg-sky-blue hover:bg-lhisd-dark-blue"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center">
          <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="mb-2">No projects found</h3>
          <p className="text-muted-foreground">Try a different search term or filter</p>
        </div>
      ) : groupByFacility && groupedProjects ? (
        // Grouped view by facility
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="popLayout">
            {Object.entries(groupedProjects).map(([facilityKey, facilityProjects], groupIndex) => {
              const facilityId = facilityKey === 'no-facility' ? undefined : parseInt(facilityKey)
              const facilityName = getFacilityName(facilityId)
              const facility = facilityId ? facilities.find(f => f.id === facilityId) : null

              return (
                <motion.div
                  key={facilityKey}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: groupIndex * 0.1
                  }}
                >
                  {/* Facility Header */}
                  <motion.div
                    className="flex items-center gap-3 pb-2 border-b-2"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, delay: groupIndex * 0.1 + 0.2 }}
                    style={{
                      transformOrigin: "left",
                      borderColor: 'var(--theme-muted-bg)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20 }}
                      >
                        <Building2 className="h-5 w-5" style={{ color: 'var(--theme-primary)' }} />
                      </motion.div>
                      <h3 className="text-xl font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{facilityName}</h3>
                    </div>
                    {facility && (
                      <motion.div
                        className="flex items-center gap-3 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: groupIndex * 0.1 + 0.3 }}
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {facility.facility_type}
                        </Badge>
                        <span>•</span>
                        <span>{facility.status}</span>
                        <span>•</span>
                        <span>{facilityProjects.length} {facilityProjects.length === 1 ? 'project' : 'projects'}</span>
                        <span>•</span>
                        <span className="font-medium" style={{ color: 'var(--theme-accent)' }}>
                          ${(facilityProjects.reduce((sum, p) => sum + p.costEstimate, 0) / 1000000).toFixed(1)}M total
                        </span>
                      </motion.div>
                    )}
                    {!facility && (
                      <motion.div
                        className="flex items-center gap-2 text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: groupIndex * 0.1 + 0.3 }}
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        <span>{facilityProjects.length} {facilityProjects.length === 1 ? 'project' : 'projects'}</span>
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Projects Grid for this Facility */}
                  <motion.div
                    className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: groupIndex * 0.1 + 0.3
                        }
                      }
                    }}
                  >
                    {facilityProjects.map((project) => (
                      <motion.div
                        key={project.id}
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          visible: {
                            opacity: 1,
                            scale: 1,
                            transition: {
                              type: "spring",
                              stiffness: 300,
                              damping: 24
                            }
                          }
                        }}
                      >
                        <ProjectHero
                          project={project}
                          onView={handleViewProject}
                          buildingTypeColors={buildingTypeColors}
                          statusColors={statusColors}
                          isCompareMode={isCompareMode}
                          isSelected={selectedProjectsForCompare.includes(project.id)}
                          onToggleSelect={() => handleToggleProjectForCompare(project.id)}
                          facilityName={facilityName}
                          showFacilityBadge={false} // Don't show badge in grouped view
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        // Standard grid view
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectHero
              key={project.id}
              project={project}
              onView={handleViewProject}
              buildingTypeColors={buildingTypeColors}
              statusColors={statusColors}
              isCompareMode={isCompareMode}
              isSelected={selectedProjectsForCompare.includes(project.id)}
              onToggleSelect={() => handleToggleProjectForCompare(project.id)}
              facilityName={getFacilityName(project.facility_id)}
              showFacilityBadge={true} // Show badge in standard view
            />
          ))}
        </div>
      )}



      {/* Project Stats Dialog */}
      <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
        <DialogContent className="sm:max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedProject?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedProject && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="cost-details">Cost Details</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-4">
                {/* Project Overview Card */}
                <Card className="mt-[0px] mr-[0px] mb-[20px] ml-[0px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Project Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-[0px] pr-[24px] pb-[16px] pl-[24px]">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Project Type</div>
                        <div className="font-medium">{selectedProject.projectType}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Building Type</div>
                        <div className="font-medium">{selectedProject.buildingType}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Capacity</div>
                        <div className="font-medium">{selectedProject.capacity.toLocaleString()} students</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <Badge
                          variant="secondary"
                          className={statusColors[selectedProject.status as keyof typeof statusColors]}
                        >
                          {selectedProject.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Cost per SF</div>
                        <div className="font-medium">${(selectedProject.costEstimate / selectedProject.squareFootage).toFixed(0)}/SF</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total GFA</div>
                        <div className="font-medium">{selectedProject.squareFootage.toLocaleString()} SF</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location & Site Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location & Site
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600">Address</div>
                        <div className="font-medium">{selectedProject.address}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Site Area</div>
                          <div className="font-medium">{selectedProject.siteArea}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Square Footage</div>
                          <div className="font-medium">{selectedProject.squareFootage.toLocaleString()} SF</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule & Timeline Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Schedule & Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Project Duration</div>
                        <div className="font-medium">{selectedProject.duration}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Start Date</div>
                        <div className="font-medium">{selectedProject.startDate}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600">Estimated Completion</div>
                        <div className="font-medium">{selectedProject.completionDate}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Summary Card */}
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <DollarSign className="h-5 w-5" />
                      Cost Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Base Construction Cost:</span>
                        <span className="font-semibold">${selectedProject.baseCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Site Development:</span>
                        <span className="font-semibold">${selectedProject.siteCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Design Services:</span>
                        <span className="font-semibold">${selectedProject.designCosts.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Contingency:</span>
                        <span className="font-semibold">${selectedProject.contingency.toLocaleString()}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg">
                        <span className="font-semibold text-green-800">Total Project Cost:</span>
                        <span className="font-bold text-green-800">${selectedProject.costEstimate.toLocaleString()}</span>
                      </div>
                      <div className="text-center pt-4">
                        <div className="text-3xl font-bold text-green-700">
                          ${Math.round(selectedProject.costEstimate / selectedProject.squareFootage)}/SF
                        </div>
                        <div className="text-sm text-green-600">Cost per Square Foot</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cost Details Tab */}
              <TabsContent value="cost-details" className="space-y-6 mt-4">
                {/* Export and Escalation Controls */}
                <div className="flex flex-col lg:flex-row gap-4 p-4 bg-gray-50 rounded-lg border">
                  {/* Export Section */}
                  <div className="flex-1">
                    <Label className="text-sm mb-2 block">Export Options</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportEstimate}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Export Estimate
                      </Button>
                    </div>
                  </div>

                  {/* Cost Escalation Calculator */}
                  <div className="flex-1 border-l border-gray-300 pl-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm">Cost Escalation Calculator</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs text-gray-600">Target Year</Label>
                        <Input
                          type="number"
                          value={escalationYear}
                          onChange={(e) => setEscalationYear(parseInt(e.target.value) || 2026)}
                          className="h-9 text-sm"
                          min={2025}
                          max={2050}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Rate (%)</Label>
                        <Input
                          type="number"
                          value={escalationRate}
                          onChange={(e) => setEscalationRate(parseFloat(e.target.value) || 3.5)}
                          className="h-9 text-sm"
                          step="0.1"
                          min={0}
                          max={20}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">Escalated Cost</Label>
                        <div className="h-9 flex items-center px-3 bg-blue-50 border border-blue-200 rounded-md">
                          <span className="text-sm font-semibold text-blue-900">
                            ${(calculateEscalatedCost() / 1000000).toFixed(2)}M
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Current (2025): ${(selectedProject?.costEstimate || 0).toLocaleString()} → 
                      {escalationYear > 2025 && (
                        <span className="ml-1 font-medium text-blue-700">
                          {escalationYear}: ${calculateEscalatedCost().toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Elemental Cost Summary */}
                <Card>
                  <CardHeader className="bg-orange-100">
                    <CardTitle className="text-orange-900">Elemental Cost Summary (Uniformat)</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 font-semibold">Code</th>
                            <th className="text-left py-2 font-semibold">Element</th>
                            <th className="text-right py-2 font-semibold">Cost/SF</th>
                            <th className="text-right py-2 font-semibold">Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProject.elementalCosts?.map((item, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="py-2">{item.code}</td>
                              <td className="py-2">{item.name}</td>
                              <td className="text-right py-2">${item.costPerSF}</td>
                              <td className="text-right py-2">${item.cost.toLocaleString()}</td>
                            </tr>
                          ))}
                          <tr className="font-bold bg-orange-50">
                            <td colSpan={2} className="py-2">Total Construction Cost</td>
                            <td className="text-right py-2"></td>
                            <td className="text-right py-2">
                              ${selectedProject.elementalCosts?.reduce((sum, item) => sum + item.cost, 0).toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Project Compare Dialog */}
      <Dialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
        <DialogContent className="sm:max-w-[98vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare Projects</DialogTitle>
          </DialogHeader>
          <ProjectCompare selectedProjectIds={selectedProjectsForCompare} />
        </DialogContent>
      </Dialog>

    </div>
  )
}