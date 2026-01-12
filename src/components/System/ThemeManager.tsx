import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Plus, Wrench, PlusCircle, Sprout, Lightbulb, Square } from 'lucide-react'

// Application Brand Colors (Pfluger)
export const APP_COLORS = {
  // Primary Colors
  primary: {
    brick: '#9A3324',     // Dark Red/Brick Red
    black: '#000000',     // Black
    mediumGray: '#707372', // Medium Gray
    lightGray: '#C7C9C7',  // Light Gray
    white: '#FFFFFF'      // White
  },
  
  // Secondary Colors
  secondary: {
    darkBlue: '#003C71',    // Dark Blue
    skyBlue: '#00A9E0',     // Bright Cyan/Sky Blue
    oliveGreen: '#67823A',  // Olive Green
    chartreuse: '#B5BD00',  // Yellow-Green/Chartreuse
    orange: '#F2A900',       // Orange
    salmon: '#f16555ff'      // Salmon
  },
  
  // RGB Values for advanced usage
  rgb: {
    brick: { r: 154, g: 51, b: 36 },
    black: { r: 0, g: 0, b: 0 },
    mediumGray: { r: 112, g: 115, b: 114 },
    lightGray: { r: 199, g: 201, b: 199 },
    white: { r: 255, g: 255, b: 255 },
    darkBlue: { r: 0, g: 60, b: 113 },
    skyBlue: { r: 0, g: 169, b: 224 },
    oliveGreen: { r: 103, g: 130, b: 58 },
    chartreuse: { r: 181, g: 189, b: 0 },
    orange: { r: 242, g: 169, b: 0 },
    salmon: { r: 241, g: 101, b: 85 }
  }
}

// Theme variants for different use cases
export const THEME_VARIANTS = {
  // Light mode - default light theme
  light: {
    primary: APP_COLORS.secondary.skyBlue,
    primaryForeground: APP_COLORS.primary.white,
    secondary: APP_COLORS.primary.lightGray,
    secondaryForeground: APP_COLORS.primary.black,
    accent: APP_COLORS.secondary.darkBlue,
    accentForeground: APP_COLORS.primary.white,
    muted: APP_COLORS.primary.lightGray,
    mutedForeground: APP_COLORS.primary.mediumGray
    ,
    // Text hierarchy for components: primary / secondary / tertiary
    textPrimary: APP_COLORS.primary.black,
    textSecondary: APP_COLORS.primary.mediumGray,
    textTertiary: APP_COLORS.primary.lightGray,
    // Default icon color for this theme
    iconColor: APP_COLORS.primary.black
    ,
    // Card / surface colors
    cardBg: APP_COLORS.primary.white,
    mutedBg: '#f3f4f6'
    ,
    // Glassmorphism panel background
    panelBg: 'rgba(255, 255, 255, 0.5)',
    panelBorder: 'rgba(255, 255, 255, 0.2)',
    panelBackdropBlur: 'blur(20px)'
    ,
    // Application background
    appBg: '#F8FAFC'
  },

  // Dark mode - dark theme
  dark: {
    primary: APP_COLORS.secondary.skyBlue,
    primaryForeground: APP_COLORS.primary.white,
    secondary: APP_COLORS.primary.mediumGray,
    secondaryForeground: APP_COLORS.primary.white,
    accent: APP_COLORS.secondary.darkBlue,
    accentForeground: APP_COLORS.primary.white,
    muted: APP_COLORS.primary.lightGray,
    mutedForeground: APP_COLORS.primary.mediumGray
    ,
    // Text hierarchy for dark mode
    textPrimary: APP_COLORS.primary.white,
    textSecondary: APP_COLORS.primary.lightGray,
    textTertiary: APP_COLORS.primary.mediumGray,
    // Default icon color for dark mode
    iconColor: APP_COLORS.primary.white
    ,
    // Card / surface colors for dark mode
    cardBg: '#1f2937',
    mutedBg: '#374151'
    ,
    // Glassmorphism panel background for dark mode
    panelBg: 'rgba(26, 26, 26, 0.7)',
    panelBorder: 'rgba(255, 255, 255, 0.1)',
    panelBackdropBlur: 'blur(20px)'
    ,
    // Application background for dark mode
    appBg: '#0f172a'
  },

  // Brand theme - light theme with purple gradient tint
  brand: {
    primary: '#A855F7', // purple-500
    primaryForeground: APP_COLORS.primary.white,
    secondary: '#F3E8FF', // purple-100
    secondaryForeground: APP_COLORS.primary.black,
    accent: '#C084FC', // purple-400
    accentForeground: APP_COLORS.primary.white,
    muted: '#F3E8FF', // purple-100
    mutedForeground: APP_COLORS.primary.mediumGray
    ,
    // Text hierarchy for brand theme (light-style)
    textPrimary: APP_COLORS.primary.black,
    textSecondary: APP_COLORS.primary.mediumGray,
    textTertiary: APP_COLORS.primary.lightGray,
    // Default icon color for brand theme (use dark district color)
    iconColor: APP_COLORS.secondary.darkBlue
    ,
    // Card / surface colors for brand theme
    cardBg: APP_COLORS.primary.white,
    mutedBg: '#F8F5FF'
    ,
    // Glassmorphism panel background for brand theme
    panelBg: 'rgba(255, 255, 255, 0.5)',
    panelBorder: 'rgba(168, 85, 247, 0.2)', // purple tint
    panelBackdropBlur: 'blur(20px)'
    ,
    // Application background for brand theme (subtle purple tint)
    appBg: '#FBF7FF'
  }
}

