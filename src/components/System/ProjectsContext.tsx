import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { loadProjects, saveProject, updateProject as apiUpdateProject, deleteProject as apiDeleteProject, Project } from '../../data/loadProjects'

interface ProjectsContextType {
  projects: Project[]
  addProject: (project: Project) => Promise<void>
  updateProject: (id: number, updates: Partial<Project>) => void
  deleteProject: (id: number) => void
  refreshProjects: () => Promise<void>
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined)

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])

  // Load initial projects from API
  useEffect(() => {
    loadProjects().then(loadedProjects => {
      setProjects(loadedProjects)
    })
  }, [])

  const addProject = async (project: Project) => {
    // Transform form values to database values
    const transformedProject = {
      ...project,
      // Map construction type IDs to database enum values
      constructionType: project.constructionType === 'concrete' ? 'Concrete' :
                       project.constructionType === 'steel' ? 'Steel' :
                       project.constructionType === 'timber' ? 'Mass Timber' :
                       project.constructionType === 'wood-frame' ? 'Wood Frame' :
                       'Concrete', // default

      // Map procurement method IDs to database enum values
      procurementMethod: project.procurementMethod === 'hard-bid' ? 'Hard Bid' :
                        project.procurementMethod === 'cmar' ? 'CMAR' :
                        project.procurementMethod === 'design-build' ? 'Design Build' :
                        project.procurementMethod === 'competitive-sealed-proposal' ? 'Competitive Sealed Proposal' :
                        'CMAR' // default
    }

    // Save to API first
    const result = await saveProject(transformedProject)

    if (result.success && result.id) {
      // Add the project with the new ID from the database
      const newProject = { ...transformedProject, id: result.id }
      setProjects(prev => [...prev, newProject])
    } else {
      alert(`Failed to save project: ${result.error}`)
    }
  }

  const updateProject = async (id: number, updates: Partial<Project>) => {
    // Update API first
    const fullProject = projects.find(p => p.id === id)
    if (!fullProject) {
      throw new Error('Project not found')
    }

    const updatedProject = { ...fullProject, ...updates }
    const result = await apiUpdateProject(updatedProject)

    if (result.success) {
      // Update local state
      setProjects(prev =>
        prev.map(p => (p.id === id ? updatedProject : p))
      )
    } else {
      throw new Error(result.error || 'Failed to update project')
    }
  }

  const deleteProject = async (id: number) => {
    // Delete from API first
    const result = await apiDeleteProject(id)

    if (result.success) {
      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== id))
    } else {
      throw new Error(result.error || 'Failed to delete project')
    }
  }

  const refreshProjects = async () => {
    const loadedProjects = await loadProjects()
    setProjects(loadedProjects)
  }

  return (
    <ProjectsContext.Provider
      value={{ projects, addProject, updateProject, deleteProject, refreshProjects }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}

export function useProjects() {
  const context = useContext(ProjectsContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectsProvider')
  }
  return context
}
