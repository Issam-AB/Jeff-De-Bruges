'use client'

import { useState, useEffect, useMemo } from 'react'
import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { AddProductForm } from './AddProductForm'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PREDEFINED_CATEGORIES } from '@/lib/categories'
import { 
  Plus, 
  Search, 
  Settings, 
  Grid, 
  List, 
  Download, 
  Upload, 
  Filter,
  X,
  RefreshCw,
  ChevronDown,
  SortAsc,
  SortDesc
} from 'lucide-react'
import Spinner from '@/components/Spinner'
import Toast from '@/components/Toast'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CategoryManager } from './CategoryManager'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { EditProductForm } from './EditProductForm'
import { ImportModal } from '@/components/admin/ImportModal'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from '@/components/ui/badge'

type ViewModeValue = 'grid' | 'list'
type SortByValue = 'date' | 'name' | 'price' | 'category'
type SortOrderValue = 'asc' | 'desc'

interface FilterState {
  search: string
  category: string
  subCategory: string
  priceRange: { min: number; max: number }
  status: 'all' | 'active' | 'inactive'
  isArticleRouge: 'all' | 'true' | 'false'
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewModeValue>('grid')
  const [sortBy, setSortBy] = useState<SortByValue>('date')
  const [sortOrder, setSortOrder] = useState<SortOrderValue>('desc')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [updatingPrices, setUpdatingPrices] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // Enhanced filter state
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    subCategory: 'all',
    priceRange: { min: 0, max: 100000 },
    status: 'all',
    isArticleRouge: 'all'
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // Always fetch all products (active and inactive) to enable filtering
      const response = await fetch('/api/admin/products?showInactive=true')
      
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const data = await response.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching products:', err)
      showToastMessage('Failed to load products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Enhanced filtering and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
    const matchesSearch = 
          product.name.toLowerCase().includes(searchTerm) ||
          product.ref.toLowerCase().includes(searchTerm) ||
          product.mainCategory.toLowerCase().includes(searchTerm) ||
          product.subCategory.toLowerCase().includes(searchTerm)
        if (!matchesSearch) return false
      }

      // Category filter
      if (filters.category !== 'all') {
        const categoryData = PREDEFINED_CATEGORIES.find(cat => cat.id === filters.category)
        if (categoryData && product.mainCategory !== categoryData.name) {
          return false
        }
      }

      // Subcategory filter
      if (filters.subCategory !== 'all') {
        if (product.subCategory !== filters.subCategory) {
          return false
        }
      }

      // Price range filter
      const productPrice = product.VenteflashPrice ?? product.initialPrice
      if (productPrice < filters.priceRange.min || productPrice > filters.priceRange.max) {
        return false
      }

      // Status filter
      if (filters.status === 'active' && !product.isActive) return false
      if (filters.status === 'inactive' && product.isActive) return false

      // Article Rouge filter
      if (filters.isArticleRouge === 'true' && !product.isArticleRouge) return false
      if (filters.isArticleRouge === 'false' && product.isArticleRouge) return false

