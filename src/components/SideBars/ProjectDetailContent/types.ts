import type { Project } from '../../../data/loadProjects'

export interface CostRateData {
  elemental_code: string;
  code_name: string;
  category: string;
  cost_per_sf_low: number;
  cost_per_sf_avg: number;
  cost_per_sf_high: number;
  mult_procurement_cmar: number;
  mult_procurement_hard_bid: number;
  mult_procurement_design_build: number;
  mult_procurement_csp: number;
  mult_construction_concrete: number;
  mult_construction_steel: number;
  mult_construction_mass_timber: number;
  mult_construction_wood_frame: number;
  mult_stories_1: number;
  mult_stories_2: number;
  mult_stories_3: number;
  mult_stories_4: number;
}

export const CATEGORY_ORDER = ['Substructure', 'Shell', 'Enclosure', 'Interiors', 'Services', 'Equipment', 'Site', 'General']

export const CATEGORY_COLORS: Record<string, string> = {
  'Substructure': '#00A9E0',
  'Shell': '#67823A',
  'Enclosure': '#003C71',
  'Interiors': '#F2A900',
  'Services': '#8B5CF6',
  'Equipment': '#EC4899',
  'Site': '#14B8A6',
  'General': '#6B7280'
}

export interface ElementalCost {
  code: string;
  name: string;
  costPerSF: number;
  cost: number;
}

export interface ProjectDetailContentProps {
  project: Project | null
  isOpen: boolean
  isMainSidebarExpanded: boolean
  onClose: () => void
  hasParentPadding?: boolean
  isMapView?: boolean
  isMapSearchPanelCollapsed?: boolean
  panelIndex?: number
}
