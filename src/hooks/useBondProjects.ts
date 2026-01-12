/**
 * Custom hook to lookup projects for a bond
 * This hook provides dynamic project lookup, so bonds always show current project data
 */
import { useMemo } from 'react'
import { useProjects } from '../components/System/ProjectsContext'
import { Project } from '../data/loadProjects'
import { Bond, BondProject } from '../data/loadBonds'

/**
 * Convert a Project to BondProject format for display
 */
function projectToBondProject(project: Project): BondProject {
  return {
    id: String(project.id),
    name: project.name,
    type: project.projectType,
    cost: project.costEstimate,
    startDate: project.startDate || '',
    endDate: project.completionDate || '',
    duration: parseInt(project.duration) || 0,
    baseCost: project.baseCost,
    siteCosts: project.siteCosts,
    designCosts: project.designCosts,
    contingency: project.contingency,
    squareFootage: project.squareFootage,
    status: project.status
  }
}

/**
 * Hook to get projects for a specific bond
 * Projects are looked up dynamically from ProjectsContext
 * Fixed: Now properly matches project IDs regardless of type (string/number)
 *
 * @param bond - The bond to get projects for
 * @returns Array of BondProject objects with current data
 */
export function useBondProjects(bond: Bond | null): BondProject[] {
  const { projects } = useProjects()

  return useMemo(() => {
    if (!bond || !bond.projectIds || bond.projectIds.length === 0) {
      return []
    }

    // Lookup projects by ID from the projects context
    // Convert both to numbers to ensure type consistency
    const bondProjects = bond.projectIds
      .map(projectId => {
        const project = projects.find(p => Number(p.id) === Number(projectId))
        return project ? projectToBondProject(project) : null
      })
      .filter((p): p is BondProject => p !== null)

    // Sort by project order if available
    if (bond.projectOrder) {
      bondProjects.sort((a, b) => {
        const orderA = bond.projectOrder?.[parseInt(a.id)] || 999
        const orderB = bond.projectOrder?.[parseInt(b.id)] || 999
        return orderA - orderB
      })
    }

    return bondProjects
  }, [bond, projects])
}
