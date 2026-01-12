import { MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import type { Project } from '../../../data/loadProjects'

interface LocationCardProps {
  project: Project
  editedProject: Project | null
  isEditMode: boolean
  onOpenAddressDialog: () => void
}

export function LocationCard({
  project,
  editedProject,
  isEditMode,
  onOpenAddressDialog
}: LocationCardProps) {
  const currentProject = isEditMode && editedProject ? editedProject : project

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
          Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {currentProject.schoolName && (
          <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.schoolName}</p>
        )}
        {isEditMode && editedProject ? (
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto py-2"
              onClick={onOpenAddressDialog}
            >
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="text-sm truncate">{editedProject.address || 'Select site address on map'}</span>
            </Button>
            <div className="text-xs" style={{ color: 'var(--theme-text-tertiary)' }}>
              Lat: {editedProject.latitude?.toFixed(6)}, Lng: {editedProject.longitude?.toFixed(6)}
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{currentProject.address}</p>
            <div className="flex gap-4 text-xs" style={{ color: 'var(--theme-text-tertiary)' }}>
              <span>Lat: {currentProject.latitude?.toFixed(6)}</span>
              <span>Lng: {currentProject.longitude?.toFixed(6)}</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