      return true
    })

    // Sorting - Top products first, then by selected criteria
    return filtered.sort((a, b) => {
      // First priority: Top products (handle undefined as false)
      const aIsTop = a.isTopProduct ?? false
      const bIsTop = b.isTopProduct ?? false
      if (aIsTop && !bIsTop) return -1
      if (!aIsTop && bIsTop) return 1
      
      // If both are top products or both are not, sort by selected criteria
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'price':
          const priceA = a.VenteflashPrice ?? a.initialPrice
          const priceB = b.VenteflashPrice ?? b.initialPrice
          comparison = priceA - priceB
          break
        case 'category':
          comparison = a.mainCategory.localeCompare(b.mainCategory)
          break
        case 'date':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }, [products, filters, sortBy, sortOrder])

  const updateBlackFridayPrices = async () => {
    setUpdatingPrices(true)
    try {
      const response = await fetch('/api/admin/black-friday-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (!response.ok) {
        throw new Error('Failed to update product prices')
      }
      
      const result = await response.json()
      showToastMessage(
        `Updated ${result.updatedCount} products. ${result.notFoundCount} products not found.`,
        'success'
      )
      
      fetchProducts()
    } catch (err) {
      console.error('Error updating product prices:', err)
      showToastMessage('Failed to update product prices', 'error')
    } finally {
      setUpdatingPrices(false)
    }
  }

  const handleImport = async (importData: any[], mapping: any) => {
    try {
      const csvContent = [
        'product_ref,bf_price',
        ...importData.map(item => `${item.product_ref},${item.bf_price}`)
      ].join('\n')
      
      const response = await fetch('/api/admin/black-friday-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvContent })
      })
      
      if (!response.ok) {
        throw new Error('Failed to import product prices')
      }
      
      const result = await response.json()
      showToastMessage(
        `Imported ${result.updatedCount} products. ${result.notFoundCount} products not found.`,
        'success'
      )
      
      fetchProducts()
    } catch (err) {
      console.error('Error importing product prices:', err)
      throw new Error('Failed to import product prices')
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      subCategory: 'all',
      priceRange: { min: 0, max: 100000 },
      status: 'all',
      isArticleRouge: 'all'
    })
  }

  const hasActiveFilters = filters.search || 
    filters.category !== 'all' || 
    filters.subCategory !== 'all' || 
    filters.status !== 'all' || 
    filters.isArticleRouge !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">
            Manage your product catalog ({filteredAndSortedProducts.length} of {products.length} products)
            {products.filter(p => !p.isActive).length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-600 text-white">
                {products.filter(p => !p.isActive).length} Inactive
              </Badge>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {products.filter(p => !p.isActive).length > 0 && (
            <Button
              onClick={() => setFilters(prev => ({ ...prev, status: 'inactive' }))}
              variant={filters.status === 'inactive' ? 'default' : 'outline'}
              size="sm"
              className={filters.status === 'inactive' 
                ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                : "border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
              }
            >
              View Inactive ({products.filter(p => !p.isActive).length})
            </Button>
          )}
          <Button
            onClick={() => fetchProducts()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Action Bar */}
      <Card className="p-6 bg-gray-800 border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search and Filters */}
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 bg-gray-600 text-gray-200">
                  {[filters.category !== 'all', filters.subCategory !== 'all', filters.status !== 'all', filters.isArticleRouge !== 'all'].filter(Boolean).length}
                </Badge>
              )}
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewModeValue)}>
              <TabsList className="bg-gray-700">
                <TabsTrigger value="grid" className="flex items-center gap-2 data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300">
                  <Grid size={16} />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300">
                  <List size={16} />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value, subCategory: 'all' }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border border-gray-600 shadow-lg">
                    <SelectItem value="all" className="text-white hover:bg-gray-600">All Categories</SelectItem>
                    {PREDEFINED_CATEGORIES.map(category => (
                      <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-600">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Subcategory</label>
                <Select
                  value={filters.subCategory}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, subCategory: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All subcategories" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border border-gray-600 shadow-lg">
                    <SelectItem value="all" className="text-white hover:bg-gray-600">All Subcategories</SelectItem>
                    {Array.from(new Set(products.map(p => p.subCategory).filter(Boolean))).sort().map(subCat => (
                      <SelectItem key={subCat} value={subCat} className="text-white hover:bg-gray-600">
                        {subCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Status
                  {filters.status === 'inactive' && (
                    <Badge variant="destructive" className="ml-2">
                      {products.filter(p => !p.isActive).length} Inactive
                    </Badge>
                  )}
                </label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border border-gray-600 shadow-lg">
                    <SelectItem value="all" className="text-white hover:bg-gray-600">
                      All Status ({products.length})
                    </SelectItem>
                    <SelectItem value="active" className="text-white hover:bg-gray-600">
                      Active ({products.filter(p => p.isActive).length})
                    </SelectItem>
                    <SelectItem value="inactive" className="text-white hover:bg-gray-600">
                      Inactive ({products.filter(p => !p.isActive).length})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Article Rouge</label>
                <Select
                  value={filters.isArticleRouge}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, isArticleRouge: value as any }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border border-gray-600 shadow-lg">
                    <SelectItem value="all" className="text-white hover:bg-gray-600">All Products</SelectItem>
                    <SelectItem value="true" className="text-white hover:bg-gray-600">Article Rouge Only</SelectItem>
                    <SelectItem value="false" className="text-white hover:bg-gray-600">Regular Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  disabled={!hasActiveFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
            </div>
            </div>
        </div>
        )}

        {/* Sort Controls */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Sort by:</label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortByValue)}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border border-gray-600 shadow-lg">
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
      </div>
          
          <Button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
        
        <Button
          onClick={() => setShowCategoryManager(true)}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <Settings className="w-4 h-4 mr-2" />
          Manage Categories
        </Button>
        
        <Button
          onClick={updateBlackFridayPrices}
          disabled={updatingPrices}
          variant="outline"
          className="border-orange-600 text-orange-400 hover:bg-orange-900/20"
        >
          <Download className="w-4 h-4 mr-2" />
          {updatingPrices ? 'Updating...' : 'Update from Google Sheets'}
        </Button>
        
        <Button
          onClick={() => setShowImportModal(true)}
          variant="outline"
          className="border-green-600 text-green-400 hover:bg-green-900/20"
        >
          <Upload className="w-4 h-4 mr-2" />
          Import CSV
        </Button>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner />
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
        }>
          {filteredAndSortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
              onEdit={() => setProductToEdit(product)}
              onDeleteClick={() => setProductToDelete(product)}
              onUpdate={fetchProducts}
            />
          ))}
        </div>
      )}

      {filteredAndSortedProducts.length === 0 && !loading && (
        <Card className="p-12 text-center bg-gray-800 border-gray-700">
          <div className="text-gray-400">
            <p className="text-lg font-medium mb-2">No products found</p>
            <p className="text-sm">
              {hasActiveFilters 
                ? 'Try adjusting your filters or search terms'
                : 'Get started by adding your first product'
              }
          </p>
        </div>
        </Card>
      )}

      {/* Modals */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <AddProductForm
            onClose={() => setShowAddForm(false)}
            onProductAdded={() => {
              setShowAddForm(false)
              fetchProducts()
              showToastMessage('Product added successfully!')
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showCategoryManager} onOpenChange={setShowCategoryManager}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <CategoryManager
            onClose={() => setShowCategoryManager(false)}
            onSave={() => {
              setShowCategoryManager(false)
              showToastMessage('Categories updated successfully!')
            }}
          />
        </DialogContent>
      </Dialog>

      {productToEdit && (
      <Dialog open={!!productToEdit} onOpenChange={() => setProductToEdit(null)}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
            <EditProductForm
              product={productToEdit}
              onClose={() => setProductToEdit(null)}
              onProductUpdated={() => {
                setProductToEdit(null)
                fetchProducts()
                showToastMessage('Product updated successfully!')
              }}
            />
        </DialogContent>
      </Dialog>
      )}

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (productToDelete) {
                try {
                  const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
                      method: 'DELETE'
                    })
                    if (response.ok) {
                      fetchProducts()
                      showToastMessage('Product deleted successfully!')
                    } else {
                      showToastMessage('Failed to delete product', 'error')
                    }
                  } catch (error) {
                    showToastMessage('Failed to delete product', 'error')
                  }
                }
                setProductToDelete(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={showToast}
          onClose={() => setShowToast(false)}
        />
      )}

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImport}
      />
    </div>
  )
} 