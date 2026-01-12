import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
  Search,
  Plus,
  FileText,
  Package,
  DollarSign,
  Building2,
  ChevronRight,
  Calendar,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react"
import { Badge } from "../ui/badge"
import { useState, useEffect } from "react"
import { HeroCard } from "../MainCards"
import { loadProjects, Project } from "../../data/loadProjects"
import { loadBonds, Bond } from "../../data/loadBonds"
import { BondCard } from "../MainCards/BondCard"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useFacilities } from "../System/FacilitiesContext"
import { ProjectFlowSankey } from "../Dashboard/ProjectFlowSankey"

interface ProjectWithBond extends Project {
  bondPackage: string | null
  bondPackages: string[] // Array of all bonds this project is in
}

interface DashboardStatsProps {
  onNavigate?: (view: string) => void
  onViewBond?: (bond: Bond) => void
}

type SortField = 'name' | 'projectType' | 'bondPackage' | 'costEstimate'
type BondSortField = 'name' | 'projectCount' | 'startYear' | 'totalValue'
type SortDirection = 'asc' | 'desc' | null

export function DashboardStats({ onNavigate, onViewBond }: DashboardStatsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [bondSearchQuery, setBondSearchQuery] = useState('')
  const [projects, setProjects] = useState<ProjectWithBond[]>([])
  const [bonds, setBonds] = useState<Bond[]>([])
  const [loading, setLoading] = useState(true)
  const [projectSortField, setProjectSortField] = useState<SortField | null>(null)
  const [projectSortDirection, setProjectSortDirection] = useState<SortDirection>(null)
  const [bondSortField, setBondSortField] = useState<BondSortField | null>(null)
  const [bondSortDirection, setBondSortDirection] = useState<SortDirection>(null)

  // Test facilities loading
  const { facilities } = useFacilities()

  useEffect(() => {
    // Facilities loaded
  }, [facilities])

  useEffect(() => {
    async function fetchData() {
      try {
        const [loadedProjects, loadedBonds] = await Promise.all([
          loadProjects(),
          loadBonds()
        ])

        // Create a map of project ID to array of bond names (supports multiple bonds)
        const projectToBondsMap = new Map<number, string[]>()
        loadedBonds.forEach(bond => {
          bond.projectIds.forEach(projectId => {
            const existingBonds = projectToBondsMap.get(projectId) || []
            projectToBondsMap.set(projectId, [...existingBonds, bond.name])
          })
        })

        // Enrich projects with bond package information
        const enrichedProjects: ProjectWithBond[] = loadedProjects.map(project => {
          const bondPackages = projectToBondsMap.get(project.id) || []
          return {
            ...project,
            bondPackage: bondPackages[0] || null, // First bond for backwards compatibility
            bondPackages: bondPackages // All bonds
          }
        })

        setProjects(enrichedProjects)
        setBonds(loadedBonds)
      } catch (error) {
        // Silent fail
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const totalPlannedCost = projects.reduce((sum, p) => sum + p.costEstimate, 0)
  const assignedProjects = projects.filter(p => p.bondPackage !== null).length
  const unassignedProjects = projects.filter(p => p.bondPackage === null).length

  const handleProjectSort = (field: SortField) => {
    if (projectSortField === field) {
      // Cycle through: asc -> desc -> null
      if (projectSortDirection === 'asc') {
        setProjectSortDirection('desc')
      } else if (projectSortDirection === 'desc') {
        setProjectSortDirection(null)
        setProjectSortField(null)
      }
    } else {
      setProjectSortField(field)
      setProjectSortDirection('asc')
    }
  }

  const handleBondSort = (field: BondSortField) => {
    if (bondSortField === field) {
      // Cycle through: asc -> desc -> null
      if (bondSortDirection === 'asc') {
        setBondSortDirection('desc')
      } else if (bondSortDirection === 'desc') {
        setBondSortDirection(null)
        setBondSortField(null)
      }
    } else {
      setBondSortField(field)
      setBondSortDirection('asc')
    }
  }

  const getSortIcon = (isActive: boolean, direction: SortDirection) => {
    if (!isActive) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-50" />
    if (direction === 'asc') return <ArrowUp className="h-3 w-3 ml-1" />
    if (direction === 'desc') return <ArrowDown className="h-3 w-3 ml-1" />
    return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.projectType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.bondPackage && p.bondPackage.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (!projectSortField || !projectSortDirection) return 0

    let aVal: any = a[projectSortField]
    let bVal: any = b[projectSortField]

    // Handle null bondPackage values
    if (projectSortField === 'bondPackage') {
      aVal = aVal || ''
      bVal = bVal || ''
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return projectSortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return projectSortDirection === 'asc' ? 1 : -1
    return 0
  })

  const filteredBonds = bonds.filter(b =>
    b.name.toLowerCase().includes(bondSearchQuery.toLowerCase()) ||
    b.status.toLowerCase().includes(bondSearchQuery.toLowerCase())
  )

  const sortedBonds = [...filteredBonds].sort((a, b) => {
    if (!bondSortField || !bondSortDirection) return 0

    let aVal: any = a[bondSortField]
    let bVal: any = b[bondSortField]

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return bondSortDirection === 'asc' ? -1 : 1
    if (aVal > bVal) return bondSortDirection === 'asc' ? 1 : -1
    return 0
  })
  
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <HeroCard
          title="Total Estimated Need"
          icon={DollarSign}
          iconClassName="text-green-600"
          primaryValue={{
            value: parseFloat((totalPlannedCost / 1000000).toFixed(1)),
            format: (val) => `$${val}M`,
            animate: true
          }}
          footer="Across all projects"
        />

        <HeroCard
          title="Projects in Planning"
          icon={Building2}
          iconClassName="text-blue-600"
          primaryValue={{
            value: projects.length,
            className: "text-gray-900",
            animate: true
          }}
          footer={`${assignedProjects} assigned • ${unassignedProjects} unassigned`}
        />

        <HeroCard
          title="Bond Packages"
          icon={Package}
          iconClassName="text-purple-600"
          primaryValue={{
            value: bonds.length,
            className: "text-gray-900",
            animate: true
          }}
          footer="Draft scenarios"
        />

        <HeroCard
          title="Unassigned Projects"
          icon={AlertCircle}
          iconClassName="text-[#F2A900]"
          primaryValue={{
            value: unassignedProjects,
            className: "text-[#F2A900]",
            animate: true
          }}
          footer={`$${((projects.filter(p => !p.bondPackage).reduce((sum, p) => sum + p.costEstimate, 0)) / 1000000).toFixed(1)}M not assigned`}
        />
      </div>

      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-muted-foreground">Planning Workspace</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {projects.length} projects • {bonds.length} bond packages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            size="sm"
            variant="outline"
            onClick={() => onNavigate?.('project-builder')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
          <Button 
            size="sm"
            className="bg-[#00A9E0] hover:bg-[#003C71]"
            onClick={() => onNavigate?.('bond-builder')}
          >
            <Package className="h-4 w-4 mr-2" />
            Create Bond Package
          </Button>
        </div>
      </div>

      {/* Projects Overview - Grouped */}
      <div>
  

        {/* Project Flow Visualization */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Project Portfolio Flow</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{projects.length} total projects</span>
                <span>•</span>
                <span>${(totalPlannedCost / 1000000).toFixed(1)}M total budget</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProjectFlowSankey
              height={600}
            />

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F2A900' }} />
                <span>Unassigned ({unassignedProjects} projects)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#00A9E0' }} />
                <span>In Bonds ({assignedProjects} projects)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
