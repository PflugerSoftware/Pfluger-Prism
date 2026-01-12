# HeroCard Component

A reusable hero card component designed for displaying key information in a clean, consistent format across the application. Based on the design patterns from the My Projects view.

## Features

- Clean, professional design with hover effects
- Flexible metric display (2-3 metrics in a grid)
- Optional badge display with custom styling
- Primary value display with custom formatting
- Action menu with dropdown
- Footer text for timestamps or metadata
- Click handling for the entire card
- Full TypeScript support
- Uses Lucide icons

## Basic Usage

```tsx
import { HeroCard } from '@/components/MainCards'
import { Eye, Edit, Trash2 } from 'lucide-react'

function MyComponent() {
  return (
    <HeroCard
      title="Liberty Hill High School"
      badge={{
        label: "High School",
        className: "bg-purple-100 text-purple-800"
      }}
      primaryValue={{
        value: 15.5,
        format: (val) => `$${val}M`
      }}
      metrics={[
        { label: "$/SF", value: 285, format: (val) => `$${val}` },
        { label: "Total GFA", value: "285K SF" }
      ]}
      footer="Last edited 2 days ago"
      actions={[
        { label: "View", icon: Eye, onClick: () => {} },
        { label: "Edit", icon: Edit, onClick: () => {} },
        { label: "Delete", icon: Trash2, onClick: () => {}, variant: 'destructive' }
      ]}
      onClick={() => console.log('Card clicked')}
    />
  )
}
```

## Props

### HeroCardProps

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `title` | `string` | Yes | Main title displayed at the top of the card |
| `subtitle` | `string` | No | Optional subtitle below the title |
| `badge` | `object` | No | Badge configuration (label, variant, className) |
| `primaryValue` | `object` | Yes | Main value to display (value, format, className) |
| `metrics` | `HeroCardMetric[]` | No | Array of metrics to display in a grid |
| `footer` | `string` | No | Footer text (typically timestamps) |
| `actions` | `HeroCardAction[]` | No | Array of dropdown menu actions |
| `onClick` | `function` | No | Click handler for the entire card |
| `className` | `string` | No | Additional CSS classes |

### HeroCardMetric

```tsx
interface HeroCardMetric {
  label: string
  value: string | number
  format?: (value: string | number) => string
}
```

### HeroCardAction

```tsx
interface HeroCardAction {
  label: string
  icon?: LucideIcon
  onClick: () => void
  variant?: 'default' | 'destructive'
}
```

## Examples

### Project Card

```tsx
<HeroCard
  title="Liberty Hill High School Renovation"
  badge={{ label: "High School", className: "bg-purple-100 text-purple-800" }}
  primaryValue={{
    value: 15.5,
    format: (val) => `$${val}M`,
    className: "text-blue-600"
  }}
  metrics={[
    { label: "$/SF", value: 285, format: (val) => `$${val}` },
    { label: "Total GFA", value: 285000, format: (val) => `${(Number(val) / 1000).toFixed(0)}K SF` }
  ]}
  footer="Last edited 2 days ago"
  actions={[
    { label: "View Details", icon: Eye, onClick: () => {} },
    { label: "Edit Project", icon: Edit, onClick: () => {} },
    { label: "Delete", icon: Trash2, onClick: () => {}, variant: 'destructive' }
  ]}
/>
```

### Stats Card (No Actions)

```tsx
<HeroCard
  title="Total Portfolio Value"
  subtitle="All active projects"
  primaryValue={{
    value: 38.6,
    format: (val) => `$${val}M`,
    className: "text-blue-600"
  }}
  metrics={[
    { label: "Projects", value: 8 },
    { label: "Growth", value: 15, format: (val) => `+${val}%` }
  ]}
/>
```

### Minimal Card

```tsx
<HeroCard
  title="Active Users"
  primaryValue={{ value: 1247 }}
  footer="As of today"
/>
```

## Badge Color Classes

Common badge color combinations used in the application:

```tsx
// Building Types
"bg-green-100 text-green-800"   // Elementary
"bg-blue-100 text-blue-800"     // Middle
"bg-purple-100 text-purple-800" // High School
"bg-orange-100 text-orange-800" // Specialty

// Status
"bg-gray-100 text-gray-800"     // Draft
"bg-yellow-100 text-yellow-800" // In Progress
"bg-green-100 text-green-800"   // Complete
```

## Layout

Cards work well in grid layouts:

```tsx
<div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  <HeroCard {...props1} />
  <HeroCard {...props2} />
  <HeroCard {...props3} />
</div>
```

## Notes

- The component uses the shadcn/ui Card, Button, Badge, and DropdownMenu components
- All actions in the dropdown menu stop propagation to prevent triggering the card's onClick
- The card has built-in hover effects and transitions
- Text is automatically truncated where needed to maintain consistent card heights
- The primary value defaults to blue color (text-blue-600) but can be customized
- Metrics are displayed in a responsive grid (2 columns for 2 metrics, 3 columns for 3+ metrics)
