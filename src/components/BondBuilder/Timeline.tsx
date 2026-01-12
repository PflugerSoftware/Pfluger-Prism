import { useMemo } from 'react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { useTheme } from '../System/ThemeManager'
import { Calendar, Clock, DollarSign, Tag } from 'lucide-react'
import type { Project, Package } from '../BondBuilderPro'

interface TimelineProps {
  projects: Project[]
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>
  packages: Package[]
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>
  timelineYears: number
  bondStartYear?: number
}

export function Timeline({
  projects,
  setProjects,
  packages,
  setPackages,
  timelineYears,
  bondStartYear
}: TimelineProps) {
  const { projectColors } = useTheme()

  // Convert projects to gantt-task-react Task format
  const tasks: Task[] = useMemo(() => {
    const projectTasks = projects
      .filter(p => p.startDate && p.endDate)
      .map(project => {
        const [startYear, startMonth] = project.startDate.split('-').map(Number)
        const [endYear, endMonth] = project.endDate.split('-').map(Number)

        return {
          id: project.id,
          name: project.name,
          type: 'task' as const,
          start: new Date(startYear, startMonth - 1, 1),
          end: new Date(endYear, endMonth, 0), // Last day of end month
          progress: 0,
          project, // Store project reference for tooltip
          styles: {
            backgroundColor: getProjectColor(project.type),
            backgroundSelectedColor: getProjectColor(project.type),
          }
        }
      })

    // Add invisible boundary tasks to force the timeline to span a fixed 5-year range
    // This ensures the gantt chart always fills the container width consistently
    const startYear = bondStartYear || new Date().getFullYear()
    const endYear = startYear + 5 // Fixed 5-year display

    const boundaryTasks: Task[] = [
      {
        id: '_boundary_start',
        name: '',
        type: 'task' as const,
        start: new Date(startYear, 0, 1),
        end: new Date(startYear, 0, 1),
        progress: 0,
        isDisabled: true,
        styles: {
          backgroundColor: 'transparent',
          backgroundSelectedColor: 'transparent',
          progressColor: 'transparent',
          progressSelectedColor: 'transparent',
        }
      },
      {
        id: '_boundary_end',
        name: '',
        type: 'task' as const,
        start: new Date(endYear, 11, 31),
        end: new Date(endYear, 11, 31),
        progress: 0,
        isDisabled: true,
        styles: {
          backgroundColor: 'transparent',
          backgroundSelectedColor: 'transparent',
          progressColor: 'transparent',
          progressSelectedColor: 'transparent',
        }
      }
    ]

    return [...projectTasks, ...boundaryTasks]
  }, [projects, bondStartYear])

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get project type label
  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'new-construction': 'New Construction',
      'renovation': 'Renovation',
      'addition': 'Addition',
      'equity': 'Equity',
      'specialty': 'Specialty'
    }
    return labels[type] || type
  }

  // Get color based on project type from ThemeManager
  function getProjectColor(type: string): string {
    return projectColors[type as keyof typeof projectColors]?.color || projectColors['new-construction'].color
  }

  // Handle date changes when tasks are dragged (snap to quarters)
  const handleTaskChange = (task: Task) => {
    // Ignore boundary tasks
    if (task.id.startsWith('_boundary_')) return

    setProjects(prev =>
      prev.map(p => {
        if (p.id === task.id) {
          // Snap to quarter start (Jan, Apr, Jul, Oct)
          const startYear = task.start.getFullYear()
          const startMonth = task.start.getMonth() + 1
          const quarterStartMonth = Math.floor((startMonth - 1) / 3) * 3 + 1

          // Calculate end date based on original duration
          const originalProject = prev.find(proj => proj.id === task.id)
          if (originalProject) {
            const [origStartYear, origStartMonth] = originalProject.startDate.split('-').map(Number)
            const [origEndYear, origEndMonth] = originalProject.endDate.split('-').map(Number)

            // Calculate duration in months
            const durationMonths = (origEndYear - origStartYear) * 12 + (origEndMonth - origStartMonth) + 1

            // Apply duration from new snapped start date
            const newStart = new Date(startYear, quarterStartMonth - 1, 1)
            const newEnd = new Date(newStart)
            newEnd.setMonth(newEnd.getMonth() + durationMonths - 1)

            const startDate = `${startYear}-${String(quarterStartMonth).padStart(2, '0')}`
            const endDate = `${newEnd.getFullYear()}-${String(newEnd.getMonth() + 1).padStart(2, '0')}`

            return { ...p, startDate, endDate }
          }
        }
        return p
      })
    )
  }

  // Handle task deletion
  const handleTaskDelete = (task: Task) => {
    // Ignore boundary tasks
    if (task.id.startsWith('_boundary_')) return
    setProjects(prev => prev.filter(p => p.id !== task.id))
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center max-w-md px-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00A9E0] to-[#003C71] flex items-center justify-center">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No Projects Scheduled</h4>
          <p className="text-sm text-gray-500 leading-relaxed">
            Select projects in Step 2 to automatically add them to the timeline. Once added, you can drag projects to schedule them across quarters.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Drag to schedule • Snaps to quarters</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-white overflow-auto">
      <Gantt
        tasks={tasks}
        viewMode={ViewMode.Year}
        onDateChange={handleTaskChange}
        onDelete={handleTaskDelete}
        listCellWidth=""
        columnWidth={100}
        rowHeight={50}
        barCornerRadius={12}
        barFill={60}
        handleWidth={0}
        fontSize="14px"
        fontFamily="Inter, system-ui, sans-serif"
        todayColor="rgba(252, 211, 77, 0.4)"
        TooltipContent={({ task }) => {
          const project = (task as any).project
          if (!project) return null

          return (
            <div className="bg-white border-2 border-gray-200 px-4 py-3 rounded-xl shadow-2xl text-sm min-w-[300px]">
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: getProjectColor(project.type) }}
                >
                  <Tag className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-gray-900 mb-1 truncate">{task.name}</div>
                  <div className="text-xs font-medium px-2 py-0.5 rounded-full inline-block" style={{
                    backgroundColor: `${getProjectColor(project.type)}15`,
                    color: getProjectColor(project.type)
                  }}>
                    {getProjectTypeLabel(project.type)}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4 text-[#67823A] flex-shrink-0" />
                  <span className="text-xs text-gray-500">Cost:</span>
                  <span className="font-semibold ml-auto text-[#67823A]">{formatCurrency(project.cost)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="w-4 h-4 text-[#00A9E0] flex-shrink-0" />
                  <span className="text-xs text-gray-500">Duration:</span>
                  <span className="font-semibold ml-auto">{project.duration} months</span>
                </div>

                <div className="border-t border-gray-200 pt-2.5 mt-2.5">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <div className="text-xs">
                      {task.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} → {task.end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}
