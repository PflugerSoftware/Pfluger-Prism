import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Checkbox } from '../ui/checkbox'
import { Separator } from '../ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign,
  Download
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { useTheme, getProjectTypeColor } from "../System/ThemeManager"
import { useProjects } from "../System/ProjectsContext"

// Removed mock data - now using real projects from context
interface ProjectCompareProps {
  selectedProjectIds: number[]
}

export function ProjectCompare({ selectedProjectIds }: ProjectCompareProps) {
  const { colors, utils } = useTheme()
  const { projects } = useProjects()
  const [activeTab, setActiveTab] = useState('overview')

  // Get selected projects from real data
  const selectedProjectsData = projects
    .filter(p => selectedProjectIds.includes(p.id))
    .map(p => ({
      id: p.id,
      name: p.name,
      buildingType: p.buildingType,
      projectType: p.projectType,
      totalCost: p.costEstimate,
      squareFootage: p.squareFootage,
      costPerSF: p.costEstimate / p.squareFootage,
      baseCost: p.baseCost,
      siteCosts: p.siteCosts,
      designCosts: p.designCosts,
      contingency: p.contingency,
      duration: parseInt(p.duration?.replace(/[^\d]/g, '') || '0'),
      startDate: p.startDate || 'TBD',
      completionDate: p.completionDate || 'TBD',
      phases: [
        { name: 'Design', duration: Math.round(parseInt(p.duration?.replace(/[^\d]/g, '') || '0') * 0.25), color: '#003C71' },
        { name: 'Permitting', duration: Math.round(parseInt(p.duration?.replace(/[^\d]/g, '') || '0') * 0.10), color: '#00A9E0' },
        { name: 'Construction', duration: Math.round(parseInt(p.duration?.replace(/[^\d]/g, '') || '0') * 0.60), color: '#67823A' },
        { name: 'Closeout', duration: Math.round(parseInt(p.duration?.replace(/[^\d]/g, '') || '0') * 0.05), color: '#F2A900' }
      ]
    }))

  // Prepare data for cost comparison chart
  const costComparisonData = [
    {
      metric: 'Total Cost',
      ...Object.fromEntries(selectedProjectsData.map(p => [p.name, p.totalCost]))
    },
    {
      metric: 'Base Cost',
      ...Object.fromEntries(selectedProjectsData.map(p => [p.name, p.baseCost]))
    },
    {
      metric: 'Site Costs',
      ...Object.fromEntries(selectedProjectsData.map(p => [p.name, p.siteCosts]))
    },
    {
      metric: 'Design Costs',
      ...Object.fromEntries(selectedProjectsData.map(p => [p.name, p.designCosts]))
    },
    {
      metric: 'Contingency',
      ...Object.fromEntries(selectedProjectsData.map(p => [p.name, p.contingency]))
    }
  ]

  // Prepare data for cost per SF chart
  const costPerSFData = selectedProjectsData.map(p => ({
    name: p.name.split(' ').slice(0, 3).join(' ') + '...',
    fullName: p.name,
    costPerSF: p.costPerSF,
    squareFootage: p.squareFootage
  }))

  // Prepare data for timeline chart
  const timelineData = selectedProjectsData.map(p => ({
    name: p.name.split(' ').slice(0, 3).join(' ') + '...',
    fullName: p.name,
    duration: p.duration
  }))

  // Generate colors from project type colors (one color per project based on its type)
  const projectColors = selectedProjectsData.map(project =>
    getProjectTypeColor(project.projectType).color
  )

  // Create Gantt tasks from project data
  const ganttTasks = useMemo(() => {
    const tasks: Task[] = []

    selectedProjectsData.forEach((project, projectIndex) => {
      // Parse start date or use today as default
      let projectStartDate = new Date()
      if (project.startDate && project.startDate !== 'TBD') {
        const parsedDate = new Date(project.startDate)
        if (!isNaN(parsedDate.getTime())) {
          projectStartDate = parsedDate
        }
      }

      let cumulativeMonths = 0

      // Add each phase as a separate task
      project.phases.forEach((phase, phaseIndex) => {
        const phaseStart = new Date(projectStartDate)
        phaseStart.setMonth(phaseStart.getMonth() + cumulativeMonths)

        const phaseEnd = new Date(phaseStart)
        phaseEnd.setMonth(phaseEnd.getMonth() + phase.duration)

        tasks.push({
          id: `project-${project.id}-phase-${phaseIndex}`,
          name: `${project.name} - ${phase.name}`,
          start: phaseStart,
          end: phaseEnd,
          type: 'task',
          progress: 0,
          styles: {
            backgroundColor: phase.color,
            progressColor: phase.color,
            progressSelectedColor: phase.color,
          },
          project: project.name
        })

        cumulativeMonths += phase.duration
      })
    })

    return tasks
  }, [selectedProjectsData])

  const formatCurrency = (value: number) => {
    return `$${(value / 1000000).toFixed(1)}M`
  }

  const formatNumber = (value: number) => {
    return value.toLocaleString()
  }

  if (selectedProjectsData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No projects selected for comparison
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">Comparing {selectedProjectsData.length} project{selectedProjectsData.length !== 1 ? 's' : ''}</p>
        </div>
        <Button
          variant="outline"
          style={{ borderColor: colors.secondary.skyBlue, color: colors.secondary.skyBlue }}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Comparison
        </Button>
      </div>

      {selectedProjectsData.length > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedProjectsData.map((project, index) => {
              const projectColor = projectColors[index]
              return (
                <Card key={project.id} className="border-t-4" style={{ borderTopColor: projectColor }}>
                  <CardHeader>
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge
                      className="w-fit mt-2"
                      style={{
                        backgroundColor: utils.rgba(projectColor, 0.1),
                        color: projectColor,
                        border: `1px solid ${utils.rgba(projectColor, 0.3)}`
                      }}
                    >
                      {project.projectType}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Total Cost</div>
                        <div className="text-2xl font-bold" style={{ color: projectColor }}>
                          {formatCurrency(project.totalCost)}
                        </div>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600">Cost/SF</div>
                          <div className="font-medium">${project.costPerSF.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Square Footage</div>
                          <div className="font-medium">{formatNumber(project.squareFootage)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Duration</div>
                          <div className="font-medium">{project.duration} months</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Building Type</div>
                          <div className="font-medium">{project.buildingType}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            </div>
          </TabsContent>

          {/* Cost Analysis Tab */}
          <TabsContent value="costs" className="space-y-6 mt-6">
            {/* Cost Comparison Chart */}
            <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" style={{ color: colors.secondary.skyBlue }} />
                  <CardTitle>Cost Breakdown Comparison</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={costComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
                  />
                  <Legend />
                  {selectedProjectsData.map((project, index) => (
                    <Bar 
                      key={project.id}
                      dataKey={project.name} 
                      fill={projectColors[index]}
                      name={project.name.split(' ').slice(0, 4).join(' ')}
                      radius={[16, 16, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-6 mt-6">
            {/* Gantt Chart Timeline */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" style={{ color: colors.secondary.skyBlue }} />
                  <CardTitle>Project Timeline Comparison</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {ganttTasks.length > 0 ? (
                  <div className="w-full overflow-auto rounded-lg border border-gray-300">
                    <Gantt
                      tasks={ganttTasks}
                      viewMode={ViewMode.Year}
                      listCellWidth=""
                      columnWidth={80}
                      rowHeight={50}
                      barCornerRadius={6}
                      barFill={60}
                      fontSize="11px"
                      fontFamily="Inter, system-ui, sans-serif"
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No timeline data available for selected projects
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}