import { useMemo } from 'react'
import { Calendar, CalendarCheck, Clock, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { Input } from "../../ui/input"
import { Separator } from "../../ui/separator"
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import type { Project } from '../../../data/loadProjects'
import { parseMonthYear, calculateProjectDatesFromPhases } from './utils'

interface TimelineCardProps {
  project: Project
  editedProject: Project | null
  isEditMode: boolean
  onTaskChange?: (task: Task) => void
  onStartDateChange?: (date: string) => void
  onProjectUpdate?: (updates: Partial<Project>) => void
}

export function TimelineCard({
  project,
  editedProject,
  isEditMode,
  onTaskChange,
  onStartDateChange,
  onProjectUpdate
}: TimelineCardProps) {
  const currentProject = isEditMode && editedProject ? editedProject : project

  // Convert project phases to Gantt tasks
  const ganttTasks: Task[] = useMemo(() => {
    if (!currentProject?.startDate ||
        (!currentProject.procurementPhaseDuration && !currentProject.designPhaseDuration && !currentProject.constructionPhaseDuration)) {
      return []
    }

    const startDate = parseMonthYear(currentProject.startDate)
    if (!startDate) return []

    const tasks: Task[] = []
    let currentDate = new Date(startDate)

    // Procurement phase
    if (currentProject.procurementPhaseDuration && currentProject.procurementPhaseDuration > 0) {
      const start = new Date(currentDate)
      const end = new Date(currentDate)
      end.setMonth(end.getMonth() + currentProject.procurementPhaseDuration)

      tasks.push({
        id: 'procurement',
        name: 'Procurement',
        type: 'task' as const,
        start,
        end,
        progress: 0,
        styles: {
          backgroundColor: '#003C71',
          backgroundSelectedColor: '#003C71'
        }
      })
      currentDate = new Date(end)
    }

    // Design phase
    if (currentProject.designPhaseDuration && currentProject.designPhaseDuration > 0) {
      const start = new Date(currentDate)
      const end = new Date(currentDate)
      end.setMonth(end.getMonth() + currentProject.designPhaseDuration)

      tasks.push({
        id: 'design',
        name: 'Design',
        type: 'task' as const,
        start,
        end,
        progress: 0,
        styles: {
          backgroundColor: '#00A9E0',
          backgroundSelectedColor: '#00A9E0'
        }
      })
      currentDate = new Date(end)
    }

    // Construction phase
    if (currentProject.constructionPhaseDuration && currentProject.constructionPhaseDuration > 0) {
      const start = new Date(currentDate)
      const end = new Date(currentDate)
      end.setMonth(end.getMonth() + currentProject.constructionPhaseDuration)

      tasks.push({
        id: 'construction',
        name: 'Construction',
        type: 'task' as const,
        start,
        end,
        progress: 0,
        styles: {
          backgroundColor: '#67823A',
          backgroundSelectedColor: '#67823A'
        }
      })
      currentDate = new Date(end)
    }

    // Parse and add pause phases from JSON
    if (currentProject.projectPauses) {
      try {
        const pausePhases = JSON.parse(currentProject.projectPauses)
        pausePhases.forEach((pause: { id: string; name: string; duration: number; color?: string }) => {
          const start = new Date(currentDate)
          const end = new Date(currentDate)
          end.setMonth(end.getMonth() + pause.duration)

          tasks.push({
            id: pause.id,
            name: pause.name,
            type: 'task' as const,
            start,
            end,
            progress: 0,
            styles: {
              backgroundColor: pause.color || '#F2A900',
              backgroundSelectedColor: pause.color || '#F2A900',
              backgroundImage: `repeating-linear-gradient(
                45deg,
                ${pause.color || '#F2A900'},
                ${pause.color || '#F2A900'} 10px,
                rgba(255,255,255,0.1) 10px,
                rgba(255,255,255,0.1) 20px
              )`
            }
          })
          currentDate = new Date(end)
        })
      } catch {
        // Silently handle parse errors
      }
    }

    return tasks
  }, [
    currentProject?.startDate,
    currentProject?.procurementPhaseDuration,
    currentProject?.designPhaseDuration,
    currentProject?.constructionPhaseDuration,
    currentProject?.projectPauses
  ])

  const handleTaskChange = (task: Task) => {
    if (!isEditMode || !editedProject || !onProjectUpdate) return

    const newDuration = Math.round(
      (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )

    const updates: Partial<Project> = {}

    if (task.id === 'procurement') {
      updates.procurementPhaseDuration = Math.max(1, newDuration)
    } else if (task.id === 'design') {
      updates.designPhaseDuration = Math.max(1, newDuration)
    } else if (task.id === 'construction') {
      updates.constructionPhaseDuration = Math.max(1, newDuration)
    } else if (task.id.startsWith('pause-')) {
      try {
        const pausePhases = JSON.parse(editedProject.projectPauses || '[]')
        const updatedPauses = pausePhases.map((pause: { id: string; name: string; duration: number; color?: string }) => {
          if (pause.id === task.id) {
            return { ...pause, duration: Math.max(1, newDuration) }
          }
          return pause
        })
        updates.projectPauses = JSON.stringify(updatedPauses)
      } catch {
        // Silently handle parse errors
      }
    }

    const tempProject = { ...editedProject, ...updates }
    const { completionDate, duration } = calculateProjectDatesFromPhases(tempProject)

    onProjectUpdate({
      ...updates,
      completionDate,
      duration
    })

    onTaskChange?.(task)
  }

  const handleStartDateChange = (newStartDate: string) => {
    if (!editedProject || !onProjectUpdate) return

    const tempProject = { ...editedProject, startDate: newStartDate }
    const { completionDate, duration } = calculateProjectDatesFromPhases(tempProject)

    onProjectUpdate({
      startDate: newStartDate,
      completionDate,
      duration
    })

    onStartDateChange?.(newStartDate)
  }

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" style={{ color: 'var(--theme-primary)' }} />
          Project Timeline
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <Clock className="h-4 w-4" />
            <span>Duration</span>
            {isEditMode && (
              <div className="group relative">
                <Info className="h-3 w-3" style={{ color: 'var(--theme-primary)' }} />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 text-xs rounded shadow-lg z-10" style={{ backgroundColor: 'var(--theme-text-primary)', color: 'var(--theme-card-bg)' }}>
                  Auto-calculated from phase timeline
                </div>
              </div>
            )}
          </div>
          {isEditMode && editedProject ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={editedProject.duration || ''}
                className="h-7 text-sm font-medium text-right w-32"
                style={{ backgroundColor: 'var(--theme-muted-bg)', borderColor: 'var(--theme-primary)' }}
                disabled
                title="Auto-calculated from phase timeline"
              />
              <Badge variant="outline" className="text-xs" style={{ backgroundColor: 'var(--theme-muted-bg)', color: 'var(--theme-primary)', borderColor: 'var(--theme-primary)' }}>Auto</Badge>
            </div>
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.duration}</span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <Calendar className="h-4 w-4" />
            <span>Start Date</span>
          </div>
          {isEditMode && editedProject ? (
            <Input
              type="text"
              value={editedProject.startDate || ''}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="h-7 text-sm font-medium text-right w-32"
              placeholder="e.g., January 2026"
            />
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.startDate || 'TBD'}</span>
          )}
        </div>

        <div className="flex justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
            <CalendarCheck className="h-4 w-4" />
            <span>Completion Date</span>
            {isEditMode && (
              <div className="group relative">
                <Info className="h-3 w-3" style={{ color: 'var(--theme-primary)' }} />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 text-xs rounded shadow-lg z-10" style={{ backgroundColor: 'var(--theme-text-primary)', color: 'var(--theme-card-bg)' }}>
                  Auto-calculated from phase timeline
                </div>
              </div>
            )}
          </div>
          {isEditMode && editedProject ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={editedProject.completionDate || ''}
                className="h-7 text-sm font-medium text-right w-32"
                style={{ backgroundColor: 'var(--theme-muted-bg)', borderColor: 'var(--theme-primary)' }}
                disabled
                title="Auto-calculated from phase timeline"
              />
              <Badge variant="outline" className="text-xs" style={{ backgroundColor: 'var(--theme-muted-bg)', color: 'var(--theme-primary)', borderColor: 'var(--theme-primary)' }}>Auto</Badge>
            </div>
          ) : (
            <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{currentProject.completionDate || 'TBD'}</span>
          )}
        </div>

        {ganttTasks.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>
                {isEditMode ? 'Project Phases - Drag to adjust' : 'Project Phases'}
              </div>
              <div className="w-full rounded-lg border" style={{ borderColor: 'var(--theme-muted-bg)' }}>
                <Gantt
                  tasks={ganttTasks}
                  viewMode={ViewMode.Year}
                  onDateChange={isEditMode ? handleTaskChange : undefined}
                  listCellWidth=""
                  columnWidth={80}
                  rowHeight={50}
                  barCornerRadius={6}
                  barFill={60}
                  handleWidth={isEditMode ? 8 : 0}
                  fontSize="11px"
                  fontFamily="Inter, system-ui, sans-serif"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
