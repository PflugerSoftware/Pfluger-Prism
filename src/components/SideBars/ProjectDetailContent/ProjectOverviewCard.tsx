import { DollarSign, Ruler, Users, Building } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Input } from "../../ui/input"
import type { Project } from '../../../data/loadProjects'

interface ProjectOverviewCardProps {
  project: Project
  editedProject: Project | null
  isEditMode: boolean
  onFieldChange: (field: string, value: string | number) => void
}

export function ProjectOverviewCard({
  project,
  editedProject,
  isEditMode,
  onFieldChange
}: ProjectOverviewCardProps) {
  const currentProject = isEditMode && editedProject ? editedProject : project

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Building className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
          Project Overview
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <DollarSign className="h-4 w-4" />
            <span>Total Cost</span>
          </div>
          <span className="text-lg font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
            ${(currentProject.costEstimate / 1000000).toFixed(2)}M
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <Ruler className="h-4 w-4" />
            <span>Square Footage</span>
          </div>
          <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
            {(currentProject.squareFootage / 1000).toFixed(1)}K SF
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <Users className="h-4 w-4" />
            <span>Capacity</span>
          </div>
          {isEditMode && editedProject ? (
            <Input
              type="number"
              value={editedProject.capacity || ''}
              onChange={(e) => onFieldChange('capacity', parseInt(e.target.value) || 0)}
              className="h-7 text-sm font-medium text-right w-32"
              placeholder="Students"
            />
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
              {currentProject.capacity} students
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <Building className="h-4 w-4" />
            <span>Site Area</span>
          </div>
          {isEditMode && editedProject ? (
            <Input
              type="text"
              value={editedProject.siteArea || ''}
              onChange={(e) => onFieldChange('siteArea', e.target.value)}
              className="h-7 text-sm font-medium text-right w-32"
              placeholder="e.g., 15 acres"
            />
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.siteArea}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
