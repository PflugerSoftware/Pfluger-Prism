import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Input } from "../ui/input"
import {
  Briefcase,
  Plus,
  BarChart3,
  DollarSign,
  Calendar,
  GitCompare,
  Building2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Search,
  List,
  Calendar as CalendarIcon,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import {
  AreaChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from "recharts"
import { useTheme } from "../System/ThemeManager"
import { BondCard } from "../MainCards/BondCard"
import { HeroCard } from "../MainCards"
import { loadBonds, Bond } from "../../data/loadBonds"
import { loadProjects, Project } from "../../data/loadProjects"
import { useBonds } from "../System/BondsContext"
import { useProjects } from "../System/ProjectsContext"
import { Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { useBondProjects } from "../../hooks/useBondProjects"

// Mock data for bonds
const mockBonds = [
  {
    id: 1,
    name: "2024 Bond Package",
    totalValue: 125000000,
    projectCount: 8,
    status: "Active",
    approvalDate: "November 2024",
    startYear: 2025,
    endYear: 2028,
    projects: [
      {
        id: "p1",
        name: "Liberty Hill High School Renovation",
        type: "Renovations",
        cost: 15500000,
        startDate: "2025-03",
        endDate: "2027-07",
        duration: 28,
      },
      {
        id: "p2",
        name: "Cedar Park Elementary Addition",
        type: "Additions",
        cost: 8200000,
        startDate: "2025-06",
        endDate: "2026-12",
        duration: 18,
      },
      {
        id: "p3",
        name: "Sports Complex Expansion",
        type: "New Construction",
        cost: 12800000,
        startDate: "2025-01",
        endDate: "2026-11",
        duration: 22,
      },
      {
        id: "p4",
        name: "Middle School HVAC Upgrade",
        type: "Equity Improvements",
        cost: 2100000,
        startDate: "2025-02",
        endDate: "2026-02",
        duration: 12,
      },
      {
        id: "p5",
        name: "Transportation Facility",
        type: "New Construction",
        cost: 18500000,
        startDate: "2026-01",
        endDate: "2027-12",
        duration: 24,
      },
      {
        id: "p6",
        name: "Technology Infrastructure",
        type: "Technology",
        cost: 5200000,
        startDate: "2026-06",
        endDate: "2027-06",
        duration: 12,
      },
      {
        id: "p7",
        name: "Security Systems Upgrade",
        type: "Technology",
        cost: 3800000,
        startDate: "2027-01",
        endDate: "2027-09",
        duration: 8,
      },
      {
        id: "p8",
        name: "Athletic Fields",
        type: "Site Improvements",
        cost: 6900000,
        startDate: "2027-03",
        endDate: "2028-03",
        duration: 12,
      },
    ]
  },
  {
    id: 2,
    name: "2022 Bond Package",
    totalValue: 89000000,
    projectCount: 5,
    status: "Complete",
    approvalDate: "May 2022",
    startYear: 2025,
    endYear: 2027,
    projects: [
      {
        id: "p9",
        name: "Elementary School #5",
        type: "New Construction",
        cost: 28000000,
        startDate: "2025-02",
        endDate: "2027-02",
        duration: 24,
      },
      {
        id: "p10",
        name: "District Administration Building",
        type: "New Construction",
        cost: 15000000,
        startDate: "2025-01",
        endDate: "2026-07",
        duration: 18,
      },
      {
        id: "p11",
        name: "High School Stadium",
        type: "Site Improvements",
        cost: 22000000,
        startDate: "2025-06",
        endDate: "2026-11",
        duration: 17,
      },
      {
        id: "p12",
        name: "Roof Replacements - District Wide",
        type: "Renovations",
        cost: 12000000,
        startDate: "2025-08",
        endDate: "2027-05",
        duration: 21,
      },
      {
        id: "p13",
        name: "Transportation Fleet",
        type: "Equipment",
        cost: 12000000,
        startDate: "2026-01",
        endDate: "2028-01",
        duration: 24,
      },
    ]
  },
  {
    id: 3,
    name: "2027 Bond Package (Proposed)",
    totalValue: 185000000,
    projectCount: 6,
    status: "Planning",
    approvalDate: "November 2027 (Projected)",
    startYear: 2028,
    endYear: 2032,
    projects: [
      {
        id: "p14",
        name: "New High School Campus",
        type: "New Construction",
        cost: 95000000,
        startDate: "2028-06",
        endDate: "2031-08",
        duration: 38,
      },
      {
        id: "p15",
        name: "Elementary #6 & #7",
        type: "New Construction",
        cost: 56000000,
        startDate: "2028-08",
        endDate: "2030-08",
        duration: 24,
      },
      {
        id: "p16",
        name: "Central Kitchen Facility",
        type: "New Construction",
        cost: 12000000,
        startDate: "2029-01",
        endDate: "2030-06",
        duration: 17,
      },
      {
        id: "p17",
        name: "Career & Tech Center",
        type: "New Construction",
        cost: 14000000,
        startDate: "2030-01",
        endDate: "2031-12",
        duration: 23,
      },
      {
        id: "p18",
        name: "Athletic Complex Phase 2",
        type: "Site Improvements",
        cost: 5000000,
        startDate: "2031-03",
        endDate: "2032-03",
        duration: 12,
      },
      {
        id: "p19",
        name: "Technology Refresh",
        type: "Technology",
        cost: 3000000,
        startDate: "2028-08",
        endDate: "2029-08",
        duration: 12,
      },
    ]
  },
]

// This will be replaced with dynamic stats in the component

const statusColors = {
  "Active": "bg-green-100 text-green-800",
  "Complete": "bg-blue-100 text-blue-800",
  "Planning": "bg-yellow-100 text-yellow-800"
}

const projectTypeColors: Record<string, string> = {
  "New Construction": "#00A9E0",
  "Renovations": "#F2A900",
  "Additions": "#67823A",
  "Equity Improvements": "#9A3324",
  "Technology": "#003C71",
  "Site Improvements": "#B5BD00",
  "Equipment": "#707372",
}

interface MyBondsProps {
  onNavigate?: (view: 'bond-builder') => void
  isSidebarExpanded?: boolean
  onOpenBondSidebar?: (bond: Bond) => void
}

export function MyBonds({ onNavigate, isSidebarExpanded = false, onOpenBondSidebar }: MyBondsProps = {}) {
  const { bonds } = useBonds() // Use bonds from context
  const { projects: allProjects } = useProjects() // Get projects from context
  // Sidebar state now managed at App level
  const [isCompareMode, setIsCompareMode] = useState(false)
  const [selectedBondsForCompare, setSelectedBondsForCompare] = useState<number[]>([])
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { colors } = useTheme()

  // Loading state is handled by context now
  const isLoading = bonds.length === 0

  // Debug: Log bonds loaded from context
  useEffect(() => {
  }, [bonds])

  // Helper to get projects for a bond
  const getBondProjects = (bond: Bond) => {
    return bond.projectIds
      .map(id => allProjects.find(p => p.id === id))
      .filter((p): p is Project => p !== undefined)
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const handleViewBond = (bond: typeof bonds[0]) => {
    // Call the callback from App level
    if (onOpenBondSidebar) {
      onOpenBondSidebar(bond)
    }
  }

  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode)
    if (isCompareMode) {
      setSelectedBondsForCompare([])
    }
  }

  const handleToggleBondForCompare = (bondId: number) => {
    if (selectedBondsForCompare.includes(bondId)) {
      setSelectedBondsForCompare(selectedBondsForCompare.filter(id => id !== bondId))
    } else {
      if (selectedBondsForCompare.length < 3) {
        setSelectedBondsForCompare([...selectedBondsForCompare, bondId])
      }
    }
  }

  const handleOpenCompareDialog = () => {
    if (selectedBondsForCompare.length > 0) {
      setIsCompareDialogOpen(true)
    }
  }

  const filteredBonds = bonds.filter(bond => {
    const bondProjects = getBondProjects(bond)
    return bond.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bond.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bondProjects.some(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.projectType.toLowerCase().includes(searchQuery.toLowerCase())
      )
  })

  // Calculate dynamic stats from actual bond data
  const totalValue = bonds.reduce((sum, b) => sum + b.totalValue, 0)
  const totalSF = bonds.reduce((sum, b) => {
    const bondProjects = getBondProjects(b)
    return sum + bondProjects.reduce((pSum, p) => pSum + (p.squareFootage || 0), 0)
  }, 0)
  const totalBondCount = bonds.length

  // Calculate unassigned projects (projects not in any bond)
  const projectsInBonds = new Set<number>()
  bonds.forEach(bond => {
    bond.projectIds.forEach(projectId => {
      projectsInBonds.add(projectId)
    })
  })
  const unassignedProjectsCount = allProjects.filter(p => !projectsInBonds.has(p.id)).length

  const quickStats = [
    {
      title: "Total Value",
      subtitle: "All Bond Packages",
      number: totalValue / 1000000,
      format: (val: number) => `$${val.toFixed(1)}M`,
      icon: DollarSign
    },
    {
      title: "Total Square Footage",
      subtitle: "All Bond Projects",
      number: totalSF / 1000000,
      format: (val: number) => `${val.toFixed(1)}M SF`,
      icon: Building2
    },
    {
      title: "Total Bonds",
      subtitle: "Bond Packages",
      number: totalBondCount,
      icon: Briefcase
    },
    {
      title: "Unassigned Projects",
      subtitle: "Not in Bonds",
      number: unassignedProjectsCount,
      icon: TrendingUp
    }
  ]

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Briefcase className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="mb-2">No bond packages yet</h3>
      <p className="text-muted-foreground mb-4">Create your first bond package</p>
      <Button onClick={() => onNavigate?.('bond-builder')} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        Create New Bond Package
      </Button>
    </div>
  )

  return (
    <div className="space-y-6">


      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => {
          const iconColors = [
            "text-indigo-600",
            "text-blue-600",
            "text-green-600",
            "text-orange-600"
          ]
          return (
            <HeroCard
              key={index}
              title={stat.title}
              icon={stat.icon}
              iconClassName={iconColors[index]}
              primaryValue={{
                value: stat.number,
                className: "text-gray-900",
                animate: true,
                format: stat.format
              }}
              footer={stat.subtitle}
            />
          )
        })}
      </div>

      {/* Bonds Section Header */}
      <div className="flex items-center justify-between">
        <h2>Bond Packages</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search bonds..." 
              className="pl-9 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isCompareMode && selectedBondsForCompare.length > 0 && (
            <Button 
              onClick={handleOpenCompareDialog}
              className="bg-sky-blue hover:bg-lhisd-dark-blue"
            >
              <GitCompare className="h-4 w-4 mr-2" />
              Compare {selectedBondsForCompare.length} Bond{selectedBondsForCompare.length !== 1 ? 's' : ''}
            </Button>
          )}
          <Button 
            variant={isCompareMode ? "default" : "outline"} 
            size="sm"
            onClick={handleToggleCompareMode}
          >
            <GitCompare className="h-4 w-4 mr-2" />
            {isCompareMode ? 'Cancel Compare' : 'Compare Bonds'}
          </Button>
          <Button 
            size="sm"
            onClick={() => onNavigate?.('bond-builder')}
            className="bg-sky-blue hover:bg-lhisd-dark-blue"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Bond
          </Button>
        </div>
      </div>

      {/* Bonds Grid */}
      {bonds.length === 0 ? (
        <EmptyState />
      ) : filteredBonds.length === 0 ? (
        <div className="py-16 text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <h3 className="mb-2">No bonds found</h3>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredBonds.map((bond) => (
            <BondCard
              key={bond.id}
              bond={bond}
              statusColors={statusColors}
              projectTypeColors={projectTypeColors}
              onView={handleViewBond}
              isCompareMode={isCompareMode}
              isSelected={selectedBondsForCompare.includes(bond.id)}
              onToggleSelect={() => handleToggleBondForCompare(bond.id)}
              isSelectDisabled={!selectedBondsForCompare.includes(bond.id) && selectedBondsForCompare.length >= 3}
            />
          ))}
        </div>
      )}

      {/* Compare Dialog */}
      <BondCompareDialog
        open={isCompareDialogOpen}
        onOpenChange={setIsCompareDialogOpen}
        bonds={bonds.filter(b => selectedBondsForCompare.includes(b.id))}
      />
    </div>
  )
}

