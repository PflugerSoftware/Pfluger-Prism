import { useState, useMemo } from 'react'
import { School, MapPin, Building, Users, Phone, Calendar, TrendingUp, DollarSign, Edit2, Save, X, XCircle, Trash2, Info, FolderOpen, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Input } from "../ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { Facility } from '../System/FacilitiesContext'
import type { Project } from '../../data/loadProjects'
import { useFacilities } from '../System/FacilitiesContext'
import { useProjects } from '../System/ProjectsContext'
import { getProjectTypeColor, useTheme } from '../System/ThemeManager'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { DetailSidebar } from './DetailSidebar'
import { InteractiveMapPickerWithDistrict } from './InteractiveMapPickerWithDistrict'

interface FacilityDetailedContentProps {
  facility: Facility | null
  isOpen: boolean
  isMainSidebarExpanded: boolean
  onClose: () => void
  hasParentPadding?: boolean
  isMapView?: boolean
  isMapSearchPanelCollapsed?: boolean
  onNavigateToProject?: (project: Project) => void
  panelIndex?: number // For stacking multiple panels
}

// Extended Facility interface with additional fields from liberty_hill_schools.json
interface ExtendedFacility extends Facility {
  grade_range?: string
  principal?: string
  phone?: string
}

// Helper function to get facility type color
const getFacilityTypeColor = (type: string) => {
  switch (type) {
    case 'Elementary': return '#FFD93D'      // Yellow
    case 'Middle': return '#4ECDC4'          // Teal
    case 'High School': return '#FF6B6B'     // Red
    case 'Specialty': return '#A78BFA'       // Purple
    case 'Administration': return '#64748B'  // Slate
    case 'District': return '#3B82F6'        // Blue
    default: return '#8E8E93'                // Gray
  }
}

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Existing': return '#10B981'        // Green
    case 'Under Construction': return '#F97316' // Orange
    case 'Planned': return '#3B82F6'         // Blue
    default: return '#8E8E93'                // Gray
  }
}

