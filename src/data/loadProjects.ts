import { getApiUrl } from '../config/apiConfig'

export interface Project {
  id: number
  facility_id?: number // Link to facility
  name: string
  schoolName?: string
  buildingType: string
  projectType: string
  costEstimate: number
  lastModified: string
  status: string
  squareFootage: number
  address: string
  siteArea: string
  capacity: number
  duration: string
  startDate: string
  completionDate: string
  baseCost: number
  siteCosts: number
  designCosts: number
  contingency: number
  latitude?: number
  longitude?: number
  constructionType?: string
  numberOfStories?: number
  procurementMethod?: string
  leedCertification?: string
  chipsCertification?: string
  procurementPhaseDuration?: number
  procurementPhaseCost?: number
  designPhaseDuration?: number
  designPhaseCost?: number
  constructionPhaseDuration?: number
  constructionPhaseCost?: number
  projectPauses?: string // JSON string of pause phases
  elementalCosts?: Array<{
    code: string
    name: string
    costPerSF: number
    cost: number
  }>
}

/**
 * Load all projects from API
 */
export async function loadProjects(): Promise<Project[]> {
  try {
    const url = getApiUrl('projects')
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // Transform API response to match Project interface
    const projects: Project[] = data.map((row: any) => ({
      id: parseInt(row.id),
      facility_id: row.facility_id ? parseInt(row.facility_id) : undefined,
      name: row.name,
      schoolName: row.school_name || undefined,
      buildingType: row.building_type,
      projectType: row.project_type,
      costEstimate: parseFloat(row.cost_estimate),
      lastModified: row.last_modified,
      status: row.status,
      squareFootage: parseFloat(row.square_footage),
      address: row.address,
      siteArea: row.site_area,
      capacity: parseInt(row.capacity),
      duration: row.duration,
      startDate: row.start_date,
      completionDate: row.completion_date,
      baseCost: parseFloat(row.base_cost),
      siteCosts: parseFloat(row.site_costs),
      designCosts: parseFloat(row.design_costs),
      contingency: parseFloat(row.contingency),
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      constructionType: row.construction_type || undefined,
      numberOfStories: row.number_of_stories ? parseInt(row.number_of_stories) : undefined,
      procurementMethod: row.procurement_method || undefined,
      leedCertification: row.leed_certification || undefined,
      chipsCertification: row.chips_certification ? 'Yes' : 'No',
      procurementPhaseDuration: row.procurement_phase_duration ? parseInt(row.procurement_phase_duration) : undefined,
      procurementPhaseCost: row.procurement_phase_cost ? parseFloat(row.procurement_phase_cost) : undefined,
      designPhaseDuration: row.design_phase_duration ? parseInt(row.design_phase_duration) : undefined,
      designPhaseCost: row.design_phase_cost ? parseFloat(row.design_phase_cost) : undefined,
      constructionPhaseDuration: row.construction_phase_duration ? parseInt(row.construction_phase_duration) : undefined,
      constructionPhaseCost: row.construction_phase_cost ? parseFloat(row.construction_phase_cost) : undefined,
      projectPauses: row.project_pauses || undefined,
      elementalCosts: row.elementalCosts?.map((ec: any) => ({
        code: ec.code,
        name: ec.name,
        costPerSF: parseFloat(ec.cost_per_sf),
        cost: parseFloat(ec.cost)
      }))
    }))

    return projects
  } catch (error) {
    return []
  }
}

/**
 * Save a new project to the API
 */
export async function saveProject(project: Partial<Project>): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    const url = getApiUrl('projects')

    // Transform to API format (camelCase to snake_case)
    const apiData = {
      name: project.name,
      schoolName: project.schoolName,
      buildingType: project.buildingType,
      projectType: project.projectType,
      costEstimate: project.costEstimate,
      status: project.status || 'Draft',
      squareFootage: project.squareFootage,
      address: project.address,
      siteArea: project.siteArea,
      capacity: project.capacity,
      duration: project.duration,
      startDate: project.startDate,
      completionDate: project.completionDate,
      baseCost: project.baseCost,
      siteCosts: project.siteCosts,
      designCosts: project.designCosts,
      contingency: project.contingency,
      latitude: project.latitude,
      longitude: project.longitude,
      constructionType: project.constructionType,
      numberOfStories: project.numberOfStories,
      procurementMethod: project.procurementMethod,
      leedCertification: project.leedCertification,
      chipsCertification: project.chipsCertification === 'Yes',
      procurementPhaseDuration: project.procurementPhaseDuration,
      procurementPhaseCost: project.procurementPhaseCost,
      designPhaseDuration: project.designPhaseDuration,
      designPhaseCost: project.designPhaseCost,
      constructionPhaseDuration: project.constructionPhaseDuration,
      constructionPhaseCost: project.constructionPhaseCost,
      projectPauses: project.projectPauses,
      facility_id: project.facility_id,
      elementalCosts: project.elementalCosts
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
      throw new Error(errorData.error || 'Failed to save project')
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
 * Update an existing project
 */
export async function updateProject(project: Project): Promise<{ success: boolean; error?: string }> {
  try {
    const url = getApiUrl('projects')

    const apiData = {
      id: project.id,
      name: project.name,
      schoolName: project.schoolName,
      buildingType: project.buildingType,
      projectType: project.projectType,
      costEstimate: project.costEstimate,
      status: project.status,
      squareFootage: project.squareFootage,
      address: project.address,
      siteArea: project.siteArea,
      capacity: project.capacity,
      duration: project.duration,
      startDate: project.startDate,
      completionDate: project.completionDate,
      baseCost: project.baseCost,
      siteCosts: project.siteCosts,
      designCosts: project.designCosts,
      contingency: project.contingency,
      latitude: project.latitude,
      longitude: project.longitude,
      constructionType: project.constructionType,
      numberOfStories: project.numberOfStories,
      procurementMethod: project.procurementMethod,
      leedCertification: project.leedCertification,
      chipsCertification: project.chipsCertification === 'Yes',
      procurementPhaseDuration: project.procurementPhaseDuration,
      procurementPhaseCost: project.procurementPhaseCost,
      designPhaseDuration: project.designPhaseDuration,
      designPhaseCost: project.designPhaseCost,
      constructionPhaseDuration: project.constructionPhaseDuration,
      constructionPhaseCost: project.constructionPhaseCost,
      projectPauses: project.projectPauses,
      facility_id: project.facility_id,
      elementalCosts: project.elementalCosts
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
      throw new Error(errorData.error || 'Failed to update project')
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
 * Delete a project
 */
export async function deleteProject(projectId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const url = `${getApiUrl('projects')}?id=${projectId}`

    const response = await fetch(url, {
      method: 'DELETE'
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete project')
    }

    return { success: true }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
