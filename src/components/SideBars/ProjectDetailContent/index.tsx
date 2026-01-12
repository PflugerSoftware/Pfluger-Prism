import { useState, useEffect, useCallback, useRef } from 'react'
import { Edit2, Save, X, XCircle, Trash2, MapPin } from 'lucide-react'
import { API_CONFIG } from '../../../config/apiConfig'
import { Badge } from "../../ui/badge"
import { Button } from "../../ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { Input } from "../../ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../ui/dialog"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog"
import type { Project } from '../../../data/loadProjects'
import { getProjectTypeColor } from '../../System/ThemeManager'
import { useProjects } from '../../System/ProjectsContext'
import { DetailSidebar } from '../DetailSidebar'
import { InteractiveMapPickerWithDistrict } from '../InteractiveMapPickerWithDistrict'

import type { CostRateData, ElementalCost, ProjectDetailContentProps } from './types'
import { CATEGORY_ORDER } from './types'
import {
  calculateProjectDatesFromPhases,
  getBuildingTypeColor,
  reverseEngineerSliderPosition,
  getProcurementMultiplierKey,
  getConstructionMultiplierKey,
  getStoriesMultiplierKey,
  calculateElementCost
} from './utils'

import { LocationCard } from './LocationCard'
import { ProjectOverviewCard } from './ProjectOverviewCard'
import { TimelineCard } from './TimelineCard'
import { CostSummaryRings } from './CostSummaryRings'
import { TechnicalDetailsCard } from './TechnicalDetailsCard'
import { ElementalCostsSection } from './ElementalCostsSection'

