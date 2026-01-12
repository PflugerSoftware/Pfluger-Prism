import { useState, useMemo } from 'react'
import { DollarSign, Calendar, Building2, Briefcase, List as ListIcon, Edit2, Trash2, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { getProjectTypeColor, useTheme } from '../System/ThemeManager'
import { DetailSidebar } from './DetailSidebar'
import { Bond } from '../../data/loadBonds'
import { useBondProjects } from '../../hooks/useBondProjects'
import { useBonds } from '../System/BondsContext'

interface BondDetailsContentProps {
  bond: Bond | null
  isOpen: boolean
  isMainSidebarExpanded: boolean
  onClose: () => void
  hasParentPadding?: boolean
}

export function BondDetailsContent({ bond, isOpen, isMainSidebarExpanded, onClose, hasParentPadding = false }: BondDetailsContentProps) {
  const [activeTab, setActiveTab] = useState('details')
  const [hoveredButton, setHoveredButton] = useState<string | null>(null)
  const { colors, utils, statusColors: themeStatusColors } = useTheme()
  const { deleteBond } = useBonds()

  // Get bond projects dynamically - this ensures we always have current data
  const bondProjects = useBondProjects(bond)

  const handleEdit = () => {
    // TODO: Implement edit functionality
    alert('Edit bond functionality coming soon!')
  }

  const handleDelete = async () => {
    if (!bond) return

    if (confirm(`Are you sure you want to delete "${bond.name}"? This action cannot be undone.`)) {
      try {
        await deleteBond(bond.id)
        onClose()
        alert('Bond deleted successfully')
      } catch (error) {
        alert('Failed to delete bond')
      }
    }
  }

  // Render action buttons (iOS-style circular buttons)
  const actionButtons = (
    <>
      <button
        onClick={handleEdit}
        onMouseEnter={() => setHoveredButton('edit')}
        onMouseLeave={() => setHoveredButton(null)}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: themeStatusColors.info.color,
          transform: hoveredButton === 'edit' ? 'scale(1.15)' : 'scale(1)',
        }}
        title="Edit bond"
      >
        <Edit2
          className="h-3 w-3 text-white transition-opacity duration-200"
          style={{
            opacity: hoveredButton === 'edit' ? 1 : 0
          }}
        />
      </button>
      <button
        onClick={handleDelete}
        onMouseEnter={() => setHoveredButton('delete')}
        onMouseLeave={() => setHoveredButton(null)}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: themeStatusColors.error.color,
          transform: hoveredButton === 'delete' ? 'scale(1.15)' : 'scale(1)',
        }}
        title="Delete bond"
      >
        <Trash2
          className="h-3 w-3 text-white transition-opacity duration-200"
          style={{
            opacity: hoveredButton === 'delete' ? 1 : 0
          }}
        />
      </button>
      <button
        onClick={onClose}
        onMouseEnter={() => setHoveredButton('close')}
        onMouseLeave={() => setHoveredButton(null)}
        className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out"
        style={{
          backgroundColor: themeStatusColors.neutral.color,
          transform: hoveredButton === 'close' ? 'scale(1.15)' : 'scale(1)',
        }}
        title="Close"
      >
        <XCircle
          className="h-3 w-3 text-white transition-opacity duration-200"
          style={{
            opacity: hoveredButton === 'close' ? 1 : 0
          }}
        />
      </button>
    </>
  )

  // Convert bond projects to Gantt tasks - MUST be called before early return
  const ganttTasks: Task[] = useMemo(() => {
    if (!bondProjects || bondProjects.length === 0) {
      return []
    }

    // Helper function to parse dates in various formats
    const parseProjectDate = (dateStr: string): Date | null => {
      if (!dateStr) return null

      // Try "YYYY-MM" format first
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-').map(Number)
        const year = parts[0]
        const month = parts[1]
        if (!isNaN(year) && !isNaN(month)) {
          const date = new Date(year, month - 1, 1)
          if (!isNaN(date.getTime())) return date
        }
      }

      // Try "Month Year" format (e.g., "January 2026")
      if (dateStr.includes(' ')) {
        const [monthStr, yearStr] = dateStr.split(' ')
        const year = parseInt(yearStr)
        if (!isNaN(year)) {
          const monthIndex = new Date(Date.parse(monthStr + " 1, 2000")).getMonth()
          const date = new Date(year, monthIndex, 1)
          if (!isNaN(date.getTime())) return date
        }
      }

      return null
    }

    return bondProjects
      .filter(p => p.startDate && p.endDate)
      .map(project => {
        const startDate = parseProjectDate(project.startDate)
        const endDate = parseProjectDate(project.endDate)

        // Skip if either date is invalid
        if (!startDate || !endDate) {
          return null
        }

        // Set end date to last day of month
        const endDateLastDay = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0)

        const projectColor = getProjectTypeColor(project.type).color

        return {
          id: project.id,
          name: project.name,
          type: 'task' as const,
          start: startDate,
          end: endDateLastDay,
          progress: 0,
          styles: {
            backgroundColor: projectColor,
            backgroundSelectedColor: projectColor,
          }
        }
      })
      .filter((task): task is Task => task !== null)
  }, [bondProjects])

  // Early return AFTER all hooks
  if (!bond) return null

  // Get bond status color from theme
  const getBondStatusColor = () => {
    const status = bond.status.toLowerCase()
    if (status.includes('approved') || status.includes('active')) return themeStatusColors.success.color
    if (status.includes('draft') || status.includes('pending')) return themeStatusColors.warning.color
    if (status.includes('complete')) return themeStatusColors.info.color
    return themeStatusColors.neutral.color
  }

  const bondStatusColor = getBondStatusColor()

  // Calculate cost breakdown by project type
  const costByType = bondProjects.reduce((acc, project) => {
    if (!acc[project.type]) {
      acc[project.type] = 0
    }
    acc[project.type] += project.cost
    return acc
  }, {} as Record<string, number>)

  const costBreakdownData = Object.entries(costByType).map(([type, cost]) => ({
    type,
    cost,
    color: getProjectTypeColor(type).color
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value)
  }

  // Render title with icon
  const titleWithIcon = (
    <div className="flex items-center gap-3">
      <Briefcase className="h-6 w-6" style={{ color: bondStatusColor }} />
      <span style={{ color: 'var(--theme-text-primary)' }}>{bond.name}</span>
    </div>
  )

  // Render badges
  const badges = (
    <Badge
      className="text-sm font-medium"
      style={{
        backgroundColor: utils.rgba(bondStatusColor, 0.15),
        color: bondStatusColor,
        border: `1px solid ${utils.rgba(bondStatusColor, 0.3)}`
      }}
    >
      {bond.status}
    </Badge>
  )

  // Render quick stats
  const quickStats = (
    <div className="grid grid-cols-3 gap-4">
      <div className="min-w-0">
        <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Total Value</div>
        <div className="text-xl font-bold truncate" style={{ color: bondStatusColor }}>
          {formatCurrency(bond.totalValue)}
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Projects</div>
        <div className="text-xl font-bold truncate" style={{ color: 'var(--theme-text-primary)' }}>{bond.projectCount}</div>
      </div>
      <div className="min-w-0">
        <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Timeline</div>
        <div className="text-xl font-bold truncate" style={{ color: 'var(--theme-text-primary)' }}>{bond.startYear} - {bond.endYear}</div>
      </div>
    </div>
  )

  return (
    <DetailSidebar
      isOpen={isOpen}
      isMainSidebarExpanded={isMainSidebarExpanded}
      onClose={onClose}
      title={bond.name}
      actionButtons={actionButtons}
      badges={badges}
      headerColor={utils.rgba(bondStatusColor, 0.05)}
      quickStats={quickStats}
      zIndex={1000}
      hasParentPadding={hasParentPadding}
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

            {/* Details Tab - Scrollable content */}
            <TabsContent value="details" className="px-4 py-6 space-y-6 mt-0 flex-1 overflow-y-auto data-[state=inactive]:hidden">
              {/* Bond Information */}
              <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Briefcase className="h-4 w-4" style={{ color: themeStatusColors.info.color }} />
                    Bond Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Approval Date</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>{bond.approvalDate}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Total Budget</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>{formatCurrency(bond.totalBudget || bond.totalValue)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Total Allocated</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>{formatCurrency(bond.totalValue)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Remaining Budget</span>
                    <span className="text-sm font-medium" style={{
                      color: (bond.totalBudget || bond.totalValue) - bond.totalValue > 0
                        ? themeStatusColors.success.color
                        : themeStatusColors.error.color
                    }}>
                      {formatCurrency((bond.totalBudget || bond.totalValue) - bond.totalValue)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" style={{ color: themeStatusColors.success.color }} />
                    Cost by Project Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={costBreakdownData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--theme-muted-bg)" />
                      <XAxis dataKey="type" tick={{ fontSize: 11, fill: 'var(--theme-text-tertiary)' }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: 'var(--theme-text-tertiary)' }} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="cost" radius={[8, 8, 0, 0]}>
                        {costBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bond Timeline */}
              <Card className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 min-w-0">
                    <Calendar className="h-4 w-4 flex-shrink-0" style={{ color: themeStatusColors.warning.color }} />
                    <span className="truncate">Project Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Timeline Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--theme-text-secondary)' }}>Duration</span>
                      <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                        {(() => {
                          const totalDuration = bondProjects.reduce((sum, p) => sum + (p.duration || 0), 0)
                          return totalDuration > 0 ? `${totalDuration} months` : 'TBD'
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--theme-text-secondary)' }}>Start Date</span>
                      <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                        {(() => {
                          const startDates = bondProjects
                            .map(p => p.startDate)
                            .filter(d => d)
                            .sort()
                          return startDates.length > 0 ? startDates[0] : 'TBD'
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--theme-text-secondary)' }}>Completion Date</span>
                      <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                        {(() => {
                          const endDates = bondProjects
                            .map(p => p.endDate)
                            .filter(d => d)
                            .sort()
                          return endDates.length > 0 ? endDates[endDates.length - 1] : 'TBD'
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Gantt Chart */}
                  {ganttTasks.length > 0 && (
                    <>
                      <Separator />
                      <div className="w-full overflow-auto rounded-lg border border-gray-300">
                        <Gantt
                          tasks={ganttTasks}
                          viewMode={ViewMode.Year}
                          listCellWidth=""
                          columnWidth={80}
                          rowHeight={25}
                          barCornerRadius={12.5}
                          barFill={90}
                          fontSize="11px"
                          fontFamily="Inter, system-ui, sans-serif"
                        />
                      </div>
                    </>
                  )}

                  {ganttTasks.length === 0 && (
                    <div className="text-center py-8" style={{ color: 'var(--theme-text-tertiary)' }}>
                      <Calendar className="h-12 w-12 mx-auto mb-2" style={{ color: 'var(--theme-muted-bg)' }} />
                      <p>No timeline data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab - Scrollable content */}
            <TabsContent value="projects" className="px-4 py-6 space-y-3 mt-0 flex-1 overflow-y-auto data-[state=inactive]:hidden">
              {bondProjects.map((project) => {
                const projectColor = getProjectTypeColor(project.type).color
                return (
                  <Card key={project.id} className="shadow-sm hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--theme-card-bg)', borderColor: 'var(--theme-muted-bg)' }}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1 h-16 rounded-full flex-shrink-0"
                          style={{ backgroundColor: projectColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1">{project.name}</h4>
                          <Badge
                            className="text-xs mb-2"
                            style={{
                              backgroundColor: utils.rgba(projectColor, 0.1),
                              color: projectColor,
                              border: `1px solid ${utils.rgba(projectColor, 0.3)}`
                            }}
                          >
                            {project.type}
                          </Badge>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span style={{ color: 'var(--theme-text-secondary)' }}>Cost: </span>
                              <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{formatCurrency(project.cost)}</span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--theme-text-secondary)' }}>Duration: </span>
                              <span className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>{project.duration} months</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          </Tabs>
    </DetailSidebar>
  )
}
