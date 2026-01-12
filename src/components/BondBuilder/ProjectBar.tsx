import { useDrag } from 'react-dnd'
import {
  Building2,
  Wrench,
  PlusSquare,
  Scale,
  Star
} from 'lucide-react'
import { useTheme } from '../System/ThemeManager'
import type { Project } from '../BondBuilderPro'

interface ProjectBarProps {
  project: Project
  onUpdate: (projectId: string, startDate: string, endDate: string) => void
  onRemove: (projectId: string) => void
}

const getProjectTypeConfig = (projectColors: any) => ({
  'new-construction': {
    label: 'NEW',
    color: projectColors['new-construction'].color,
    icon: Building2
  },
  'renovation': {
    label: 'RENO',
    color: projectColors['renovation'].color,
    icon: Wrench
  },
  'addition': {
    label: 'ADD',
    color: projectColors['addition'].color,
    icon: PlusSquare
  },
  'equity': {
    label: 'EQUITY',
    color: projectColors['equity'].color,
    icon: Scale
  },
  'specialty': {
    label: 'SPEC',
    color: projectColors['specialty'].color,
    icon: Star
  }
})

export function ProjectBar({ project, onUpdate, onRemove }: ProjectBarProps) {
  const { projectColors } = useTheme()

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'timeline-project',
    item: { project },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [project])

  const projectTypeConfig = getProjectTypeConfig(projectColors)
  const typeConfig = projectTypeConfig[project.type]
  const TypeIcon = typeConfig.icon

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
      notation: 'compact'
    }).format(amount)
  }

  const getBarStyle = () => {
    return {
      backgroundColor: typeConfig.color,
      color: 'white'
    }
  }

  const getBarHeight = () => {
    switch (project.type) {
      case 'equity':
        return 'h-8' // 32px
      case 'specialty':
        return 'h-10' // 40px
      default:
        return 'h-9' // 36px
    }
  }

  return (
    <div
      ref={drag}
      className={`w-full flex items-center gap-2 cursor-move transition-all duration-200 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      title={`${project.name} - ${formatCurrency(project.cost)} - ${project.duration} months`}
    >
      {/* Pill */}
      <div className={`${getBarHeight()} relative group flex-1`}>
        <div
          className="h-full rounded-xl relative overflow-hidden shadow-sm w-full"
          style={getBarStyle()}
        >
          {/* Content - Icon only */}
          <div className="relative z-10 h-full flex items-center justify-center px-2 text-white">
            <TypeIcon className="h-5 w-5 flex-shrink-0" />
          </div>
        </div>

        {/* Resize Handles */}
        <div className="absolute inset-y-0 left-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/20 z-20 rounded-l-xl" />
        <div className="absolute inset-y-0 right-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white/20 z-20 rounded-r-xl" />
      </div>
    </div>
  )
}