// Bond Compare Dialog Component
interface BondCompareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bonds: typeof mockBonds
}

function BondCompareDialog({ open, onOpenChange, bonds }: BondCompareDialogProps) {
  const { colors } = useTheme()
  const { projects: allProjects } = useProjects()

  // Helper to get projects for a bond
  const getBondProjects = (bond: Bond) => {
    return bond.projectIds
      .map(id => allProjects.find(p => p.id === id))
      .filter((p): p is Project => p !== undefined)
  }

  if (bonds.length === 0) return null

  // Convert all bond projects to gantt tasks
  const allGanttTasks: Task[] = useMemo(() => {
    const tasks: Task[] = []
    bonds.forEach((bond) => {
      const bondProjects = getBondProjects(bond)
      bondProjects
        .filter(p => p.startDate && p.completionDate)
        .forEach(project => {
          const [startYear, startMonth] = project.startDate.split('-').map(Number)
          const [endYear, endMonth] = project.completionDate.split('-').map(Number)

          tasks.push({
            id: `${bond.id}-${project.id}`,
            name: `${bond.name}: ${project.name}`,
            type: 'task' as const,
            start: new Date(startYear, startMonth - 1, 1),
            end: new Date(endYear, endMonth, 0),
            progress: 0,
            styles: {
              backgroundColor: projectTypeColors[project.projectType] || colors.primary,
              backgroundSelectedColor: projectTypeColors[project.projectType] || colors.primary,
            }
          })
        })
    })
    return tasks
  }, [bonds, colors, allProjects])

  if (bonds.length === 0) return null

  // Calculate date range across all bonds
  const allYears = bonds.flatMap(b => [b.startYear, b.endYear])
  const minYear = Math.min(...allYears)
  const maxYear = Math.max(...allYears)
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

  // Generate all months in the date range
  const getMonthsInYear = (year: number) => {
    return Array.from({ length: 12 }, (_, i) => ({
      year,
      month: i + 1,
      key: `${year}-${String(i + 1).padStart(2, '0')}`
    }))
  }

  const allMonths = years.flatMap(getMonthsInYear)

  // Calculate project position on timeline
  const getProjectPosition = (project: any) => {
    const startMonth = allMonths.findIndex(m => m.key === project.startDate)
    const endMonth = allMonths.findIndex(m => m.key === project.endDate)
    
    if (startMonth === -1 || endMonth === -1) return null

    return {
      left: `${(startMonth / allMonths.length) * 100}%`,
      width: `${((endMonth - startMonth + 1) / allMonths.length) * 100}%`
    }
  }

  // Calculate annual cashflow data by project type (like Bond Builder)
  const calculateAnnualCashflow = () => {
    const cashflowData: any[] = []

    years.forEach(year => {
      const yearData: any = {
        year: year.toString(),
        total: 0
      }

      // Initialize all project types to 0
      Object.keys(projectTypeColors).forEach(type => {
        yearData[type] = 0
      })

      // Calculate costs for this year from all bonds
      bonds.forEach((bond) => {
        const bondProjects = getBondProjects(bond)
        bondProjects.forEach(project => {
          if (!project.startDate || !project.completionDate) return

          const [startYear, startMonth] = project.startDate.split('-').map(Number)
          const [endYear, endMonth] = project.completionDate.split('-').map(Number)

          // Check if project is active during this year
          if (year >= startYear && year <= endYear) {
            const totalProjectMonths = parseInt(project.duration) || 1
            const monthlyCost = project.costEstimate / totalProjectMonths

            // Count how many months in this year
            const yearStart = new Date(year, 0, 1)
            const yearEnd = new Date(year, 11, 31)
            const projectStart = new Date(startYear, startMonth - 1, 1)
            const projectEnd = new Date(endYear, endMonth - 1, 1)

            const effectiveStart = projectStart > yearStart ? projectStart : yearStart
            const effectiveEnd = projectEnd < yearEnd ? projectEnd : yearEnd

            const monthsInYear = Math.round((effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1
            const yearCost = monthlyCost * monthsInYear

            // Add to the project type total
            yearData[project.projectType] += yearCost
            yearData.total += yearCost
          }
        })
      })

      cashflowData.push(yearData)
    })

    return cashflowData
  }

  const cashflowData = calculateAnnualCashflow()

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] w-[98vw] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Bond Package Comparison</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="timeline" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline View
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Cashflow Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="flex-1 overflow-auto mt-0">
            {/* Gantt Chart View */}
            {allGanttTasks.length > 0 ? (
              <div className="w-full overflow-auto border border-gray-200 rounded-lg" style={{ height: '600px' }}>
                <Gantt
                  tasks={allGanttTasks}
                  viewMode={ViewMode.Year}
                  listCellWidth=""
                  columnWidth={100}
                  rowHeight={40}
                  barCornerRadius={8}
                  barFill={60}
                  handleWidth={0}
                  fontSize="13px"
                  fontFamily="Inter, system-ui, sans-serif"
                  todayColor="rgba(252, 211, 77, 0.3)"
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No timeline data available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cashflow" className="flex-1 overflow-auto mt-0">
            {/* Cashflow Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Annual Cost Breakdown by Project Type</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare spending patterns by project type across all bonds
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cashflowData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 11 }}
                        domain={[0, (dataMax: number) => Math.ceil(dataMax / 5000000) * 5000000]}
                      />
                      <RechartsTooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const validPayload = payload.filter((p: any) => p.value > 0 && p.dataKey !== 'total')
                            if (validPayload.length === 0) return null

                            return (
                              <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                                <p className="font-medium mb-2 text-gray-900">{label}</p>
                                {validPayload.map((entry: any, index: number) => (
                                  <p key={index} className="text-sm mb-1" style={{ color: entry.color }}>
                                    {entry.name}: {formatCurrency(entry.value)}
                                  </p>
                                ))}
                                <div className="mt-2 pt-2 border-t border-gray-200">
                                  <p className="text-sm font-semibold text-gray-900">
                                    Total: {formatCurrency(payload.find((p: any) => p.dataKey === 'total')?.value || 0)}
                                  </p>
                                </div>
                              </div>
                            )
                          }
                          return null
                        }}
                      />

                      {Object.entries(projectTypeColors).map(([type, color]) => (
                        <Bar
                          key={type}
                          dataKey={type}
                          stackId="costs"
                          fill={color}
                          name={type}
                          radius={[12, 12, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