// Project type color mappings
export const PROJECT_TYPE_COLORS = {
  // Primary project types (kebab-case for internal use)
  'new-construction': {
    color: APP_COLORS.secondary.darkBlue,
    rgb: APP_COLORS.rgb.darkBlue,
    tailwind: 'bg-[#003C71]',
    label: 'New Construction'
  },
  'renovation': {
    color: APP_COLORS.primary.brick,
    rgb: APP_COLORS.rgb.brick,
    tailwind: 'bg-[#9A3324]',
    label: 'Renovations'
  },
  'addition': {
    color: APP_COLORS.secondary.oliveGreen,
    rgb: APP_COLORS.rgb.oliveGreen,
    tailwind: 'bg-[#67823A]',
    label: 'Additions'
  },
  'site-improvements': {
    color: APP_COLORS.secondary.chartreuse,
    rgb: APP_COLORS.rgb.chartreuse,
    tailwind: 'bg-[#B5BD00]',
    label: 'Site Improvements'
  },
  'technology': {
    color: APP_COLORS.secondary.orange,
    rgb: APP_COLORS.rgb.orange,
    tailwind: 'bg-[#F2A900]',
    label: 'Technology'
  },
  // Legacy aliases for backward compatibility
  'equity': {
    color: APP_COLORS.secondary.chartreuse,
    rgb: APP_COLORS.rgb.chartreuse,
    tailwind: 'bg-[#B5BD00]',
    label: 'Equity Improvements'
  },
  'specialty': {
    color: APP_COLORS.secondary.orange,
    rgb: APP_COLORS.rgb.orange,
    tailwind: 'bg-[#F2A900]',
    label: 'Specialty'
  }
}

// Space type color mappings
export const SPACE_CATEGORY_COLORS = {
  'technology': {
    color: APP_COLORS.secondary.darkBlue,
    label: 'Technology'
  },
  'trades': {
    color: APP_COLORS.secondary.skyBlue,
    label: 'Trades'
  },
  'band': {
    color: APP_COLORS.primary.brick,
    label: 'Band'
  },
  'systems': {
    color: APP_COLORS.secondary.chartreuse,
    label: 'Systems'
  },
  'admin': {
    color: APP_COLORS.secondary.salmon,
    label: 'Admin'
  },
  'service': {
    color: APP_COLORS.secondary.orange,
    label: 'Service'
  },
  'generic': {
    color: APP_COLORS.secondary.oliveGreen,
    label: 'Generic'
  },
  'egress': {
    color: '#6B7280',
    label: 'Egress'
  }
}