export function ProjectDetailContent({
  project: projectProp,
  isOpen,
  isMainSidebarExpanded,
  onClose,
  hasParentPadding = false,
  isMapView = false,
  isMapSearchPanelCollapsed = false,
  panelIndex = 0
}: ProjectDetailContentProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedProject, setEditedProject] = useState<Project | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const { projects, deleteProject, updateProject, refreshProjects } = useProjects()

  const project = projectProp ? projects.find(p => p.id === projectProp.id) || projectProp : null

  const [costRates, setCostRates] = useState<CostRateData[]>([])
  const [costRatesLoading, setCostRatesLoading] = useState(false)
  const [sliderPositions, setSliderPositions] = useState<Record<string, number>>({})
  const hasFetchedForReadOnly = useRef(false)
  // Track collapsed categories - start with all collapsed
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(() => new Set(CATEGORY_ORDER))

  const handleToggleCategory = useCallback((category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  const fetchCostRates = useCallback(async (
    buildingType: string,
    existingElementalCosts?: ElementalCost[],
    procurementMethod?: string,
    constructionType?: string,
    numberOfStories?: number
  ) => {
    setCostRatesLoading(true)
    try {
      const response = await fetch(
        `${API_CONFIG.baseUrl}/cost-rates.php?building_type=${encodeURIComponent(buildingType)}`,
        { credentials: 'include' }
      )
      if (response.ok) {
        const data = await response.json() as CostRateData[]
        setCostRates(data)

        const initialPositions: Record<string, number> = {}
        data.forEach((rate: CostRateData) => {
          const existingCost = existingElementalCosts?.find(ec => ec.code === rate.elemental_code)

          if (existingCost && rate.cost_per_sf_high > rate.cost_per_sf_low) {
            initialPositions[rate.elemental_code] = reverseEngineerSliderPosition(
              existingCost.costPerSF,
              rate,
              procurementMethod || '',
              constructionType || '',
              numberOfStories || 1
            )
          } else {
            initialPositions[rate.elemental_code] = 50
          }
        })
        setSliderPositions(initialPositions)
      }
    } catch {
      // Silently fail
    } finally {
      setCostRatesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isEditMode && editedProject?.buildingType) {
      hasFetchedForReadOnly.current = false
      fetchCostRates(
        editedProject.buildingType,
        editedProject.elementalCosts,
        editedProject.procurementMethod,
        editedProject.constructionType,
        editedProject.numberOfStories
      )
    }
  }, [isEditMode, editedProject?.buildingType, fetchCostRates])

  useEffect(() => {
    if (!isEditMode && project?.buildingType && !hasFetchedForReadOnly.current) {
      hasFetchedForReadOnly.current = true
      fetchCostRates(project.buildingType)
    }
  }, [isEditMode, project?.buildingType, fetchCostRates])

  useEffect(() => {
    if (isEditMode && editedProject && costRates.length > 0 && Object.keys(sliderPositions).length > 0) {
      const completeElementalCosts = costRates.map(rate => {
        const sliderPos = sliderPositions[rate.elemental_code] ?? 50
        const { costPerSF, cost } = calculateElementCost(
          rate,
          sliderPos,
          editedProject.squareFootage || 1,
          editedProject.procurementMethod || '',
          editedProject.constructionType || '',
          editedProject.numberOfStories || 1
        )
        return {
          code: rate.elemental_code,
          name: rate.code_name,
          costPerSF,
          cost
        }
      })

      const currentCodes = editedProject.elementalCosts?.map(ec => ec.code).sort().join(',') || ''
      const newCodes = completeElementalCosts.map(ec => ec.code).sort().join(',')
      if (currentCodes !== newCodes) {
        setEditedProject(prev => prev ? { ...prev, elementalCosts: completeElementalCosts } : null)
      }
    }
  }, [isEditMode, costRates, sliderPositions, editedProject?.squareFootage, editedProject?.procurementMethod, editedProject?.constructionType, editedProject?.numberOfStories])

  const handleDelete = async () => {
    if (!project) return
    setIsDeleting(true)
    try {
      deleteProject(project.id)
      setShowDeleteDialog(false)
      onClose()
    } catch {
      alert('Failed to delete project')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEnterEditMode = () => {
    if (!project) return

    let elementalCosts = project.elementalCosts || []
    if (elementalCosts.length === 0) {
      const costPerElement = project.costEstimate / 12
      const costPerSF = project.squareFootage > 0 ? costPerElement / project.squareFootage : 0

      elementalCosts = [
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
    }

    const projectWithCosts = { ...project, elementalCosts }
    const { completionDate, duration } = calculateProjectDatesFromPhases(projectWithCosts)

    setEditedProject({
      ...projectWithCosts,
      completionDate,
      duration
    })
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditedProject(null)
  }

  const handleLocationSelect = (address: string, latitude: number, longitude: number) => {
    if (editedProject) {
      setEditedProject({
        ...editedProject,
        address,
        latitude,
        longitude
      })
    }
  }

  const handleSave = async () => {
    if (!editedProject) return

    setIsSaving(true)
    try {
      const baseConstructionCost = editedProject.elementalCosts?.reduce((sum, item) => sum + item.cost, 0) || editedProject.baseCost
      const totalCost = baseConstructionCost + (editedProject.siteCosts || 0) + (editedProject.designCosts || 0) + (editedProject.contingency || 0)

      const updatedProject = {
        ...editedProject,
        baseCost: baseConstructionCost,
        costEstimate: totalCost
      }

      await updateProject(updatedProject.id, updatedProject)
      await refreshProjects()

      setIsEditMode(false)
      setEditedProject(null)

      alert('Project updated successfully!')
    } catch {
      alert('Failed to save project changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSliderChange = (code: string, position: number) => {
    setSliderPositions(prev => ({ ...prev, [code]: position }))
  }

  const handleElementalCostUpdate = (costs: ElementalCost[]) => {
    if (editedProject) {
      setEditedProject({ ...editedProject, elementalCosts: costs })
    }
  }

  const handleFieldChange = (field: string, value: string | number) => {
    if (editedProject) {
      setEditedProject({ ...editedProject, [field]: value })
    }
  }

  const handleSquareFootageChange = (newSF: number) => {
    if (editedProject) {
      setEditedProject({
        ...editedProject,
        squareFootage: newSF,
        elementalCosts: editedProject.elementalCosts?.map(item => ({
          ...item,
          costPerSF: newSF > 0 ? item.cost / newSF : 0
        }))
      })
    }
  }

  const handleProjectUpdate = (updates: Partial<Project>) => {
    if (editedProject) {
      setEditedProject({ ...editedProject, ...updates })
    }
  }

  if (!project) return null

  const buildingTypeColor = getBuildingTypeColor(project.buildingType)
  const projectTypeColor = getProjectTypeColor(project.projectType)

  const baseCost = isEditMode && editedProject
    ? (editedProject.elementalCosts?.reduce((sum, item) => sum + item.cost, 0) || 0)
    : project.baseCost
  const siteCost = isEditMode && editedProject ? (editedProject.siteCosts || 0) : project.siteCosts
  const designCost = isEditMode && editedProject ? (editedProject.designCosts || 0) : project.designCosts
  const contingencyCost = isEditMode && editedProject ? (editedProject.contingency || 0) : project.contingency
  const totalCost = baseCost + siteCost + designCost + contingencyCost
  const sqft = isEditMode && editedProject ? editedProject.squareFootage : project.squareFootage

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
        <Save className="h-3 w-3 text-white transition-opacity duration-200" style={{ opacity: hoveredButton === 'save' ? 1 : 0 }} />
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
        <X className="h-3 w-3 text-white transition-opacity duration-200" style={{ opacity: hoveredButton === 'cancel' ? 1 : 0 }} />
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
        title="Edit project"
      >
        <Edit2 className="h-3 w-3 text-white transition-opacity duration-200" style={{ opacity: hoveredButton === 'edit' ? 1 : 0 }} />
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
        title="Delete project"
      >
        <Trash2 className="h-3 w-3 text-white transition-opacity duration-200" style={{ opacity: hoveredButton === 'delete' ? 1 : 0 }} />
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
        <XCircle className="h-3 w-3 text-white transition-opacity duration-200" style={{ opacity: hoveredButton === 'close' ? 1 : 0 }} />
      </button>
    </>
  )

  const badges = (
    <>
      {isEditMode && (
        <Badge className="bg-amber-500 text-white font-semibold">EDITING</Badge>
      )}
      <Badge
        style={{
          backgroundColor: buildingTypeColor,
          color: project.buildingType === 'Elementary' ? '#1f2937' : 'white'
        }}
      >
        {project.buildingType}
      </Badge>
      <Badge
        className="text-sm font-medium"
        style={{
          backgroundColor: `${projectTypeColor}30`,
          color: projectTypeColor,
          border: `1px solid ${projectTypeColor}50`
        }}
      >
        {project.projectType}
      </Badge>
      <Badge variant="outline">{project.status}</Badge>
    </>
  )

  const quickStats = (
    <div className="grid grid-cols-3 gap-3">
      <div className="min-w-0">
        <div className="text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-secondary)' }}>Total Cost</div>
        <div className="text-lg font-bold truncate" style={{ color: projectTypeColor }}>
          ${(totalCost / 1000000).toFixed(1)}M
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-secondary)' }}>Sq. Footage</div>
        {isEditMode && editedProject ? (
          <Input
            type="text"
            value={editedProject.squareFootage.toLocaleString()}
            onChange={(e) => {
              const newSF = parseInt(e.target.value.replace(/,/g, '')) || 0
              handleSquareFootageChange(newSF)
            }}
            className="h-7 text-sm font-bold mt-1"
          />
        ) : (
          <div className="text-lg font-bold truncate">{(project.squareFootage / 1000).toFixed(0)}K SF</div>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-xs whitespace-nowrap" style={{ color: 'var(--theme-text-secondary)' }}>Duration</div>
        <div className="text-lg font-bold truncate">{project.duration}</div>
      </div>
    </div>
  )

  return (
    <>
      <DetailSidebar
        isOpen={isOpen}
        isMainSidebarExpanded={isMainSidebarExpanded}
        onClose={onClose}
        title={project.name}
        badges={badges}
        headerColor={`${projectTypeColor}15`}
        quickStats={quickStats}
        actionButtons={actionButtons}
        zIndex={2000}
        hasParentPadding={hasParentPadding}
        isMapView={isMapView}
        isMapSearchPanelCollapsed={isMapSearchPanelCollapsed}
        panelIndex={panelIndex}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 flex-shrink-0">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" className="px-4 py-6 space-y-6 mt-0 flex-1 overflow-y-auto data-[state=inactive]:hidden">
            <LocationCard
              project={project}
              editedProject={editedProject}
              isEditMode={isEditMode}
              onOpenAddressDialog={() => setIsAddressDialogOpen(true)}
            />

            <ProjectOverviewCard
              project={project}
              editedProject={editedProject}
              isEditMode={isEditMode}
              onFieldChange={handleFieldChange}
            />

            <TimelineCard
              project={project}
              editedProject={editedProject}
              isEditMode={isEditMode}
              onProjectUpdate={handleProjectUpdate}
            />
          </TabsContent>

          <TabsContent value="costs" className="px-4 py-6 space-y-6 mt-0 flex-1 overflow-y-auto data-[state=inactive]:hidden">
            <CostSummaryRings
              baseCost={baseCost}
              siteCost={siteCost}
              designCost={designCost}
              contingencyCost={contingencyCost}
              squareFootage={sqft}
              isEditMode={isEditMode}
              onSiteCostChange={(value) => editedProject && setEditedProject({ ...editedProject, siteCosts: value })}
              onDesignCostChange={(value) => editedProject && setEditedProject({ ...editedProject, designCosts: value })}
              onContingencyChange={(value) => editedProject && setEditedProject({ ...editedProject, contingency: value })}
            />

            <TechnicalDetailsCard
              project={project}
              editedProject={editedProject}
              isEditMode={isEditMode}
              onFieldChange={handleFieldChange}
            />

            <ElementalCostsSection
              isEditMode={isEditMode}
              project={project}
              editedProject={editedProject}
              costRates={costRates}
              costRatesLoading={costRatesLoading}
              sliderPositions={sliderPositions}
              onSliderChange={handleSliderChange}
              onElementalCostUpdate={handleElementalCostUpdate}
              collapsedCategories={collapsedCategories}
              onToggleCategory={handleToggleCategory}
            />
          </TabsContent>
        </Tabs>
      </DetailSidebar>

      {isEditMode && editedProject && (
        <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
          <DialogContent className="max-w-5xl h-[700px] flex flex-col p-0">
            <DialogHeader className="px-6 pt-6 pb-4">
              <DialogTitle>Select Site Location</DialogTitle>
              <DialogDescription>
                Click on the map to select a location, search for an address, or drag the marker to adjust. The purple shaded area shows the Liberty Hill ISD district boundary.
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <InteractiveMapPickerWithDistrict
                selectedAddress={editedProject.address || ''}
                selectedLatitude={editedProject.latitude}
                selectedLongitude={editedProject.longitude}
                onLocationSelect={handleLocationSelect}
              />
            </div>
            <div className="p-4 border-t flex justify-end gap-2" style={{ backgroundColor: 'var(--theme-muted-bg)', borderColor: 'var(--theme-muted-bg)' }}>
              <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddressDialogOpen(false)} disabled={!editedProject.address}>
                Confirm Location
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="z-[10000]" style={{ backgroundColor: 'var(--theme-text-primary)', color: 'var(--theme-card-bg)', borderColor: 'var(--theme-text-secondary)' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: 'var(--theme-card-bg)' }}>Delete Project</AlertDialogTitle>
            <AlertDialogDescription style={{ color: 'var(--theme-text-tertiary)' }}>
              Are you sure you want to delete "{project?.name}"? This action cannot be undone.
              This will permanently delete the project and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isDeleting} style={{ backgroundColor: 'var(--theme-text-secondary)', color: 'var(--theme-card-bg)', borderColor: 'var(--theme-text-tertiary)' }}>Cancel</AlertDialogCancel>
            <Button
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
                setShowDeleteDialog(false)
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
