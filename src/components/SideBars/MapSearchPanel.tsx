import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from "../ui/input"
import { Search, X, Building2, MapPin, DollarSign, ChevronRight } from "lucide-react"
import { type Project } from '../../data/loadProjects'
import { useFacilities, type Facility } from '../System/FacilitiesContext'
import { getProjectTypeColor, getProjectTypeIcon } from '../System/ThemeManager'

interface MapSearchPanelProps {
  projects: Project[]
  onProjectSelect: (project: Project) => void
  onFacilitySelect?: (facility: Facility) => void
}

export function MapSearchPanel({ projects, onProjectSelect, onFacilitySelect }: MapSearchPanelProps) {
  const { facilities } = useFacilities()
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFacilities, setExpandedFacilities] = useState<Set<string>>(new Set())

  // Toggle facility expansion
  const toggleFacility = (facilityKey: string) => {
    setExpandedFacilities(prev => {
      const next = new Set(prev)
      if (next.has(facilityKey)) {
        next.delete(facilityKey)
      } else {
        next.add(facilityKey)
      }
      return next
    })
  }

  // Filter projects based on search query only
  const filteredProjects = searchQuery.trim()
    ? projects.filter(project => {
        const query = searchQuery.toLowerCase()
        return project.name.toLowerCase().includes(query) ||
          project.schoolName?.toLowerCase().includes(query) ||
          project.buildingType.toLowerCase().includes(query) ||
          project.projectType.toLowerCase().includes(query) ||
          project.address.toLowerCase().includes(query)
      })
    : projects

  // Get facility name helper
  const getFacilityName = (facilityId?: number) => {
    if (!facilityId) return 'District-Wide'
    const facility = facilities.find(f => f.id === facilityId)
    return facility?.name || 'Unknown Facility'
  }

  // Group projects by facility
  const groupedProjects = filteredProjects.reduce((acc, project) => {
    const facilityKey = project.facility_id ? project.facility_id.toString() : 'no-facility'
    if (!acc[facilityKey]) {
      acc[facilityKey] = []
    }
    acc[facilityKey].push(project)
    return acc
  }, {} as Record<string, Project[]>)

  // Sort facility groups by total cost
  const sortedFacilityKeys = Object.keys(groupedProjects).sort((a, b) => {
    const aCost = groupedProjects[a].reduce((sum, p) => sum + p.costEstimate, 0)
    const bCost = groupedProjects[b].reduce((sum, p) => sum + p.costEstimate, 0)
    return bCost - aCost
  })

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header with Search */}
      <div className="px-4 pt-2 pb-3 border-b border-white/20 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none z-10" style={{ color: 'var(--theme-text-tertiary)' }} />
          <Input
            type="text"
            placeholder="Search facilities & projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border-white/30 bg-white/20 text-sm"
            style={{ color: 'var(--theme-text-primary)' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Facility List */}
      <div className="flex-1 overflow-y-auto px-4 py-3" style={{ minHeight: 0 }}>
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-8"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            <Search className="h-12 w-12 mx-auto mb-2" style={{ color: 'var(--theme-text-tertiary)' }} />
            <p className="text-sm" style={{ color: 'var(--theme-text-primary)' }}>No results found</p>
            <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>Try a different search term</p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="popLayout">
              {sortedFacilityKeys.map((facilityKey, groupIndex) => {
                const facilityId = facilityKey === 'no-facility' ? undefined : parseInt(facilityKey)
                const facilityName = getFacilityName(facilityId)
                const facilityProjects = groupedProjects[facilityKey]
                const isExpanded = expandedFacilities.has(facilityKey)
                const totalCost = facilityProjects.reduce((sum, p) => sum + p.costEstimate, 0)

                return (
                  <motion.div
                    key={facilityKey}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: groupIndex * 0.05
                    }}
                    className="rounded-lg border border-white/30 overflow-hidden bg-white/10"
                  >
                    {/* Facility Header - Clickable */}
                    <motion.button
                      onClick={() => toggleFacility(facilityKey)}
                      className="w-full p-3 hover:bg-white/20 transition-colors"
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-col gap-2">
                        {/* Top row: Icon, chevron, and facility name */}
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--theme-text-secondary)' }} />
                          </motion.div>
                          <Building2 className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--theme-text-primary)' }} />
                          <div className="text-sm font-semibold text-left flex-1" style={{ color: 'var(--theme-text-primary)' }}>
                            {facilityName}
                          </div>
                        </div>
                        {/* Bottom row: Project count and total cost */}
                        <div className="flex items-center gap-3 text-xs pl-8" style={{ color: 'var(--theme-text-secondary)' }}>
                          <span>{facilityProjects.length} {facilityProjects.length === 1 ? 'project' : 'projects'}</span>
                          <span className="font-medium">${(totalCost / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>
                    </motion.button>

                    {/* Projects List - Collapsible */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <motion.div
                            className="space-y-1 p-2 pt-0"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                          >
                        {facilityProjects.map((project) => {
                          const projectTypeColorObj = getProjectTypeColor(project.projectType)
                          const ProjectIcon = getProjectTypeIcon(project.projectType)

                          return (
                          <motion.button
                            key={project.id}
                            variants={itemVariants}
                            layout
                            whileHover={{ scale: 1.01, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onProjectSelect(project)}
                            className="w-full text-left px-2 py-1.5 rounded-md hover:bg-white/40 transition-colors flex items-center gap-2 group"
                          >
                            <div
                              className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
                              style={{ backgroundColor: projectTypeColorObj.color }}
                            >
                              <ProjectIcon className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs truncate group-hover:opacity-80 transition-opacity" style={{ color: 'var(--theme-text-primary)' }}>
                                {project.name}
                              </div>
                              <div className="text-[10px] truncate" style={{ color: 'var(--theme-text-secondary)' }}>
                                {(project.squareFootage / 1000).toFixed(1)}K SF • ${(project.costEstimate / 1000000).toFixed(1)}M
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}
