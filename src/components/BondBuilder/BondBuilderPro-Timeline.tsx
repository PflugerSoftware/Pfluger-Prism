import { useMemo, useEffect } from 'react'
import { Timeline } from './Timeline'
import {
  BarChart3,
  Calendar,
  Trash2,
  Clock,
  Layers
} from 'lucide-react'
import { useTheme } from '../System/ThemeManager'
import { BondBuilderTempBond, Project, Package } from './BondBuilderPro'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { PROJECT_TYPE_COLORS } from "../System/ThemeManager"

interface BondBuilderProTimelineProps {
  tempBond: BondBuilderTempBond
  setTempBond: React.Dispatch<React.SetStateAction<BondBuilderTempBond>>
  availableProjects: Project[]
  timelineProjects: Project[]
  setTimelineProjects: React.Dispatch<React.SetStateAction<Project[]>>
  packages: Package[]
  setPackages: React.Dispatch<React.SetStateAction<Package[]>>
}

const projectTypeColors = {
  'new-construction': PROJECT_TYPE_COLORS['new-construction'].color,
  'renovation': PROJECT_TYPE_COLORS['renovation'].color,
  'addition': PROJECT_TYPE_COLORS['addition'].color,
  'equity': PROJECT_TYPE_COLORS['equity'].color,
  'specialty': PROJECT_TYPE_COLORS['specialty'].color
}

const projectTypeLabels = {
  'new-construction': 'New Construction',
  'renovation': 'Renovations',
  'addition': 'Additions', 
  'equity': 'Equity',
  'specialty': 'Specialty'
}

