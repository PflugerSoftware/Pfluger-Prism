import { getApiUrl } from '../config/apiConfig'

// Master space type from API
export interface SpaceType {
  id: string
  name: string
  category: string
  costPerSF: number
  icon: string
  description: string
  minSF: number
  maxSF: number
  defaultSF: number
  isActive: boolean
}

// Space configuration within a pod
export interface PodSpaceConfig {
  configId: string
  spaceTypeId: string
  customName: string
  sf: number
  quantity: number
  sortOrder: number
  notes?: string
  // Calculated fields (derived from SpaceType)
  costPerSF?: number
  calculatedCost?: number
}

// Legacy format for backward compatibility
export interface PodSpace {
  id: string
  name: string
  sf: number
  cost: number
  quantity: number
}

export interface Pod {
  id: string
  name: string
  description: string
  category: string
  totalSF: number
  estimatedCost: number
  costRange: {
    low: number
    high: number
  }
  icon: string
  buildingTypes: string[]
  isActive: boolean
  spaces: PodSpace[]  // Legacy format for compatibility
  spaceConfigs?: PodSpaceConfig[]  // New format with space type references
}

export interface AvailableSpace {
  id: string
  name: string
  category: string
  costPerSF: number
  icon: string
  description: string
  minSF: number
  maxSF: number
  defaultSF: number
}

/**
 * Load all pods from API
 */
export async function loadPods(): Promise<Pod[]> {
  try {
    const url = getApiUrl('pods')
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()


    // Transform API response to Pod interface
    const pods: Pod[] = data.map((row: any) => {
      return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      category: row.category || '',
      totalSF: parseInt(row.total_sf || row.totalSF || 0),
      estimatedCost: parseFloat(row.estimated_cost || row.estimatedCost || 0),
      costRange: {
        low: parseFloat(row.cost_range_low || row.costRangeLow || 0),
        high: parseFloat(row.cost_range_high || row.costRangeHigh || 0)
      },
      icon: row.icon || '',
      buildingTypes: (row.building_types || row.buildingTypes || '').split('|').filter(Boolean),
      isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
      spaces: row.spaces?.map((space: any) => {
        const sf = parseInt(space.square_footage || space.sf || 0);
        const costPerSF = parseFloat(space.cost_per_sf || 0);
        const quantity = parseInt(space.quantity || 1);
        const cost = space.cost_override ? parseFloat(space.cost_override) : (sf * costPerSF * quantity);

        return {
          id: space.space_type_id || space.spaceTypeId || '',
          name: space.space_name || space.name || '',
          sf: sf,
          cost: cost,
          quantity: quantity
        };
      }) || []
    }
    })


    return pods
  } catch (error) {
    return []
  }
}

/**
 * Load all space types from API
 */
export async function loadSpaceTypes(): Promise<SpaceType[]> {
  try {
    const url = getApiUrl('spaces')
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform API response to SpaceType interface
    const spaceTypes: SpaceType[] = data.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category || '',
      costPerSF: parseFloat(row.cost_per_sf || row.costPerSF || 0),
      icon: row.icon || '',
      description: row.description || '',
      minSF: parseInt(row.min_sf || row.minSF || 0),
      maxSF: parseInt(row.max_sf || row.maxSF || 0),
      defaultSF: parseInt(row.default_sf || row.defaultSF || 0),
      isActive: row.is_active !== undefined ? Boolean(row.is_active) : true
    }))

    return spaceTypes
  } catch (error) {
    return []
  }
}

/**
 * Load available spaces (alias for loadSpaceTypes for backward compatibility)
 */
export async function loadAvailableSpaces(): Promise<AvailableSpace[]> {
  const spaceTypes = await loadSpaceTypes()

  // Convert SpaceType to AvailableSpace format
  return spaceTypes.map(st => ({
    id: st.id,
    name: st.name,
    category: st.category,
    costPerSF: st.costPerSF,
    icon: st.icon,
    description: st.description,
    minSF: st.minSF,
    maxSF: st.maxSF,
    defaultSF: st.defaultSF,
    // Add sf and cost properties for display compatibility
    sf: st.defaultSF,
    cost: st.defaultSF * st.costPerSF
  } as any))
}
