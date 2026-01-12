import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import {
  Building2,
  Trash2,
  MapPin,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle2
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip"
import { useFacilities } from "../System/FacilitiesContext"
import { toast } from "sonner"

interface MyFacilitiesProps {
  onNavigate?: (view: string) => void
}

const facilityTypeColors = {
  "Elementary": "bg-green-100 text-green-800 border-green-200",
  "Middle": "bg-blue-100 text-blue-800 border-blue-200",
  "High School": "bg-purple-100 text-purple-800 border-purple-200",
  "Specialty": "bg-orange-100 text-orange-800 border-orange-200",
  "Administration": "bg-gray-100 text-gray-800 border-gray-200",
  "District": "bg-indigo-100 text-indigo-800 border-indigo-200"
}

const statusColors = {
  "Existing": "bg-green-100 text-green-800",
  "Under Construction": "bg-yellow-100 text-yellow-800",
  "Planned": "bg-blue-100 text-blue-800"
}

export function MyFacilities({ onNavigate }: MyFacilitiesProps = {}) {
  const { facilities, deleteFacility, refreshFacilities } = useFacilities()
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (facilityId: number) => {
    setSelectedFacility(facilityId)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedFacility) return

    setIsDeleting(true)
    try {
      await deleteFacility(selectedFacility)
      toast.success("Facility deleted successfully", {
        description: "The facility has been removed from the system."
      })
      setIsDeleteDialogOpen(false)
      setSelectedFacility(null)
      await refreshFacilities()
    } catch (error) {
      toast.error("Failed to delete facility", {
        description: error instanceof Error ? error.message : "An error occurred while deleting the facility"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setSelectedFacility(null)
  }

  const getFacilityToDelete = () => {
    return facilities.find(f => f.id === selectedFacility)
  }

  // Empty state component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Building2 className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No facilities found</h3>
      <p className="text-muted-foreground mb-4">Facilities will appear here when they are created</p>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facility Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage school facilities and buildings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {facilities.length} {facilities.length === 1 ? 'Facility' : 'Facilities'}
          </Badge>
        </div>
      </div>

      {/* Facilities Grid */}
      {facilities.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {facilities.map((facility, index) => {
              const canDelete = !facility.project_count || facility.project_count === 0

              return (
                <motion.div
                  key={facility.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                    delay: index * 0.05
                  }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 className="h-5 w-5 text-gray-600" />
                            <CardTitle className="text-lg">{facility.name}</CardTitle>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge
                              variant="outline"
                              className={facilityTypeColors[facility.facility_type]}
                            >
                              {facility.facility_type}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={statusColors[facility.status]}
                            >
                              {facility.status}
                            </Badge>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(facility.id)}
                              disabled={!canDelete}
                              className={`h-9 w-9 ${
                                canDelete
                                  ? 'hover:bg-red-50 hover:text-red-600'
                                  : 'opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {canDelete
                              ? 'Delete facility'
                              : 'Cannot delete facility with projects'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* Address */}
                      {facility.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{facility.address}</span>
                        </div>
                      )}

                      {/* Enrollment & Capacity */}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {facility.current_enrollment.toLocaleString()} / {facility.capacity.toLocaleString()} students
                        </span>
                      </div>

                      {/* Project Count */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {facility.project_count || 0} {facility.project_count === 1 ? 'project' : 'projects'}
                          </span>
                        </div>
                        {facility.total_project_cost && facility.total_project_cost > 0 && (
                          <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                            <DollarSign className="h-4 w-4" />
                            <span>${(facility.total_project_cost / 1000000).toFixed(1)}M</span>
                          </div>
                        )}
                      </div>

                      {/* Site Info */}
                      {(facility.site_area || facility.year_built) && (
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-2 border-t">
                          {facility.site_area && (
                            <span>Site: {facility.site_area}</span>
                          )}
                          {facility.year_built && (
                            <span>Built: {facility.year_built}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-xl">Delete Facility</DialogTitle>
                <DialogDescription className="mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <p className="text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">{getFacilityToDelete()?.name}</span>?
            </p>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold mb-1">Warning</p>
                  <p>This will permanently remove the facility from the system. This action cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Facility
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