// Simple mapping from database categories to color categories
const CATEGORY_MAP: Record<string, keyof typeof SPACE_CATEGORY_COLORS> = {
  'instructional': 'technology',
  'support': 'service',
  'administration': 'admin',
  'admin': 'admin',
  'library': 'technology',
  'technology': 'technology',
  'trades': 'trades',
  'band': 'band',
  'systems': 'systems',
  'service': 'service',
  'generic': 'generic',
  'egress': 'egress'
}

// Helper function to get space category color
export function getSpaceCategoryColor(category: string): typeof SPACE_CATEGORY_COLORS['technology'] {
  const normalized = category.toLowerCase().trim()
  const mappedCategory = CATEGORY_MAP[normalized] || 'generic'
  return SPACE_CATEGORY_COLORS[mappedCategory]
}

// Simple helper to get just the color
export function getSpaceColor(category: string): string {
  return getSpaceCategoryColor(category).color
}

// Helper function to get project type color - handles various naming conventions
export function getProjectTypeColor(projectType: string): typeof PROJECT_TYPE_COLORS['new-construction'] {
  const normalized = projectType.toLowerCase().trim()

  // Direct matches
  if (normalized === 'new construction') return PROJECT_TYPE_COLORS['new-construction']
  if (normalized === 'renovations' || normalized === 'renovation') return PROJECT_TYPE_COLORS['renovation']
  if (normalized === 'additions' || normalized === 'addition') return PROJECT_TYPE_COLORS['addition']
  if (normalized === 'site improvements') return PROJECT_TYPE_COLORS['site-improvements']
  if (normalized === 'technology' || normalized === 'tech') return PROJECT_TYPE_COLORS['technology']

  // Fuzzy matches for safety
  if (normalized.includes('new') || normalized.includes('construction')) return PROJECT_TYPE_COLORS['new-construction']
  if (normalized.includes('renov')) return PROJECT_TYPE_COLORS['renovation']
  if (normalized.includes('addition')) return PROJECT_TYPE_COLORS['addition']
  if (normalized.includes('site') || normalized.includes('equity')) return PROJECT_TYPE_COLORS['site-improvements']
  if (normalized.includes('tech') || normalized.includes('specialty')) return PROJECT_TYPE_COLORS['technology']

  // Default fallback
  return {
    color: APP_COLORS.primary.mediumGray,
    rgb: APP_COLORS.rgb.mediumGray,
    tailwind: 'bg-[#707372]',
    label: projectType
  }
}

// Helper function to get project type icon
export function getProjectTypeIcon(projectType: string) {
  const normalized = projectType.toLowerCase().trim()

  // Map project types to Lucide icons (same as map markers)
  if (normalized === 'new construction' || normalized.includes('new') || normalized.includes('construction')) {
    return Plus // Plus icon for new construction
  }
  if (normalized === 'renovations' || normalized === 'renovation' || normalized.includes('renov')) {
    return Wrench // Wrench icon for renovations
  }
  if (normalized === 'additions' || normalized === 'addition' || normalized.includes('addition')) {
    return PlusCircle // Plus circle for additions
  }
  if (normalized === 'site improvements' || normalized.includes('site') || normalized.includes('equity')) {
    return Sprout // Leaf/sprout icon for site improvements
  }
  if (normalized === 'technology' || normalized === 'tech' || normalized.includes('tech') || normalized.includes('specialty')) {
    return Lightbulb // Lightbulb icon for technology
  }

  // Default icon
  return Square
}

// Facility status color mappings
export const FACILITY_STATUS_COLORS = {
  'existing': {
    color: '#8B4513', // saddle brown
    rgb: { r: 139, g: 69, b: 19 },
    tailwind: 'bg-amber-700',
    label: 'Existing'
  },
  'under-construction': {
    color: '#f97316', // orange-500
    rgb: { r: 249, g: 115, b: 22 },
    tailwind: 'bg-orange-500',
    label: 'Under Construction'
  },
  'planned': {
    color: '#3b82f6', // blue-500
    rgb: { r: 59, g: 130, b: 246 },
    tailwind: 'bg-blue-500',
    label: 'Planned'
  }
}

