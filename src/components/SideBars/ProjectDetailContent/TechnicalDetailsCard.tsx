import { Wrench } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import type { Project } from '../../../data/loadProjects'

interface TechnicalDetailsCardProps {
  project: Project
  editedProject: Project | null
  isEditMode: boolean
  onFieldChange: (field: string, value: string | number) => void
}

export function TechnicalDetailsCard({
  project,
  editedProject,
  isEditMode,
  onFieldChange
}: TechnicalDetailsCardProps) {
  const currentProject = isEditMode && editedProject ? editedProject : project

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Wrench className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
          Technical Details
          {isEditMode && (
            <Badge variant="outline" className="text-xs ml-auto" style={{ backgroundColor: 'var(--theme-muted-bg)', color: 'var(--theme-primary)', borderColor: 'var(--theme-primary)' }}>Affects Cost Multipliers</Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <span style={{ color: 'var(--theme-text-secondary)' }}>Construction Type</span>
          {isEditMode && editedProject ? (
            <select
              value={editedProject.constructionType || ''}
              onChange={(e) => onFieldChange('constructionType', e.target.value)}
              className="h-7 text-sm font-medium text-right w-36 px-2 border rounded-md"
              style={{ borderColor: 'var(--theme-muted-bg)', backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text-primary)' }}
            >
              <option value="Steel">Steel</option>
              <option value="Concrete">Concrete</option>
              <option value="Mass Timber">Mass Timber</option>
              <option value="Wood Frame">Wood Frame</option>
            </select>
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.constructionType}</span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <span style={{ color: 'var(--theme-text-secondary)' }}>Number of Stories</span>
          {isEditMode && editedProject ? (
            <select
              value={editedProject.numberOfStories || 1}
              onChange={(e) => onFieldChange('numberOfStories', parseInt(e.target.value))}
              className="h-7 text-sm font-medium text-right w-36 px-2 border rounded-md"
              style={{ borderColor: 'var(--theme-muted-bg)', backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text-primary)' }}
            >
              <option value={1}>1 Story</option>
              <option value={2}>2 Stories</option>
              <option value={3}>3 Stories</option>
              <option value={4}>4+ Stories</option>
            </select>
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.numberOfStories}</span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <span style={{ color: 'var(--theme-text-secondary)' }}>Procurement Method</span>
          {isEditMode && editedProject ? (
            <select
              value={editedProject.procurementMethod || ''}
              onChange={(e) => onFieldChange('procurementMethod', e.target.value)}
              className="h-7 text-sm font-medium text-right w-36 px-2 border rounded-md"
              style={{ borderColor: 'var(--theme-muted-bg)', backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text-primary)' }}
            >
              <option value="CMAR">CMAR</option>
              <option value="Hard Bid">Hard Bid</option>
              <option value="Design Build">Design Build</option>
              <option value="CSP">CSP</option>
            </select>
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.procurementMethod}</span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <span style={{ color: 'var(--theme-text-secondary)' }}>LEED Certification</span>
          {isEditMode && editedProject ? (
            <select
              value={editedProject.leedCertification || 'None'}
              onChange={(e) => onFieldChange('leedCertification', e.target.value)}
              className="h-7 text-sm font-medium text-right w-36 px-2 border rounded-md"
              style={{ borderColor: 'var(--theme-muted-bg)', backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text-primary)' }}
            >
              <option value="None">None</option>
              <option value="Certified">Certified</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.leedCertification || 'None'}</span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <span style={{ color: 'var(--theme-text-secondary)' }}>CHPS Certified</span>
          {isEditMode && editedProject ? (
            <select
              value={editedProject.chipsCertification || 'No'}
              onChange={(e) => onFieldChange('chipsCertification', e.target.value)}
              className="h-7 text-sm font-medium text-right w-36 px-2 border rounded-md"
              style={{ borderColor: 'var(--theme-muted-bg)', backgroundColor: 'var(--theme-card-bg)', color: 'var(--theme-text-primary)' }}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.chipsCertification || 'No'}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
