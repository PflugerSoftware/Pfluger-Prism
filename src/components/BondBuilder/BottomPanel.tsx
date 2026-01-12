import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { BarChart3, Table, TrendingUp } from 'lucide-react'
import { PROJECT_TYPE_COLORS } from '../System/ThemeManager'
import type { Project, Package } from '../BondBuilderPro'

interface BottomPanelProps {
  libraryProjects: Project[]
  timelineProjects: Project[]
  setTimelineProjects: React.Dispatch<React.SetStateAction<Project[]>>
  packages: Package[]
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

export function BottomPanel({ libraryProjects, timelineProjects, setTimelineProjects, packages }: BottomPanelProps) {
  const [activeTab, setActiveTab] = useState('chart')
  
  const currentYear = new Date().getFullYear()
  const projects = timelineProjects
  
  // Calculate date range from projects
  const getDateRange = () => {
    if (projects.length === 0) {
      return { start: currentYear, end: currentYear + 10 }
    }
    
    const years = projects.flatMap(p => {
      if (!p.startDate || !p.endDate) return []
      return [parseInt(p.startDate.split('-')[0]), parseInt(p.endDate.split('-')[0])]
    })
    
    return {
      start: Math.min(...years, currentYear),
      end: Math.max(...years, currentYear + 10)
    }
  }
  
  const dateRange = getDateRange()

  // Generate all months in date range (aligned with timeline)
  const getAllMonths = () => {
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
    return months
  }

  // Calculate monthly costs by project type (more granular than annual)
  const calculateMonthlyCosts = () => {
    const allMonths = getAllMonths()
    
    return allMonths.map(({ year, month, key, display }) => {
      const monthData: any = { 
        year, 
        month, 
        key, 
        display,
        period: `Q${Math.ceil(month / 3)} ${year}`, // Always include period for filtering
        isQuarterStart: month % 3 === 1
      }
      let total = 0

      // Initialize all project types to 0
      Object.keys(projectTypeColors).forEach(type => {
        monthData[type] = 0
      })

      projects.forEach(project => {
        if (!project.startDate || !project.endDate) return

        const [startYear, startMonth] = project.startDate.split('-').map(Number)
        const [endYear, endMonth] = project.endDate.split('-').map(Number)

        // Check if project is active in this month
        const currentDate = new Date(year, month - 1, 1)
        const projectStart = new Date(startYear, startMonth - 1, 1)
        const projectEnd = new Date(endYear, endMonth - 1, 1)

        if (currentDate >= projectStart && currentDate <= projectEnd) {
          // Calculate monthly cost (distribute total cost evenly across project duration)
          const totalProjectMonths = project.duration
          const monthlyCost = project.cost / totalProjectMonths
          
          monthData[project.type] += monthlyCost
          total += monthlyCost
        }
      })

      monthData.total = total
      return monthData
    })
  }

  // Calculate annual costs by project type (aggregated from monthly)
  const calculateAnnualCosts = () => {
    const monthlyCosts = calculateMonthlyCosts()
    const years = Array.from(
      { length: dateRange.end - dateRange.start + 1 },
      (_, i) => dateRange.start + i
    )

    return years.map(year => {
      const yearData: any = { year }
      let total = 0

      // Initialize all project types to 0
      Object.keys(projectTypeColors).forEach(type => {
        yearData[type] = 0
      })

      // Sum up monthly costs for this year
      monthlyCosts
        .filter(month => month.year === year)
        .forEach(month => {
          Object.keys(projectTypeColors).forEach(type => {
            yearData[type] += month[type]
          })
          total += month.total
        })

      yearData.total = total
      return yearData
    })
  }

  // Calculate cumulative costs over time
  const calculateCumulativeCosts = () => {
    const monthlyCosts = calculateMonthlyCosts()
    let runningTotal = 0
    const cumulativeByType: any = {}
    
    // Initialize cumulative tracking
    Object.keys(projectTypeColors).forEach(type => {
      cumulativeByType[type] = 0
    })

    return monthlyCosts.map(month => {
      runningTotal += month.total
      
      Object.keys(projectTypeColors).forEach(type => {
        cumulativeByType[type] += month[type]
      })

      return {
        ...month,
        cumulativeTotal: runningTotal,
        ...Object.keys(projectTypeColors).reduce((acc, type) => ({
          ...acc,
          [`cumulative_${type}`]: cumulativeByType[type]
        }), {})
      }
    })
  }

  const annualData = calculateAnnualCosts()
  const monthlyData = calculateMonthlyCosts()
  const cumulativeData = calculateCumulativeCosts()
  
  // Aggregate quarterly data for better readability in charts
  const quarterlyData = () => {
    const quarters: any[] = []
    
    for (let year = dateRange.start; year <= dateRange.end; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const quarterMonths = monthlyData.filter(month => 
          month.year === year && Math.ceil(month.month / 3) === quarter
        )
        
        if (quarterMonths.length === 0) continue
        
        const quarterData: any = {
          year,
          quarter,
          period: `Q${quarter} ${year}`,
          total: 0
        }
        
        // Initialize project types
        Object.keys(projectTypeColors).forEach(type => {
          quarterData[type] = 0
        })
        
        // Sum up quarterly costs
        quarterMonths.forEach(month => {
          quarterData.total += month.total
          Object.keys(projectTypeColors).forEach(type => {
            quarterData[type] += month[type]
          })
        })
        
        quarters.push(quarterData)
      }
    }
    
    return quarters
  }

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
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`${label}: ${formatCurrency(total)}`}</p>
          <div className="space-y-1 mt-2">
            {payload
              .filter((entry: any) => entry.value > 0)
              .sort((a: any, b: any) => b.value - a.value)
              .map((entry: any, index: number) => (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>{projectTypeLabels[entry.dataKey as keyof typeof projectTypeLabels]}:</span>
                  </div>
                  <span className="font-medium">{formatCurrency(entry.value)}</span>
                </div>
              ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="h-80 rounded-t-lg rounded-b-none border-b-0 border-t-2 flex-shrink-0 overflow-hidden flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Annual Cost Breakdown
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-8">
                <TabsTrigger value="chart" className="h-6 px-3 text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  Quarterly
                </TabsTrigger>
                <TabsTrigger value="table" className="h-6 px-3 text-xs">
                  <Table className="h-3 w-3 mr-1" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="cashflow" className="h-6 px-3 text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Spending
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="chart" className="h-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                
                {Object.entries(projectTypeColors).map(([type, color]) => (
                  <Bar
                    key={type}
                    dataKey={type}
                    stackId="costs"
                    fill={color}
                    name={projectTypeLabels[type as keyof typeof projectTypeLabels]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="table" className="h-full mt-0 overflow-auto">
            <div className="h-full">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-3 font-medium">Year</th>
                    {Object.entries(projectTypeLabels).map(([type, label]) => (
                      <th key={type} className="text-right py-2 px-3 font-medium">
                        {label}
                      </th>
                    ))}
                    <th className="text-right py-2 px-3 font-bold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {annualData.map((yearData) => (
                    <tr key={yearData.year} className="border-t">
                      <td className="py-2 px-3 font-medium">{yearData.year}</td>
                      {Object.keys(projectTypeColors).map((type) => (
                        <td key={type} className="text-right py-2 px-3">
                          {yearData[type] > 0 ? formatCurrency(yearData[type]) : '-'}
                        </td>
                      ))}
                      <td className="text-right py-2 px-3 font-bold">
                        {formatCurrency(yearData.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="cashflow" className="h-full mt-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={quarterlyData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="period" 
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const totalSpending = payload.find(p => p.dataKey === 'total')?.value || 0
                      return (
                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                          <p className="font-semibold">{label}</p>
                          <p className="text-sm text-blue-600">
                            Quarterly Spending: {formatCurrency(totalSpending as number)}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }} 
                />
                
                {/* Quarterly spending bars */}
                <Bar
                  dataKey="total"
                  fill="var(--lhisd-sky-blue)"
                  name="Quarterly Spending"
                  opacity={0.8}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Legend */}
      <div className="px-6 pb-4">
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(projectTypeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: projectTypeColors[type as keyof typeof projectTypeColors] }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}