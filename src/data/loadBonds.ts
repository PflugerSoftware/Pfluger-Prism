import { getApiUrl } from '../config/apiConfig'
import { Project } from './loadProjects'

export interface BondProject {
  id: string
  name: string
  type: string
  cost: number
  startDate: string
  endDate: string
  duration: number
  baseCost: number
  siteCosts: number
  designCosts: number
  contingency: number
  squareFootage?: number
  status?: string
}

export interface Bond {
  id: number
  name: string
  totalValue: number
  totalBudget: number
  projectCount: number
  status: string
  approvalDate: string
  startYear: number
  endYear: number
  projectIds: number[] // Store only IDs, not full project data
  projectOrder?: Record<number, number> // Optional: maintain project display order
}

/**
 * Convert "Month Year" format (e.g., "January 2026") to "YYYY-MM" format (e.g., "2026-01")
 */
function convertMonthYearToYYYYMM(dateString: string): string {
  if (!dateString) return ''

  // If already in YYYY-MM format, return as-is
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    return dateString
  }

  // Parse "Month Year" format
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]

  const parts = dateString.trim().split(' ')
  if (parts.length !== 2) {
    return ''
  }

  const [monthName, yearStr] = parts
  const monthIndex = monthNames.indexOf(monthName.toLowerCase())

  if (monthIndex === -1) {
    return ''
  }

  const year = parseInt(yearStr)
  const month = String(monthIndex + 1).padStart(2, '0')

  return `${year}-${month}`
}

/**
 * Transform Project to BondProject format
 */
function projectToBondProject(project: any): BondProject {
  const rawStartDate = project.start_date || project.startDate || ''
  const rawEndDate = project.completion_date || project.completionDate || ''

  return {
    id: String(project.id),
    name: project.name,
    type: project.project_type || project.projectType,
    cost: parseFloat(project.cost_estimate || project.costEstimate),
    startDate: convertMonthYearToYYYYMM(rawStartDate),
    endDate: convertMonthYearToYYYYMM(rawEndDate),
    duration: parseInt(project.duration) || 0,
    baseCost: parseFloat(project.base_cost || project.baseCost || 0),
    siteCosts: parseFloat(project.site_costs || project.siteCosts || 0),
    designCosts: parseFloat(project.design_costs || project.designCosts || 0),
    contingency: parseFloat(project.contingency || 0),
    squareFootage: parseInt(project.square_footage || project.squareFootage || 0),
    status: project.status
  }
}

/**
 * Load all bonds from API
 */
export async function loadBonds(): Promise<Bond[]> {
  try {
    const url = getApiUrl('bonds')
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform API response to Bond interface
    const bonds: Bond[] = data.map((row: any) => {
      const projectIds = row.projects?.map((p: any) => parseInt(p.id)) || []
      const projectOrder: Record<number, number> = {}
      row.projects?.forEach((p: any, index: number) => {
        projectOrder[parseInt(p.id)] = p.order_number || index + 1
      })

      return {
        id: parseInt(row.id),
        name: row.name,
        totalValue: parseFloat(row.total_value),
        totalBudget: parseFloat(row.total_budget),
        projectCount: parseInt(row.project_count),
        status: row.status,
        approvalDate: row.approval_date,
        startYear: parseInt(row.start_year),
        endYear: parseInt(row.end_year),
        projectIds: projectIds,
        projectOrder: projectOrder
      }
    })

    return bonds
  } catch (error) {
    return []
  }
}

/**
 * Save a new bond to the API
 */
export async function saveBond(bond: Partial<Bond>): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const url = getApiUrl('bonds')

    // Use projectIds directly from bond
    const projectIds = bond.projectIds || []

    const apiData = {
      name: bond.name,
      totalValue: bond.totalValue,
      totalBudget: bond.totalBudget,
      projectCount: bond.projectCount || projectIds.length,
      status: bond.status || 'Planning',
      approvalDate: bond.approvalDate,
      startYear: bond.startYear,
      endYear: bond.endYear,
      projectIds: projectIds
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to save bond')
    }

    const result = await response.json()
    return { success: true, id: result.id }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Update an existing bond
 */
export async function updateBond(bond: Bond): Promise<{ success: boolean; error?: string }> {
  try {
    const url = getApiUrl('bonds')

    const projectIds = bond.projectIds || []

    const apiData = {
      id: bond.id,
      name: bond.name,
      totalValue: bond.totalValue,
      totalBudget: bond.totalBudget,
      projectCount: bond.projectCount,
      status: bond.status,
      approvalDate: bond.approvalDate,
      startYear: bond.startYear,
      endYear: bond.endYear,
      projectIds: projectIds
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update bond')
    }

    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Delete a bond
 */
export async function deleteBond(bondId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${getApiUrl('bonds')}?id=${bondId}`

    const response = await fetch(url, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete bond')
    }

    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