// Helper function to get facility status color
export function getFacilityStatusColor(status: string): typeof FACILITY_STATUS_COLORS['existing'] {
  const normalized = status.toLowerCase().trim()

  if (normalized === 'existing') return FACILITY_STATUS_COLORS['existing']
  if (normalized === 'under construction') return FACILITY_STATUS_COLORS['under-construction']
  if (normalized === 'planned') return FACILITY_STATUS_COLORS['planned']

  // Default fallback to planned
  return FACILITY_STATUS_COLORS['planned']
}

// Status/State Colors - Semantic colors for app states
export const STATUS_COLORS = {
  success: {
    color: APP_COLORS.secondary.oliveGreen,
    rgb: APP_COLORS.rgb.oliveGreen,
    tailwind: 'bg-[#67823A]',
    text: 'text-[#67823A]'
  },
  warning: {
    color: APP_COLORS.secondary.orange,
    rgb: APP_COLORS.rgb.orange,
    tailwind: 'bg-[#F2A900]',
    text: 'text-[#F2A900]'
  },
  error: {
    color: APP_COLORS.primary.brick,
    rgb: APP_COLORS.rgb.brick,
    tailwind: 'bg-[#9A3324]',
    text: 'text-[#9A3324]'
  },
  info: {
    color: APP_COLORS.secondary.skyBlue,
    rgb: APP_COLORS.rgb.skyBlue,
    tailwind: 'bg-[#00A9E0]',
    text: 'text-[#00A9E0]'
  },
  neutral: {
    color: APP_COLORS.primary.mediumGray,
    rgb: APP_COLORS.rgb.mediumGray,
    tailwind: 'bg-[#707372]',
    text: 'text-[#707372]'
  }
}

// Financial Data Colors - For budget/cost indicators
export const FINANCIAL_COLORS = {
  positive: {
    color: APP_COLORS.secondary.oliveGreen,
    rgb: APP_COLORS.rgb.oliveGreen,
    tailwind: 'bg-[#67823A]',
    text: 'text-[#67823A]',
    description: 'Under budget, surplus, positive variance'
  },
  negative: {
    color: APP_COLORS.primary.brick,
    rgb: APP_COLORS.rgb.brick,
    tailwind: 'bg-[#9A3324]',
    text: 'text-[#9A3324]',
    description: 'Over budget, deficit, negative variance'
  },
  neutral: {
    color: APP_COLORS.primary.mediumGray,
    rgb: APP_COLORS.rgb.mediumGray,
    tailwind: 'bg-[#707372]',
    text: 'text-[#707372]',
    description: 'On budget, neutral'
  },
  highlight: {
    color: APP_COLORS.secondary.skyBlue,
    rgb: APP_COLORS.rgb.skyBlue,
    tailwind: 'bg-[#00A9E0]',
    text: 'text-[#00A9E0]',
    description: 'Featured cost, primary metric'
  }
}

// Glassmorphism Effects - Modern glass-style UI elements
export const GLASS_EFFECTS = {
  // Standard glass effect for sidebars and panels (light and airy)
  standard: {
    background: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(20px)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
    tailwind: 'bg-white/50 backdrop-blur-xl border-white/20'
  },
  // Strong glass effect for important panels
  strong: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(24px)',
    border: 'rgba(255, 255, 255, 0.3)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
    tailwind: 'bg-white/70 backdrop-blur-2xl border-white/30'
  },
  // Subtle glass effect for overlays and headers
  subtle: {
    background: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(16px)',
    border: 'rgba(255, 255, 255, 0.15)',
    shadow: '0 4px 16px 0 rgba(0, 0, 0, 0.05)',
    tailwind: 'bg-white/30 backdrop-blur-lg border-white/15'
  },
  // Dark glass effect for dark mode
  dark: {
    background: 'rgba(26, 26, 26, 0.7)',
    backdropFilter: 'blur(20px)',
    border: 'rgba(255, 255, 255, 0.1)',
    shadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
    tailwind: 'bg-black/70 backdrop-blur-xl border-white/10'
  }
}