export function FacilityDetailedContent({
  facility: facilityProp,
  isOpen,
  isMainSidebarExpanded,
  onClose,
  hasParentPadding = false,
  isMapView = false,
  isMapSearchPanelCollapsed = false,
  onNavigateToProject,
  panelIndex = 0
}: FacilityDetailedContentProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedFacility, setEditedFacility] = useState<ExtendedFacility | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)

  const { facilities, updateFacility, deleteFacility, refreshFacilities } = useFacilities()
  const { projects } = useProjects()
  const { currentTheme } = useTheme()

  // Get fresh facility data from context
  const facility = facilityProp ? facilities.find(f => f.id === facilityProp.id) || facilityProp : null

  // Get projects for this facility
  const facilityProjects = useMemo(() => {
    if (!facility) return []
    return projects.filter(p => p.facility_id === facility.id)
  }, [facility, projects])

  // Calculate facility statistics
  const facilityStats = useMemo(() => {
    const totalCost = facilityProjects.reduce((sum, p) => sum + p.costEstimate, 0)
    const averageCost = facilityProjects.length > 0 ? totalCost / facilityProjects.length : 0
    const projectTypeBreakdown = facilityProjects.reduce((acc, p) => {
      acc[p.projectType] = (acc[p.projectType] || 0) + p.costEstimate
      return acc
    }, {} as Record<string, number>)

    return {
      projectCount: facilityProjects.length,
      totalInvestment: totalCost,
      averageProjectCost: averageCost,
      projectTypeBreakdown: Object.entries(projectTypeBreakdown).map(([type, cost]) => ({
        name: type,
        value: cost / 1000000, // Convert to millions
        color: getProjectTypeColor(type).color // Get the color string from the object
      }))
    }
  }, [facilityProjects])

  // Convert projects to Gantt tasks
  const ganttTasks: Task[] = useMemo(() => {
    const tasks: Task[] = []

    facilityProjects.forEach((project, index) => {
      if (!project.startDate || !project.completionDate) return

      try {
        const startDate = new Date(project.startDate)
        const endDate = new Date(project.completionDate)

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return

        tasks.push({
          id: `project-${project.id}`,
          name: project.name,
          type: 'task' as const,
          start: startDate,
          end: endDate,
          progress: 0,
          styles: {
            backgroundColor: getProjectTypeColor(project.projectType).color,
            backgroundSelectedColor: getProjectTypeColor(project.projectType).color
          }
        })
      } catch (error) {
        // Skip invalid dates
      }
    })

    return tasks
  }, [facilityProjects])

  // Handle entering edit mode
  const handleEnterEditMode = () => {
    if (!facility) return
    setEditedFacility(facility as ExtendedFacility)
    setIsEditMode(true)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditedFacility(null)
  }

  // Handle location selection from map
  const handleLocationSelect = (address: string, latitude: number, longitude: number) => {
    if (editedFacility) {
      setEditedFacility({
        ...editedFacility,
        address,
        latitude: latitude,  // These will be numbers from the map picker
        longitude: longitude
      })
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!editedFacility) return

    setIsSaving(true)
    try {
      await updateFacility(editedFacility.id, editedFacility)
      await refreshFacilities()

      setIsEditMode(false)
      setEditedFacility(null)
      alert('Facility updated successfully!')
    } catch (error) {
      alert('Failed to save facility changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!facility) return

    // Check if facility has projects
    if (facilityProjects.length > 0) {
      alert(`Cannot delete facility: ${facilityProjects.length} project(s) are assigned to this facility.`)
      setShowDeleteDialog(false)
      return
    }

    setIsDeleting(true)
    try {
      await deleteFacility(facility.id)
      setShowDeleteDialog(false)
      onClose()
    } catch (error) {
      alert('Failed to delete facility')
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle project click
  const handleProjectClick = (project: Project) => {
    if (onNavigateToProject) {
      onNavigateToProject(project)
    }
  }

  // Early return if no facility
  if (!facility) return null

  const facilityTypeColor = getFacilityTypeColor(facility.facility_type)
  const statusColor = getStatusColor(facility.status)

  // Render action buttons based on edit mode
  const actionButtons = isEditMode ? (
    <>
      <button
        onClick={handleSave}
        onMouseEnter={() => setHoveredButton('save')}
        onMouseLeave={() => setHoveredButton(null)}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: '#10b981',
          transform: hoveredButton === 'save' ? 'scale(1.15)' : 'scale(1)',
          opacity: isSaving ? 0.5 : 1,
          cursor: isSaving ? 'not-allowed' : 'pointer'
        }}
        title="Save changes"
        disabled={isSaving}
      >
        <Save
          className="h-3 w-3 text-white transition-opacity duration-200"
          style={{ opacity: hoveredButton === 'save' ? 1 : 0 }}
        />
      </button>
      <button
        onClick={handleCancelEdit}
        onMouseEnter={() => setHoveredButton('cancel')}
        onMouseLeave={() => setHoveredButton(null)}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: '#ef4444',
          transform: hoveredButton === 'cancel' ? 'scale(1.15)' : 'scale(1)',
          opacity: isSaving ? 0.5 : 1,
          cursor: isSaving ? 'not-allowed' : 'pointer'
        }}
        title="Cancel editing"
        disabled={isSaving}
      >
        <X
          className="h-3 w-3 text-white transition-opacity duration-200"
          style={{ opacity: hoveredButton === 'cancel' ? 1 : 0 }}
        />
      </button>
    </>
  ) : (
    <>
      <button
        onClick={handleEnterEditMode}
        onMouseEnter={() => setHoveredButton('edit')}
        onMouseLeave={() => setHoveredButton(null)}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: '#3b82f6',
          transform: hoveredButton === 'edit' ? 'scale(1.15)' : 'scale(1)',
        }}
        title="Edit facility"
      >
        <Edit2
          className="h-3 w-3 text-white transition-opacity duration-200"
          style={{ opacity: hoveredButton === 'edit' ? 1 : 0 }}
        />
      </button>
      <button
        onClick={() => setShowDeleteDialog(true)}
        onMouseEnter={() => setHoveredButton('delete')}
        onMouseLeave={() => setHoveredButton(null)}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: '#ef4444',
          transform: hoveredButton === 'delete' ? 'scale(1.15)' : 'scale(1)',
        }}
        title="Delete facility"
      >
        <Trash2
          className="h-3 w-3 text-white transition-opacity duration-200"
          style={{ opacity: hoveredButton === 'delete' ? 1 : 0 }}
        />
      </button>
      <button
        onClick={onClose}
        onMouseEnter={() => setHoveredButton('close')}
        onMouseLeave={() => setHoveredButton(null)}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: '#6b7280',
          transform: hoveredButton === 'close' ? 'scale(1.15)' : 'scale(1)',
        }}
        title="Close"
      >
        <XCircle
          className="h-3 w-3 text-white transition-opacity duration-200"
          style={{ opacity: hoveredButton === 'close' ? 1 : 0 }}
        />
      </button>
    </>
  )

  // Render badges
  const badges = (
    <>
      {isEditMode && (
        <Badge className="bg-amber-500 text-white font-semibold">
          EDITING
        </Badge>
      )}
      <Badge
        style={{
          backgroundColor: facilityTypeColor,
          color: facility.facility_type === 'Elementary' ? '#1f2937' : 'white'
        }}
      >
        {facility.facility_type}
      </Badge>
      <Badge
        style={{
          backgroundColor: statusColor,
          color: 'white'
        }}
      >
        {facility.status}
      </Badge>
      {(editedFacility?.grade_range || (facility as ExtendedFacility).grade_range) && (
        <Badge variant="outline">
          {editedFacility?.grade_range || (facility as ExtendedFacility).grade_range}
        </Badge>
      )}
    </>
  )

  // Render quick stats
  const quickStats = (
    <div className="grid grid-cols-3 gap-3">
      <div className="min-w-0">
        <div className="text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-secondary)' }}>Enrollment</div>
        <div className="text-lg font-bold truncate" style={{ color: facilityTypeColor }}>
          {facility.current_enrollment}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-secondary)' }}>Projects</div>
        <div className="text-lg font-bold truncate" style={{ color: 'var(--theme-text-primary)' }}>
          {facilityStats.projectCount}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-secondary)' }}>Investment</div>
        <div className="text-lg font-bold truncate" style={{ color: 'var(--theme-text-primary)' }}>
          ${(facilityStats.totalInvestment / 1000000).toFixed(1)}M
        </div>
      </div>
    </div>
  )

  return (
    <>
      <DetailSidebar
        isOpen={isOpen}
        isMainSidebarExpanded={isMainSidebarExpanded}
        onClose={onClose}
        title={facility.name}
        badges={badges}
        headerColor={isEditMode ? '#FEF3C7' : `${facilityTypeColor}15`}
        quickStats={quickStats}
        actionButtons={actionButtons}
        zIndex={2000}
        hasParentPadding={hasParentPadding}
        isMapView={isMapView}
        isMapSearchPanelCollapsed={isMapSearchPanelCollapsed}
        panelIndex={panelIndex}
      >
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          {/* Tab List - Fixed at top, no scroll */}
          <div className="px-4 pt-4 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
          </div>

          {/* Details Tab */}
          <TabsContent value="details" className="px-4 py-6 space-y-6 mt-0 flex-1 overflow-y-auto data-[state=inactive]:hidden">
            {/* Location Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isEditMode && editedFacility ? (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => setIsAddressDialogOpen(true)}
                    >
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">{editedFacility.address || 'Select location on map'}</span>
                    </Button>
                    <div className="text-xs text-gray-500">
                      Lat: {editedFacility.latitude?.toFixed(6) || 'N/A'},
                      Lng: {editedFacility.longitude?.toFixed(6) || 'N/A'}
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{facility.address}</p>
                    <div className="flex gap-4 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                      <span>Lat: {facility.latitude?.toFixed(6) || 'N/A'}</span>
                      <span>Lng: {facility.longitude?.toFixed(6) || 'N/A'}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* School Information Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <School className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
                  School Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    <Users className="h-4 w-4" />
                    <span>Principal</span>
                  </div>
                  {isEditMode && editedFacility ? (
                    <Input
                      type="text"
                      value={editedFacility.principal || ''}
                      onChange={(e) => setEditedFacility({ ...editedFacility, principal: e.target.value })}
                      className="h-7 text-sm font-medium text-right w-48"
                      placeholder="Principal name"
                    />
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {(facility as ExtendedFacility).principal || 'Not specified'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    <Phone className="h-4 w-4" />
                    <span>Phone</span>
                  </div>
                  {isEditMode && editedFacility ? (
                    <Input
                      type="text"
                      value={editedFacility.phone || ''}
                      onChange={(e) => setEditedFacility({ ...editedFacility, phone: e.target.value })}
                      className="h-7 text-sm font-medium text-right w-48"
                      placeholder="Phone number"
                    />
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {(facility as ExtendedFacility).phone || 'Not specified'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    <Activity className="h-4 w-4" />
                    <span>Grade Range</span>
                  </div>
                  {isEditMode && editedFacility ? (
                    <Input
                      type="text"
                      value={editedFacility.grade_range || ''}
                      onChange={(e) => setEditedFacility({ ...editedFacility, grade_range: e.target.value })}
                      className="h-7 text-sm font-medium text-right w-32"
                      placeholder="e.g., K-5"
                    />
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {(facility as ExtendedFacility).grade_range || 'Not specified'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    <Calendar className="h-4 w-4" />
                    <span>Year Built</span>
                  </div>
                  {isEditMode && editedFacility ? (
                    <Input
                      type="number"
                      value={editedFacility.year_built || ''}
                      onChange={(e) => setEditedFacility({ ...editedFacility, year_built: parseInt(e.target.value) || undefined })}
                      className="h-7 text-sm font-medium text-right w-32"
                      placeholder="Year"
                    />
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {facility.year_built || 'Not specified'}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    <Building className="h-4 w-4" />
                    <span>Site Area</span>
                  </div>
                  {isEditMode && editedFacility ? (
                    <Input
                      type="text"
                      value={editedFacility.site_area || ''}
                      onChange={(e) => setEditedFacility({ ...editedFacility, site_area: e.target.value })}
                      className="h-7 text-sm font-medium text-right w-32"
                      placeholder="e.g., 15 acres"
                    />
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {facility.site_area || 'Not specified'}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enrollment Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  Enrollment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                    <Users className="h-4 w-4" />
                    <span>Current Enrollment</span>
                  </div>
                  {isEditMode && editedFacility ? (
                    <Input
                      type="number"
                      value={editedFacility.current_enrollment || ''}
                      onChange={(e) => setEditedFacility({ ...editedFacility, current_enrollment: parseInt(e.target.value) || 0 })}
                      className="h-7 text-sm font-medium text-right w-32"
                      placeholder="Students"
                    />
                  ) : (
                    <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      {facility.current_enrollment} students
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Facility Status Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" style={{ color: statusColor }} />
                  Facility Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Current Status</span>
                  {isEditMode && editedFacility ? (
                    <Select
                      value={editedFacility.status}
                      onValueChange={(value) => setEditedFacility({
                        ...editedFacility,
                        status: value as 'Existing' | 'Under Construction' | 'Planned'
                      })}
                    >
                      <SelectTrigger className="h-7 w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Existing">Existing</SelectItem>
                        <SelectItem value="Under Construction">Under Construction</SelectItem>
                        <SelectItem value="Planned">Planned</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: statusColor }}
                      />
                      <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{facility.status}</span>
                    </div>
                  )}
                </div>

                {facility.status === 'Under Construction' && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      This facility is currently under construction. Project timelines may be affected.
                    </p>
                  </div>
                )}

                {facility.status === 'Planned' && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      This is a planned facility. All associated projects are in planning phase.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="px-4 py-6 space-y-6 mt-0 flex-1 overflow-y-auto data-[state=inactive]:hidden">
            {/* Projects Summary Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                  Projects Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Total Projects</span>
                  <span className="text-2xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                    {facilityStats.projectCount}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Total Investment</span>
                  <span className="text-lg font-semibold" style={{ color: facilityTypeColor }}>
                    ${(facilityStats.totalInvestment / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Average Project Cost</span>
                  <span className="text-lg font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                    ${(facilityStats.averageProjectCost / 1000000).toFixed(2)}M
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects List */}
            <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
                  Active Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {facilityProjects.length > 0 ? (
                  <div className="space-y-3">
                    {facilityProjects.map((project) => (
                      <div
                        key={project.id}
                        className="p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate" style={{ color: 'var(--theme-text-primary)' }}>
                              {project.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: `${getProjectTypeColor(project.projectType).color}30`,
                                  color: getProjectTypeColor(project.projectType).color,
                                  border: `1px solid ${getProjectTypeColor(project.projectType).color}50`
                                }}
                              >
                                {project.projectType}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                              ${(project.costEstimate / 1000000).toFixed(2)}M
                            </p>
                            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                              {project.duration}
                            </p>
                          </div>
                        </div>

                        {/* Timeline Progress Bar */}
                        {project.startDate && project.completionDate && (
                          <div className="mt-3">
                            <div className="w-full rounded-full h-2 bg-gray-200">
                              <div
                                className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                                style={{
                                  width: `${(() => {
                                    const start = new Date(project.startDate)
                                    const end = new Date(project.completionDate)
                                    const now = new Date()
                                    if (now < start) return 0
                                    if (now > end) return 100
                                    const total = end.getTime() - start.getTime()
                                    const elapsed = now.getTime() - start.getTime()
                                    return Math.round((elapsed / total) * 100)
                                  })()}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8" style={{ color: 'var(--theme-text-secondary)' }}>
                    <FolderOpen className="h-12 w-12 mx-auto mb-2" style={{ color: 'var(--theme-muted)' }} />
                    <p className="text-sm">No projects at this facility</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--theme-text-tertiary)' }}>Projects will appear here once assigned</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Timeline */}
            {ganttTasks.length > 0 && (
              <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
                    Project Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full overflow-auto rounded-lg border">
                    <Gantt
                      tasks={ganttTasks}
                      viewMode={ViewMode.Year}
                      listCellWidth=""
                      columnWidth={80}
                      rowHeight={40}
                      barCornerRadius={6}
                      barFill={60}
                      handleWidth={0}
                      fontSize="11px"
                      fontFamily="Inter, system-ui, sans-serif"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investment Breakdown Chart */}
            {facilityStats.projectTypeBreakdown.length > 0 && (
              <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" style={{ color: 'var(--theme-accent)' }} />
                    Investment by Project Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={facilityStats.projectTypeBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: $${entry.value.toFixed(1)}M`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {facilityStats.projectTypeBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [`$${value.toFixed(2)}M`, 'Investment']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DetailSidebar>

      {/* Address Picker Dialog */}
      {isEditMode && editedFacility && (
        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
          <DialogContent className="max-w-5xl h-[700px] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle>Select Facility Location</DialogTitle>
              <DialogDescription>
                Click on the map to select a location, search for an address, or drag the marker to adjust.
                The purple shaded area shows the Liberty Hill ISD district boundary.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <InteractiveMapPickerWithDistrict
                selectedAddress={editedFacility.address || ''}
                selectedLatitude={editedFacility.latitude}
                selectedLongitude={editedFacility.longitude}
                onLocationSelect={handleLocationSelect}
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddressDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsAddressDialogOpen(false)}
                disabled={!editedFacility.address}
              >
                Confirm Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="z-[10000] bg-gray-900 text-white border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Facility</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              {facilityProjects.length > 0 ? (
                <>
                  Cannot delete "{facility?.name}" because it has {facilityProjects.length} active project(s).
                  Please reassign or delete these projects first.
                </>
              ) : (
                <>
                  Are you sure you want to delete "{facility?.name}"? This action cannot be undone.
                  This will permanently delete the facility and all associated data.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel
              disabled={isDeleting}
              className="bg-gray-800 text-white hover:bg-gray-700 border-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            {facilityProjects.length === 0 && (
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete()
                }}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}