export function BondBuilderProTimeline({
  tempBond,
  setTempBond,
  availableProjects,
  timelineProjects,
  setTimelineProjects,
  packages,
  setPackages
}: BondBuilderProTimelineProps) {
  const { colors, themeColors } = useTheme()

  // Auto-populate timeline with selected projects from Step 2
  useEffect(() => {
    const defaultStartYear = 2026 // Default projects to start in 2026

    setTimelineProjects(prev => {
      // Remove projects that are no longer selected
      const filtered = prev.filter(tp => {
        const baseId = tp.id.split('-')[0]
        return tempBond.selectedProjectIds.includes(baseId)
      })

      // Add newly selected projects
      const newProjects = availableProjects
        .filter(p => tempBond.selectedProjectIds.includes(p.id))
        .filter(p => !filtered.find(tp => tp.id.startsWith(p.id)))
        .map(p => {
          const startDate = `${defaultStartYear}-01`
          const start = new Date(startDate + '-01')
          const end = new Date(start)
          end.setMonth(end.getMonth() + p.duration - 1)
          const endDate = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}`

          return {
            ...p,
            id: `${p.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            startDate,
            endDate
          }
        })

      return newProjects.length > 0 ? [...filtered, ...newProjects] : filtered
    })
  }, [tempBond.selectedProjectIds, availableProjects, setTimelineProjects])

  // Chart calculations - memoized to update when timelineProjects changes
  const currentYear = new Date().getFullYear()
  const projects = timelineProjects

  // Memoize date range calculation - this is the ACTUAL project timeframe
  const dateRange = useMemo(() => {
    if (projects.length === 0) {
      return { start: currentYear, end: currentYear + 10 }
    }

    const years = projects.flatMap(p => {
      if (!p.startDate || !p.endDate) return []
      return [parseInt(p.startDate.split('-')[0]), parseInt(p.endDate.split('-')[0])]
    })

    const calculatedStart = Math.min(...years)
    const calculatedEnd = Math.max(...years)

    return {
      start: calculatedStart,
      end: calculatedEnd
    }
  }, [projects, currentYear])

  // Calculate project timeframe duration (years of actual construction)
  const projectTimeframeYears = useMemo(() => {
    if (projects.length === 0 || projects.every(p => !p.startDate || !p.endDate)) {
      return 0
    }
    return dateRange.end - dateRange.start + 1
  }, [dateRange, projects])

  // Memoize monthly cost calculations
  const monthlyCostData = useMemo(() => {
    const months = []
    for (let year = dateRange.start; year <= dateRange.end; year++) {
      for (let month = 1; month <= 12; month++) {
        months.push({
          year,
          month,
          key: `${year}-${String(month).padStart(2, '0')}`,
          display: `${year} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month - 1]}`
        })
      }
    }

    return months.map(({ year, month, key, display }) => {
      const monthData: any = {
        year,
        month,
        key,
        display,
        period: `Q${Math.ceil(month / 3)} ${year}`,
        isQuarterStart: month % 3 === 1
      }
      let total = 0

      Object.keys(projectTypeColors).forEach(type => {
        monthData[type] = 0
      })

      projects.forEach(project => {
        if (!project.startDate || !project.endDate) return

        const [startYear, startMonth] = project.startDate.split('-').map(Number)
        const [endYear, endMonth] = project.endDate.split('-').map(Number)

        const currentDate = new Date(year, month - 1, 1)
        const projectStart = new Date(startYear, startMonth - 1, 1)
        const projectEnd = new Date(endYear, endMonth - 1, 1)

        if (currentDate >= projectStart && currentDate <= projectEnd) {
          const totalProjectMonths = project.duration
          const monthlyCost = project.cost / totalProjectMonths

          monthData[project.type] += monthlyCost
          total += monthlyCost
        }
      })

      monthData.total = total
      return monthData
    })
  }, [projects, dateRange])

  // Memoize yearly data
  const yearlyData = useMemo(() => {
    const years: any[] = []

    for (let year = dateRange.start; year <= dateRange.end; year++) {
      const yearMonths = monthlyCostData.filter(month => month.year === year)

      if (yearMonths.length === 0) continue

      const yearData: any = {
        year,
        period: `${year}`,
        total: 0,
        projects: [] // Store individual project costs for this year
      }

      Object.keys(projectTypeColors).forEach(type => {
        yearData[type] = 0
      })

      // Track individual projects in this year
      const projectCosts: Record<string, { project: any, cost: number }> = {}

      projects.forEach(project => {
        if (!project.startDate || !project.endDate) return

        const [startYear, startMonth] = project.startDate.split('-').map(Number)
        const [endYear, endMonth] = project.endDate.split('-').map(Number)

        // Check if project is active during this year
        if (year >= startYear && year <= endYear) {
          const totalProjectMonths = project.duration
          const monthlyCost = project.cost / totalProjectMonths

          // Count how many months in this year
          const yearStart = new Date(year, 0, 1)
          const yearEnd = new Date(year, 11, 31)
          const projectStart = new Date(startYear, startMonth - 1, 1)
          const projectEnd = new Date(endYear, endMonth - 1, 1)

          const effectiveStart = projectStart > yearStart ? projectStart : yearStart
          const effectiveEnd = projectEnd < yearEnd ? projectEnd : yearEnd

          const monthsInYear = Math.round((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1
          const yearCost = monthlyCost * monthsInYear

          projectCosts[project.id] = {
            project,
            cost: yearCost
          }
        }
      })

      // Add project costs to yearData
      Object.values(projectCosts).forEach(({ project, cost }) => {
        yearData.projects.push({ name: project.name, cost, type: project.type, color: projectTypeColors[project.type as keyof typeof projectTypeColors] })
        yearData[project.type] += cost
        yearData.total += cost
      })

      years.push(yearData)
    }

    return years
  }, [monthlyCostData, dateRange])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Get the year data which contains individual projects
      const yearData = yearlyData.find(y => y.period === label)

      if (!yearData || !yearData.projects || yearData.projects.length === 0) return null

      const total = yearData.total

      return (
        <div className="p-3 border rounded-lg shadow-lg max-w-xs" style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.muted
        }}>
          <p className="font-semibold mb-2" style={{ color: themeColors.textPrimary }}>{`${label}: ${formatCurrency(total)}`}</p>
          <div className="space-y-1">
            {yearData.projects
              .sort((a: any, b: any) => b.cost - a.cost)
              .map((project: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-3 h-3 rounded flex-shrink-0"
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <span className="font-medium flex-shrink-0">{formatCurrency(project.cost)}</span>
                </div>
              ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{
      background: `linear-gradient(to bottom right, ${themeColors.appBg}, ${themeColors.mutedBg})`
    }}>
        {/* Tab Navigation */}
        <div className="px-6 py-4 flex-shrink-0 shadow-sm border-b" style={{
          backgroundColor: themeColors.cardBg,
          borderColor: themeColors.muted
        }}>
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: colors.secondary.skyBlue }} />
              <h2 className="text-lg font-semibold text-gray-900">Bond Timeline</h2>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-6 px-4 py-2 rounded-lg border" style={{
                  backgroundColor: themeColors.mutedBg,
                  borderColor: themeColors.muted
                }}>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4" style={{ color: colors.secondary.skyBlue }} />
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{timelineProjects.length}</span> projects
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" style={{ color: colors.secondary.skyBlue }} />
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">{tempBond.timelineYears}</span>-year bond
                    </span>
                  </div>
                  {projectTimeframeYears > 0 && (
                    <>
                      <div className="w-px h-4 bg-gray-300" />
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" style={{ color: colors.secondary.skyBlue }} />
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">{dateRange.start}-{dateRange.end}</span> construction
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={() => {
                    setTimelineProjects([])
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all hover:shadow-md"
                  style={{
                    backgroundColor: `${colors.primary.brick}10`,
                    color: colors.primary.brick,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary.brick
                    e.currentTarget.style.color = colors.primary.white
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary.brick}10`
                    e.currentTarget.style.color = colors.primary.brick
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </button>
            </div>
          </div>
        </div>

        {/* Main Content Area - Side by Side Layout */}
        <div className="flex-1 overflow-hidden p-6">
          <div className="flex gap-4 h-full w-full">
            {/* Left Side - Timeline (50% width) */}
            <div style={{
              width: '50%',
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.muted
            }} className="min-w-0 rounded-xl shadow-lg border overflow-hidden">
              <Timeline
                projects={timelineProjects}
                setProjects={setTimelineProjects}
                packages={packages}
                setPackages={setPackages}
                timelineYears={tempBond.timelineYears}
                bondStartYear={tempBond.bondStartYear}
              />
            </div>

            {/* Right Side - Annual Cost Breakdown (50% width) */}
            <div style={{
              width: '50%',
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.muted
            }} className="min-w-0 rounded-xl border-2 px-6 pt-4 pb-2 shadow-lg overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-5 w-5" style={{ color: colors.secondary.skyBlue }} />
                <h3 className="text-lg font-semibold text-gray-900">Annual Cost Breakdown</h3>
              </div>
              {timelineProjects.length > 0 ? (
                <div style={{ width: '100%', height: 'calc(100% - 60px)', minHeight: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 11 }}
                        domain={[0, (dataMax: number) => Math.ceil(dataMax / 5000000) * 5000000]}
                        ticks={(() => {
                          // Calculate max value from data
                          const maxValue = Math.max(...yearlyData.map(d => d.total || 0))
                          const maxRounded = Math.ceil(maxValue / 5000000) * 5000000
                          const ticks = []
                          for (let i = 0; i <= maxRounded; i += 5000000) {
                            ticks.push(i)
                          }
                          return ticks
                        })()}
                      />
                      <Tooltip content={<CustomTooltip />} />

                      {Object.entries(projectTypeColors).map(([type, color]) => (
                        <Bar
                          key={type}
                          dataKey={type}
                          stackId="costs"
                          fill={color}
                          name={projectTypeLabels[type as keyof typeof projectTypeLabels]}
                          radius={[12, 12, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-[calc(100%-60px)] min-h-[400px]">
                  <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Annual cost breakdown will appear here once projects are added to the timeline.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