// Component-Specific Theming - Consistent component colors
export const COMPONENT_THEMES = {
  sidebar: {
    light: {
      // Main sidebar container
      container: {
        bg: 'bg-white/50',
        backdropBlur: 'backdrop-blur-xl',
        border: 'border-white/20',
        shadow: 'shadow-lg'
      },
      // Navigation items
      nav: {
        active: 'bg-white/40 backdrop-blur-sm',
        hover: 'hover:bg-white/20 backdrop-blur-sm',
        inactive: ''
      },
      // Icon containers
      icon: {
        active: 'bg-white/60 backdrop-blur-sm',
        inactive: 'bg-white/20 backdrop-blur-sm'
      },
      // Buttons (collapse/expand)
      button: {
        bg: 'bg-white/50 backdrop-blur-xl',
        hover: 'hover:bg-white/70',
        border: 'border-white/20'
      },
      // Borders and dividers
      divider: 'border-white/20',
      // Text colors
      text: APP_COLORS.primary.black,
      activeBg: APP_COLORS.secondary.skyBlue,
      activeText: APP_COLORS.primary.white,
      hoverBg: APP_COLORS.primary.lightGray,
      glass: GLASS_EFFECTS.standard
    },
    dark: {
      // Main sidebar container
      container: {
        bg: 'bg-black/70',
        backdropBlur: 'backdrop-blur-xl',
        border: 'border-white/10',
        shadow: 'shadow-lg'
      },
      // Navigation items
      nav: {
        active: 'bg-white/20 backdrop-blur-sm',
        hover: 'hover:bg-white/10 backdrop-blur-sm',
        inactive: ''
      },
      // Icon containers
      icon: {
        active: 'bg-white/40 backdrop-blur-sm',
        inactive: 'bg-white/10 backdrop-blur-sm'
      },
      // Buttons (collapse/expand)
      button: {
        bg: 'bg-black/70 backdrop-blur-xl',
        hover: 'hover:bg-black/50',
        border: 'border-white/10'
      },
      // Borders and dividers
      divider: 'border-white/10',
      // Text colors
      text: APP_COLORS.primary.white,
      activeBg: APP_COLORS.secondary.darkBlue,
      activeText: APP_COLORS.primary.white,
      hoverBg: APP_COLORS.primary.mediumGray,
      glass: GLASS_EFFECTS.dark
    },
    // Detail sidebar (ProjectDetails, BondDetails)
    detail: {
      light: {
        container: {
          bg: 'bg-white/50',
          backdropBlur: 'backdrop-blur-xl',
          border: 'border-white/20',
          shadow: 'shadow-2xl'
        },
        header: {
          bg: 'bg-white/30',
          backdropBlur: 'backdrop-blur-md',
          border: 'border-b border-white/20'
        },
        actionBar: {
          bg: 'bg-white/30',
          backdropBlur: 'backdrop-blur-md'
        }
      },
      dark: {
        container: {
          bg: 'bg-black/70',
          backdropBlur: 'backdrop-blur-xl',
          border: 'border-white/10',
          shadow: 'shadow-2xl'
        },
        header: {
          bg: 'bg-black/50',
          backdropBlur: 'backdrop-blur-md',
          border: 'border-b border-white/10'
        },
        actionBar: {
          bg: 'bg-black/50',
          backdropBlur: 'backdrop-blur-md'
        }
      }
    }
  },
  dashboard: {
    metricPositive: APP_COLORS.secondary.oliveGreen,
    metricNegative: APP_COLORS.primary.brick,
    metricNeutral: APP_COLORS.primary.mediumGray,
    metricHighlight: APP_COLORS.secondary.skyBlue,
    cardBg: APP_COLORS.primary.white,
    cardBorder: APP_COLORS.primary.lightGray
  },
  cards: {
    light: {
      bg: APP_COLORS.primary.white,
      border: APP_COLORS.primary.lightGray,
      hover: '#f9fafb',
      shadow: 'rgba(0, 0, 0, 0.1)'
    },
    dark: {
      bg: '#1f2937',
      border: APP_COLORS.primary.mediumGray,
      hover: '#374151',
      shadow: 'rgba(0, 0, 0, 0.3)'
    }
  },
  buttons: {
    primary: {
      bg: APP_COLORS.secondary.skyBlue,
      hover: APP_COLORS.secondary.darkBlue,
      text: APP_COLORS.primary.white
    },
    secondary: {
      bg: APP_COLORS.primary.lightGray,
      hover: APP_COLORS.primary.mediumGray,
      text: APP_COLORS.primary.black
    },
    danger: {
      bg: APP_COLORS.primary.brick,
      hover: '#7a2519',
      text: APP_COLORS.primary.white
    }
  }
}

