import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Slider } from '../ui/slider'
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Info,
  GripVertical,
  Settings,
  Hammer,
  FileText,
  Pause,
  Plus,
  X
} from 'lucide-react'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { useTheme } from "../System/ThemeManager"
import { ProjectBuilderTempProject } from './ProjectBuilderPro'

interface Phase {
  id: string
  name: string
  description: string
  icon: any
  duration: number // in months
  costPercent?: number // percentage of total project cost (for standard phases)
  cost?: number // manual cost (for pause phases)
  color: string
  bgColor: string
  order: number
  type?: 'standard' | 'pause'
  isRemovable?: boolean
}

interface ProjectBuilderProSchedulePhasesProps {
  tempProject: ProjectBuilderTempProject
  setTempProject: React.Dispatch<React.SetStateAction<ProjectBuilderTempProject>>
}

export function ProjectBuilderProSchedulePhases({ tempProject, setTempProject }: ProjectBuilderProSchedulePhasesProps) {
  const { colors } = useTheme()
  const [inflationRate, setInflationRate] = useState(tempProject.inflationRate || 3.5)
  const [projectStartDate, setProjectStartDate] = useState(
    `${tempProject.constructionYear || new Date().getFullYear()}-01-01`
  )
  const [draggedPhase, setDraggedPhase] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  
  // Phase data with defaults - costs are % of total project cost
  const [phases, setPhases] = useState<Phase[]>([
    {
      id: 'procurement',
      name: 'Procurement',
      description: 'Design team selection, contracting, permits',
      icon: FileText,
      duration: 6,
      costPercent: 5, // 5% of project cost
      color: '#003C71', // Dark Blue
      bgColor: '#E8F4FD',
      order: 1,
      type: 'standard'
    },
    {
      id: 'design',
      name: 'Design',
      description: 'Schematic design, design development, construction documents',
      icon: Settings,
      duration: 12,
      costPercent: 10, // 10% of project cost
      color: '#00A9E0', // Sky Blue
      bgColor: '#E1F5FE',
      order: 2,
      type: 'standard'
    },
    {
      id: 'construction',
      name: 'Construction',
      description: 'Site preparation, building construction, final inspections',
      icon: Hammer,
      duration: 24,
      costPercent: 85, // 85% of project cost
      color: '#67823A', // Olive Green
      bgColor: '#F1F8E9',
      order: 3,
      type: 'standard'
    }
  ])

  // Counter for generating unique pause IDs
  const [pauseCounter, setPauseCounter] = useState(1)

  // Project base cost for percentage calculations (building + site + spaces + LEED)
  const projectBaseCost = tempProject.baseCost + tempProject.siteCosts + tempProject.spaceCosts + tempProject.leedCost

  // Helper to calculate actual cost from percentage or manual cost
  // Percentages are based on the base project cost (not including phase costs)
  const getPhaseActualCost = (phase: Phase): number => {
    if (phase.type === 'pause') {
      return phase.cost || 0
    }
    return (projectBaseCost * (phase.costPercent || 0)) / 100
  }

  // Calculate totals
  const totalDuration = phases.reduce((sum, phase) => sum + phase.duration, 0)

  // Note: We don't calculate inflation here - that's done in the parent component
  // We just show the costs and pass them back via phases array

  // Handle phase duration changes
  const updatePhaseDuration = (phaseId: string, newDuration: number) => {
    setPhases(phases.map(phase =>
      phase.id === phaseId
        ? { ...phase, duration: Math.max(1, Math.min(48, newDuration)) }
        : phase
    ))
  }

  // Handle phase cost/percentage changes
  const updatePhaseCostPercent = (phaseId: string, newPercent: number) => {
    setPhases(phases.map(phase =>
      phase.id === phaseId
        ? { ...phase, costPercent: Math.max(0, Math.min(100, newPercent)) }
        : phase
    ))
  }

  // Handle pause phase manual cost changes
  const updatePauseCost = (phaseId: string, newCost: number) => {
    setPhases(phases.map(phase =>
      phase.id === phaseId
        ? { ...phase, cost: Math.max(0, newCost) }
        : phase
    ))
  }

  // Add project pause
  const addProjectPause = () => {
    const newPause: Phase = {
      id: `pause-${pauseCounter}`,
      name: `Project Pause ${pauseCounter}`,
      description: 'Temporary project hold or delay period',
      icon: Pause,
      duration: 6,
      cost: 0,
      color: '#F2A900', // Orange
      bgColor: '#FFF8E1',
      order: phases.length + 1,
      type: 'pause',
      isRemovable: true
    }
    setPhases([...phases, newPause])
    setPauseCounter(pauseCounter + 1)
  }

  // Remove phase (only for pausable phases)
  const removePhase = (phaseId: string) => {
    const updatedPhases = phases.filter(phase => phase.id !== phaseId)
    // Reorder remaining phases
    const reorderedPhases = updatedPhases.map((phase, index) => ({
      ...phase,
      order: index + 1
    }))
    setPhases(reorderedPhases)
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, phaseId: string) => {
    setDraggedPhase(phaseId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, phaseId: string) => {
    e.preventDefault()
    setDragOver(phaseId)
  }

  const handleDragLeave = () => {
    setDragOver(null)
  }

  const handleDrop = (e: React.DragEvent, targetPhaseId: string) => {
    e.preventDefault()
    if (!draggedPhase || draggedPhase === targetPhaseId) return

    const draggedIndex = phases.findIndex(p => p.id === draggedPhase)
    const targetIndex = phases.findIndex(p => p.id === targetPhaseId)
    
    const newPhases = [...phases]
    const [draggedItem] = newPhases.splice(draggedIndex, 1)
    newPhases.splice(targetIndex, 0, draggedItem)
    
    // Update order
    const updatedPhases = newPhases.map((phase, index) => ({
      ...phase,
      order: index + 1
    }))
    
    setPhases(updatedPhases)
    setDraggedPhase(null)
    setDragOver(null)
  }

  // Get phase start date
  const getPhaseStartDate = (phaseIndex: number) => {
    const startDate = new Date(projectStartDate)
    let monthsToAdd = 0
    
    for (let i = 0; i < phaseIndex; i++) {
      monthsToAdd += phases[i].duration
    }
    
    startDate.setMonth(startDate.getMonth() + monthsToAdd)
    return startDate
  }

  // Get phase end date
  const getPhaseEndDate = (phaseIndex: number) => {
    const startDate = getPhaseStartDate(phaseIndex)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + phases[phaseIndex].duration)
    return endDate
  }

  // Sort phases by order
  const sortedPhases = [...phases].sort((a, b) => a.order - b.order)

  // Convert phases to Gantt tasks
  const ganttTasks: Task[] = useMemo(() => {
    let currentDate = new Date(projectStartDate)

    return sortedPhases.map(phase => {
      const start = new Date(currentDate)
      const end = new Date(currentDate)
      end.setMonth(end.getMonth() + phase.duration)

      // Prepare for next phase
      currentDate = new Date(end)

      return {
        id: phase.id,
        name: phase.name,
        type: 'task' as const,
        start,
        end,
        progress: 0,
        phase, // Store reference for tooltip
        styles: {
          backgroundColor: phase.color,
          backgroundSelectedColor: phase.color,
          ...(phase.type === 'pause' && {
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${phase.color},
              ${phase.color} 10px,
              rgba(255,255,255,0.1) 10px,
              rgba(255,255,255,0.1) 20px
            )`
          })
        }
      }
    })
  }, [sortedPhases, projectStartDate])

  // Handle Gantt date changes
  const handleTaskChange = (task: Task) => {
    const phase = (task as any).phase
    if (!phase) return

    // Calculate new duration based on dragged dates
    const newDuration = Math.round(
      (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )

    // Update phase duration
    setPhases(prev => prev.map(p =>
      p.id === phase.id
        ? { ...p, duration: Math.max(1, newDuration) }
        : p
    ))
  }

  // Update tempProject when phases, inflation rate, or project start date change
  useEffect(() => {
    const phasesForProject = phases.map(phase => ({
      id: phase.id,
      name: phase.name,
      duration: phase.duration,
      cost: getPhaseActualCost(phase) // Use calculated cost
    }))

    setTempProject(prev => ({
      ...prev,
      phases: phasesForProject,
      inflationRate: inflationRate,
      projectStartDate: projectStartDate,
      totalDuration: totalDuration
    }))
  }, [phases, inflationRate, projectStartDate, totalDuration, setTempProject, projectBaseCost])

  return (
    <div className="space-y-8">
      {/* Project Settings */}


      <Separator />

      {/* Timeline Chart */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5" style={{ color: colors.secondary.skyBlue }} />
          <Label className="text-lg">Project Timeline</Label>
          <Info className="h-4 w-4 text-gray-400" />
        </div>

        {/* Gantt Chart Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Timeline Overview - Drag phases to adjust schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] overflow-auto">
              <Gantt
                tasks={ganttTasks}
                viewMode={ViewMode.Year}
                onDateChange={handleTaskChange}
                listCellWidth=""
                columnWidth={120}
                rowHeight={55}
                barCornerRadius={8}
                barFill={65}
                handleWidth={8}
                fontSize="13px"
                fontFamily="Inter, system-ui, sans-serif"
                TooltipContent={({ task }) => {
                  const phase = (task as any).phase
                  if (!phase) return null

                  const PhaseIcon = phase.icon

                  return (
                    <div className="bg-white border-2 border-gray-200 px-4 py-3 rounded-xl shadow-2xl text-sm min-w-[280px]">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: phase.color }}
                        >
                          <PhaseIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base text-gray-900 mb-1">{phase.name}</div>
                          {phase.type === 'pause' && (
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: phase.color,
                                color: phase.color,
                                backgroundColor: phase.bgColor
                              }}
                            >
                              PAUSE
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs text-gray-600">{phase.description}</div>

                        <div className="flex items-center gap-2 text-gray-700 pt-2 border-t border-gray-200">
                          <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-xs text-gray-500">Duration:</span>
                          <span className="font-semibold ml-auto">{phase.duration} months</span>
                        </div>

                        {(getPhaseActualCost(phase) > 0 || phase.type === 'pause') && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-xs text-gray-500">
                              {phase.type === 'pause' ? 'Delay Cost:' : `Cost (${phase.costPercent}%):`}
                            </span>
                            <span className="font-semibold ml-auto text-green-700">
                              ${getPhaseActualCost(phase).toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-gray-200 pt-2 mt-2">
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
          </CardContent>
        </Card>

        {/* Editable Phases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">Phase Configuration (Drag to Reorder)</Label>
            <Button
              onClick={addProjectPause}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Project Pause
            </Button>
          </div>
          {sortedPhases.map((phase, index) => {
            const startDate = getPhaseStartDate(index)
            const endDate = getPhaseEndDate(index)
            
            return (
              <Card
                key={phase.id}
                className={`transition-all duration-200 ${
                  dragOver === phase.id ? 'ring-2 ring-blue-400' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, phase.id)}
                onDragOver={(e) => handleDragOver(e, phase.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, phase.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="cursor-move">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                    
                    <div className="flex items-center gap-3 flex-1">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: phase.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{phase.name}</h4>
                          {phase.type === 'pause' && (
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: phase.color, 
                                color: phase.color,
                                backgroundColor: phase.bgColor 
                              }}
                            >
                              PAUSE
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Label className="text-xs text-gray-500">Duration</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            value={phase.duration}
                            onChange={(e) => updatePhaseDuration(phase.id, parseInt(e.target.value) || 0)}
                            min="1"
                            max="48"
                            className="w-16 text-center"
                          />
                          <span className="text-sm text-gray-500">mo</span>
                        </div>
                      </div>

                      {phase.type === 'pause' ? (
                        <div className="text-right">
                          <Label className="text-xs text-gray-500">Delay Cost</Label>
                          <Input
                            type="number"
                            value={phase.cost || 0}
                            onChange={(e) => updatePauseCost(phase.id, parseInt(e.target.value) || 0)}
                            className="w-32 text-right mt-1"
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <div className="text-right">
                          <Label className="text-xs text-gray-500">Budget %</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              value={phase.costPercent || 0}
                              onChange={(e) => updatePhaseCostPercent(phase.id, parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                              step="0.1"
                              className="w-20 text-center"
                            />
                            <span className="text-sm text-gray-500">%</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            ${getPhaseActualCost(phase).toLocaleString()}
                          </div>
                        </div>
                      )}

                      {phase.isRemovable && (
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePhase(phase.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>


    </div>
  )
}