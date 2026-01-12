import { HeroCard } from './HeroCard'
import { Eye, Edit, Trash2, Building2, DollarSign, TrendingUp } from 'lucide-react'

/**
 * Example 1: Project Card
 * A card displaying project information with cost metrics
 */
export function ProjectCardExample() {
  return (
    <HeroCard
      title="Liberty Hill High School Renovation"
      badge={{
        label: "High School",
        className: "bg-purple-100 text-purple-800"
      }}
      primaryValue={{
        value: 15.5,
        format: (val) => `$${val}M`,
        className: "text-blue-600"
      }}
      metrics={[
        {
          label: "$/SF",
          value: 285,
          format: (val) => `$${val}`
        },
        {
          label: "Total GFA",
          value: 285000,
          format: (val) => `${(Number(val) / 1000).toFixed(0)}K SF`
        }
      ]}
      footer="Last edited 2 days ago"
      actions={[
        {
          label: "View Details",
          icon: Eye,
        },
        {
          label: "Edit Project",
          icon: Edit,
        },
        {
          label: "Delete Project",
          icon: Trash2,
          variant: 'destructive'
        }
      ]}
    />
  )
}

/**
 * Example 2: Bond Card
 * A card displaying bond information with financial metrics
 */
export function BondCardExample() {
  return (
    <HeroCard
      title="2024 Bond Program"
      subtitle="District-wide improvements"
      badge={{
        label: "Active",
        className: "bg-green-100 text-green-800"
      }}
      primaryValue={{
        value: 125.6,
        format: (val) => `$${val}M`,
        className: "text-green-600"
      }}
      metrics={[
        {
          label: "Projects",
          value: 12
        },
        {
          label: "Completion",
          value: 67,
          format: (val) => `${val}%`
        }
      ]}
      footer="Updated today"
      actions={[
        {
          label: "View Bond",
          icon: Eye,
        },
        {
          label: "Edit Bond",
          icon: Edit,
        }
      ]}
    />
  )
}

/**
 * Example 3: Stats Card
 * A simple card displaying a single statistic
 */
export function StatsCardExample() {
  return (
    <HeroCard
      title="Total Portfolio Value"
      subtitle="All active projects"
      primaryValue={{
        value: 38.6,
        format: (val) => `$${val}M`,
        className: "text-blue-600"
      }}
      metrics={[
        {
          label: "Projects",
          value: 8
        },
        {
          label: "Growth",
          value: 15,
          format: (val) => `+${val}%`
        }
      ]}
    />
  )
}

/**
 * Example 4: Minimal Card
 * A simple card with just title and primary value
 */
export function MinimalCardExample() {
  return (
    <HeroCard
      title="Active Users"
      primaryValue={{
        value: 1247,
        className: "text-gray-900"
      }}
      footer="As of today"
    />
  )
}

/**
 * Example 5: Building Type Card
 * A card showing building type statistics
 */
export function BuildingTypeCardExample() {
  return (
    <HeroCard
      title="Elementary Schools"
      badge={{
        label: "Renovations",
        className: "bg-orange-100 text-orange-800"
      }}
      primaryValue={{
        value: 4,
        className: "text-gray-900"
      }}
      metrics={[
        {
          label: "Total Cost",
          value: 24.5,
          format: (val) => `$${val}M`
        },
        {
          label: "Avg. SF",
          value: 45000,
          format: (val) => `${(Number(val) / 1000).toFixed(0)}K`
        },
        {
          label: "Capacity",
          value: 2800,
          format: (val) => `${val} students`
        }
      ]}
    />
  )
}