// Chart/Visualization Palette - For data visualization
export const CHART_COLORS = {
  // Ordered palette for multi-series charts
  palette: [
    APP_COLORS.secondary.skyBlue,      // Primary
    APP_COLORS.secondary.darkBlue,     // Secondary
    APP_COLORS.secondary.oliveGreen,   // Tertiary
    APP_COLORS.secondary.orange,       // Accent 1
    APP_COLORS.secondary.chartreuse,   // Accent 2
    APP_COLORS.secondary.salmon,       // Accent 3
    APP_COLORS.primary.brick,          // Accent 4
    APP_COLORS.primary.mediumGray      // Neutral
  ],

  // Gradient definitions for advanced visualizations
  gradients: {
    blue: {
      start: APP_COLORS.secondary.skyBlue,
      end: APP_COLORS.secondary.darkBlue,
      css: `linear-gradient(135deg, ${APP_COLORS.secondary.skyBlue}, ${APP_COLORS.secondary.darkBlue})`
    },
    green: {
      start: APP_COLORS.secondary.chartreuse,
      end: APP_COLORS.secondary.oliveGreen,
      css: `linear-gradient(135deg, ${APP_COLORS.secondary.chartreuse}, ${APP_COLORS.secondary.oliveGreen})`
    },
    warm: {
      start: APP_COLORS.secondary.orange,
      end: APP_COLORS.primary.brick,
      css: `linear-gradient(135deg, ${APP_COLORS.secondary.orange}, ${APP_COLORS.primary.brick})`
    },
    neutral: {
      start: APP_COLORS.primary.lightGray,
      end: APP_COLORS.primary.mediumGray,
      css: `linear-gradient(135deg, ${APP_COLORS.primary.lightGray}, ${APP_COLORS.primary.mediumGray})`
    }
  },

  // Specific chart type recommendations
  types: {
    bar: [APP_COLORS.secondary.skyBlue, APP_COLORS.secondary.darkBlue],
    line: [APP_COLORS.secondary.skyBlue, APP_COLORS.secondary.oliveGreen, APP_COLORS.secondary.orange],
    pie: [
      APP_COLORS.secondary.skyBlue,
      APP_COLORS.secondary.darkBlue,
      APP_COLORS.secondary.oliveGreen,
      APP_COLORS.secondary.orange,
      APP_COLORS.secondary.chartreuse,
      APP_COLORS.secondary.salmon
    ],
    area: {
      fill: 'rgba(0, 169, 224, 0.2)', // skyBlue with opacity
      stroke: APP_COLORS.secondary.skyBlue
    }
  }
}

