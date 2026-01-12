import { useState } from 'react'
import { useDrag } from 'react-dnd'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Checkbox } from '../ui/checkbox'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader } from '../ui/card'
import { 
  Search, 
  Plus, 
  GripVertical, 
  Eye, 
  MoreHorizontal,
  Building2,
  Wrench,
  PlusSquare,
  Scale,
  Star
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { useTheme } from '../System/ThemeManager'
import type { Project } from '../BondBuilderPro'

interface ProjectLibraryProps {
  projects: Project[]
  onAddProject: (project: Project) => void
}

interface DraggableProjectCardProps {
  project: Project
  onAddProject: (project: Project) => void
}

const getProjectTypeConfig = (projectColors: any) => ({
  'new-construction': {
    label: 'New Construction',
    color: projectColors['new-construction'].color,
    tailwindClass: projectColors['new-construction'].tailwind,
    icon: Building2,
    count: 0
  },
  'renovation': {
    label: 'Renovations', 
    color: projectColors['renovation'].color,
    tailwindClass: projectColors['renovation'].tailwind,
    icon: Wrench,
    count: 0
  },
  'addition': {
    label: 'Additions',
    color: projectColors['addition'].color,
    tailwindClass: projectColors['addition'].tailwind,
    icon: PlusSquare,
    count: 0
  },
  'equity': {
    label: 'Equity Improvements',
    color: projectColors['equity'].color,
    tailwindClass: projectColors['equity'].tailwind,
    icon: Scale,
    count: 0
  },
  'specialty': {
    label: 'Specialty Facilities',
    color: projectColors['specialty'].color,
    tailwindClass: projectColors['specialty'].tailwind,
    icon: Star,
    count: 0
  }
})

const getStatusColors = (colors: any) => ({
  ready: colors.secondary.oliveGreen,
  draft: colors.secondary.orange,
  incomplete: colors.primary.brick
})

function DraggableProjectCard({ project, onAddProject }: DraggableProjectCardProps) {
  const { projectColors, colors } = useTheme()
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'project',
    item: { project },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  const projectTypeConfig = getProjectTypeConfig(projectColors)
  const statusColors = getStatusColors(colors)
  const typeConfig = projectTypeConfig[project.type]
  const TypeIcon = typeConfig.icon

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(amount)
  }

  const formatSquareFootage = (sqft?: number) => {
    if (!sqft) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(sqft) + ' SF'
  }

  return (
    <div 
      ref={drag}
      className={`cursor-move transition-all duration-200 hover:shadow-md ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100'
      }`}
    >
      <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Project Type Badge */}
            <Badge 
              className="text-white mb-2 text-xs border-0"
              style={{ backgroundColor: typeConfig.color }}
            >
              <TypeIcon className="h-3 w-3 mr-1" />
              {typeConfig.label}
            </Badge>
            
            {/* Project Name */}
            <h4 className="font-semibold text-sm leading-tight">{project.name}</h4>
          </div>

          <div className="flex items-center gap-1">
            {/* Status Dot */}
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: statusColors[project.status] }}
              title={project.status}
            />
            
            {/* Drag Handle */}
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Key Stats */}
        <div className="space-y-1 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Cost:</span>
            <span className="font-medium">{formatCurrency(project.cost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Size:</span>
            <span className="font-medium">{formatSquareFootage(project.squareFootage)}</span>
          </div>
          <div className="flex justify-between">
            <span>Duration:</span>
            <span className="font-medium">{project.duration} months</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button 
            size="sm" 
            className="flex-1 h-7 text-xs"
            style={{ 
              backgroundColor: colors.secondary.skyBlue,
              color: colors.primary.white 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.secondary.darkBlue
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.secondary.skyBlue
            }}
            onClick={() => onAddProject(project)}
          >
            + Add to Timeline
          </Button>
          
          <Button variant="outline" size="sm" className="h-7 px-2">
            <Eye className="h-3 w-3" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit Project</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export function ProjectLibrary({ projects, onAddProject }: ProjectLibraryProps) {
  const { projectColors, colors } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    'new-construction': true,
    'renovation': true,
    'addition': true,
    'equity': true,
    'specialty': true
  })

  // Count projects by type
  const typeCounts = projects.reduce((acc, project) => {
    acc[project.type] = (acc[project.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get project type config with theme colors
  const projectTypeConfig = getProjectTypeConfig(projectColors)

  // Update project type config with counts
  Object.keys(projectTypeConfig).forEach(type => {
    projectTypeConfig[type as keyof typeof projectTypeConfig].count = typeCounts[type] || 0
  })

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filters[project.type]
    return matchesSearch && matchesFilter
  })

  const handleFilterChange = (type: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <div className="h-full">
      {/* Project Cards */}
      <div className="h-full">
        {filteredProjects.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Building2 className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No projects available</p>
            </div>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <DraggableProjectCard
              key={project.id}
              project={project}
              onAddProject={onAddProject}
            />
          ))
        )}
      </div>
    </div>
  )
}