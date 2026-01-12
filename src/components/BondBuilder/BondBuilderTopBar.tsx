import { useState } from 'react'
import { Button } from '../ui/button'
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'
import { Badge } from '../ui/badge'
import { Save, Download, Plus, Calendar, DollarSign, BarChart3, List, GitCompare } from 'lucide-react'
import { useTheme } from '../System/ThemeManager'
import type { Package } from '../BondBuilderPro'

interface BondBuilderTopBarProps {
  packages: Package[]
  activePackage: string
  onPackageChange: (packageId: string) => void
  totalCost: number
  dateRange: { start: number; end: number }
  viewMode: 'timeline' | 'list' | 'compare'
  onViewModeChange: (mode: 'timeline' | 'list' | 'compare') => void
}

export function BondBuilderTopBar({
  packages,
  activePackage,
  onPackageChange,
  totalCost,
  dateRange,
  viewMode,
  onViewModeChange
}: BondBuilderTopBarProps) {
  const { colors } = useTheme()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editName, setEditName] = useState('')

  const currentPackage = packages.find(p => p.id === activePackage)!

  const handleNameEdit = () => {
    setEditName(currentPackage.name)
    setIsEditingName(true)
  }

  const handleNameSave = () => {
    // In a real app, this would update the package name
    setIsEditingName(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Package Name & Tabs */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 outline-none"
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                />
              </div>
            ) : (
              <h1 
                className="cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleNameEdit}
              >
                {currentPackage.name}
              </h1>
            )}
          </div>

          {/* Package Tabs */}
          <div className="flex items-center gap-2">
            <Tabs value={activePackage} onValueChange={onPackageChange}>
              <TabsList className="bg-gray-100">
                {packages.map((pkg) => (
                  <TabsTrigger key={pkg.id} value={pkg.id} className="text-sm">
                    {pkg.name.split(':')[0]}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="new" className="text-sm text-blue-600">
                  <Plus className="h-3 w-3 mr-1" />
                  New
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Middle - Total Cost & Date Range */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-3xl font-bold text-green-600">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{dateRange.start} - {dateRange.end}</span>
          </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('timeline')}
              className="h-8 px-3 rounded-r-none"
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Timeline
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-8 px-3 rounded-l-none"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>

          {/* Save Button */}
          <Button 
            style={{ 
              backgroundColor: colors.secondary.skyBlue,
              color: colors.primary.white 
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.secondary.darkBlue
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.secondary.skyBlue
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          {/* Export Button */}

        </div>
      </div>
    </div>
  )
}