// Utility functions for color manipulation
export const colorUtils = {
  // Convert hex to RGB
  hexToRgb: (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  // Create RGBA with opacity
  rgba: (hex: string, opacity: number) => {
    const rgb = colorUtils.hexToRgb(hex)
    return rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})` : hex
  },
  
  // Generate CSS custom properties
  generateCSSVars: (theme: typeof THEME_VARIANTS.brand) => {
    return Object.entries(theme).map(([key, value]) =>
      `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`
    ).join('\n')
  }
}

// Theme context
type ThemeContextType = {
  currentTheme: keyof typeof THEME_VARIANTS
  setTheme: (theme: keyof typeof THEME_VARIANTS) => void
  colors: typeof APP_COLORS
  themeColors: typeof THEME_VARIANTS[keyof typeof THEME_VARIANTS]
  projectColors: typeof PROJECT_TYPE_COLORS
  facilityStatusColors: typeof FACILITY_STATUS_COLORS
  statusColors: typeof STATUS_COLORS
  financialColors: typeof FINANCIAL_COLORS
  componentThemes: typeof COMPONENT_THEMES
  chartColors: typeof CHART_COLORS
  glassEffects: typeof GLASS_EFFECTS
  utils: typeof colorUtils
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider component
interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: keyof typeof THEME_VARIANTS
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<keyof typeof THEME_VARIANTS>(defaultTheme)

  useEffect(() => {
    // Apply theme CSS variables to document root
    const root = document.documentElement
    const themeColors = THEME_VARIANTS[currentTheme]

    // Remove all theme classes first
    root.classList.remove('dark', 'brand')

    // Apply theme class
    if (currentTheme === 'dark') {
      root.classList.add('dark')
    } else if (currentTheme === 'brand') {
      root.classList.add('brand')
    }

    // Apply app brand colors as CSS variables
    Object.entries(APP_COLORS.primary).forEach(([key, value]) => {
      root.style.setProperty(`--app-${key}`, value)
    })

    Object.entries(APP_COLORS.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--app-${key}`, value)
    })

    // Apply current theme colors
    Object.entries(themeColors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      root.style.setProperty(`--theme-${cssKey}`, value)
    })

  }, [currentTheme])

  const setTheme = (theme: keyof typeof THEME_VARIANTS) => {
    setCurrentTheme(theme)
    localStorage.setItem('app-theme', theme)
  }

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as keyof typeof THEME_VARIANTS
    if (savedTheme && THEME_VARIANTS[savedTheme]) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      colors: APP_COLORS,
      themeColors: THEME_VARIANTS[currentTheme],
      projectColors: PROJECT_TYPE_COLORS,
      facilityStatusColors: FACILITY_STATUS_COLORS,
      statusColors: STATUS_COLORS,
      financialColors: FINANCIAL_COLORS,
      componentThemes: COMPONENT_THEMES,
      chartColors: CHART_COLORS,
      glassEffects: GLASS_EFFECTS,
      utils: colorUtils
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme selector component
export function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme()

  return (
    <div className="flex gap-2">
      {Object.keys(THEME_VARIANTS).map((theme) => (
        <button
          key={theme}
          onClick={() => setTheme(theme as keyof typeof THEME_VARIANTS)}
          className={`px-3 py-1 rounded text-sm capitalize transition-colors ${
            currentTheme === theme
              ? 'bg-[var(--app-brick)] text-white'
              : 'bg-[var(--app-lightGray)] text-[var(--app-black)] hover:bg-[var(--app-mediumGray)]'
          }`}
        >
          {theme.replace(/([A-Z])/g, ' $1').trim()}
        </button>
      ))}
    </div>
  )
}

// Color palette component for documentation/reference
export function ColorPalette() {
  const { colors } = useTheme()
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-semibold">Primary Colors</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(colors.primary).map(([name, hex]) => (
            <div key={name} className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-200 mx-auto mb-2"
                style={{ backgroundColor: hex }}
              />
              <div className="text-xs font-medium capitalize">{name}</div>
              <div className="text-xs text-gray-500">{hex}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="mb-3 font-semibold">Secondary Colors</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(colors.secondary).map(([name, hex]) => (
            <div key={name} className="text-center">
              <div 
                className="w-16 h-16 rounded-lg border-2 border-gray-200 mx-auto mb-2"
                style={{ backgroundColor: hex }}
              />
              <div className="text-xs font-medium capitalize">{name.replace(/([A-Z])/g, ' $1').trim()}</div>
              <div className="text-xs text-gray-500">{hex}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}