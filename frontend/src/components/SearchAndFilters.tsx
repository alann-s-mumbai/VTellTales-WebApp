import React from 'react'
import { Search, Filter, X, TrendingUp, Clock, Heart, Grid, List, Star } from 'lucide-react'

interface SearchAndFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedFilter: string
  onFilterChange: (filter: string) => void
  categoryFilter: string
  onCategoryChange: (category: string) => void
  categories: Array<{ id: string; name: string }>
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  showMobileFilters: boolean
  onToggleMobileFilters: () => void
}

const filterOptions = [
  { id: 'all', label: 'All Stories', icon: Grid },
  { id: 'popular', label: 'Most Popular', icon: TrendingUp },
  { id: 'recent', label: 'Recently Added', icon: Clock },
  { id: 'liked', label: 'Most Liked', icon: Heart }
]

export function SearchAndFilters({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange,
  categoryFilter,
  onCategoryChange,
  categories,
  viewMode,
  onViewModeChange,
  showMobileFilters,
  onToggleMobileFilters
}: SearchAndFiltersProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Search Bar */}
        <div className="flex items-center gap-4 py-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search stories, authors, or categories..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={onToggleMobileFilters}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>

          {/* Desktop View Mode Toggle */}
          <div className="hidden lg:flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 ${viewMode === 'grid' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 ${viewMode === 'list' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-6 pb-4">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {filterOptions.map((filter) => {
              const Icon = filter.icon
              return (
                <button
                  key={filter.id}
                  onClick={() => onFilterChange(filter.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </button>
              )
            })}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All Categories">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="lg:hidden border-t border-gray-200">
            <div className="py-4 space-y-4">
              {/* Close Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={onToggleMobileFilters}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Filter Options */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Sort By</h4>
                <div className="grid grid-cols-2 gap-2">
                  {filterOptions.map((filter) => {
                    const Icon = filter.icon
                    return (
                      <button
                        key={filter.id}
                        onClick={() => {
                          onFilterChange(filter.id)
                          onToggleMobileFilters()
                        }}
                        className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedFilter === filter.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {filter.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    onCategoryChange(e.target.value)
                    onToggleMobileFilters()
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">View Mode</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewModeChange('grid')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium ${
                      viewMode === 'grid'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                    Grid
                  </button>
                  <button
                    onClick={() => onViewModeChange('list')}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg text-sm font-medium ${
                      viewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <List className="h-4 w-4" />
                    List
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}