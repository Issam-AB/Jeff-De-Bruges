'use client'

import { useState } from 'react'
import { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { PREDEFINED_CATEGORIES } from '@/lib/categories'
import { Switch } from '@/components/ui/switch'
import ImageUpload from './ImageUpload'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Info, DollarSign, Flame } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface EditProductFormProps {
  product: Product
  onClose: () => void
  onProductUpdated: () => void
}

// Create a type for the category structure
type CategoryStructure = {
  [key: string]: string[]
}

// Create a flattened category structure for the form
const CATEGORY_STRUCTURE: CategoryStructure = {
  "SALONS": [
    "Salon en L",
    "Salon en U"
  ],
  "CANAPÉS": [
    "Canapé 2 Places",
    "Canapé 3 Places",
    "Fauteuils"
  ],
  "CHAMBRE": [
    "Lits",
    "Matelas",
    "Table de Chevet"
  ],
  "TABLES": [
    "Table Basse",
    "Table de Salle à Manger",
    "Table D'appoint"
  ],
  "CHAISES": [
    "Chaises"
  ],
  "JARDIN": [
    "Ensemble D'extérieur",
    "Salle à Manger + Chaises"
  ],
  "MEUBLES": [
    "Consoles",
    "Armoires",
    "Bibliothèques",
    "Buffets",
    "Meubles TV"
  ],
  "DECO": [
    "Mirroirs"
  ]
}

const STORES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger'] as const

export function EditProductForm({ product, onClose, onProductUpdated }: EditProductFormProps) {
  const defaultMainCategory = Object.keys(PREDEFINED_CATEGORIES)[0] as string
  
  const [formData, setFormData] = useState({
    ...product,
    mainCategory: (product.mainCategory || defaultMainCategory) as string,
    VenteflashPrice: product.VenteflashPrice,
    articleRougePrice: product.articleRougePrice ?? null,
    store: product.store ?? null,
    isArticleRouge: product.isArticleRouge ?? false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create the update data object
      const updateData = {
        ...formData,
        initialPrice: Number(formData.initialPrice),
        VenteflashPrice: Number(formData.VenteflashPrice),
        isArticleRouge: Boolean(formData.isArticleRouge),
        // Add these fields for Article Rouge
        articleRougePrice: formData.isArticleRouge ? Number(formData.articleRougePrice) : null,
        store: formData.isArticleRouge ? formData.store : null,
      }

      console.log('Sending update data:', updateData) // Debug log

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update product')
      }

      onProductUpdated()
      onClose()
    } catch (err) {
      console.error('Update error:', err) // Debug log
      setError(err instanceof Error ? err.message : 'Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  const availableSubcategories = CATEGORY_STRUCTURE[formData.mainCategory] || []

  return (
    <form onSubmit={handleSubmit} className="relative">
      <DialogHeader>
        <DialogTitle>Edit Product</DialogTitle>
      </DialogHeader>

      <div className="space-y-8 pb-20">
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div className="space-y-6">
            <ImageUpload
              mainImage={formData.mainImage}
              gallery={formData.gallery}
              onImagesUpdated={(mainImage, gallery) => 
                setFormData({ ...formData, mainImage, gallery })
              }
            />
          </div>

          {/* Right Column - Product Details */}
          <div className="flex-1 space-y-6">
            {/* Basic Info */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-lg text-gray-900">Basic Information</h3>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Reference</label>
                  <Input
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Dimensions</label>
                  <Input
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="bg-white"
                    required
                  />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <label className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <h3 className="font-medium text-lg text-gray-900">Categories</h3>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Main Category</label>
                  <Select
                    value={formData.mainCategory}
                    onValueChange={(value: string) => setFormData({ 
                      ...formData, 
                      mainCategory: value,
                      subCategory: ''
                    })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {Object.keys(CATEGORY_STRUCTURE).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Subcategory</label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {availableSubcategories.map((subCategory) => (
                        <SelectItem key={subCategory} value={subCategory}>
                          {subCategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-lg text-gray-900">Pricing</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">Initial Price (DH)</label>
                  <Input
                    type="number"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData({ ...formData, initialPrice: parseFloat(e.target.value) })}
                    className="bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-gray-700">TopDeals Price (DH)</label>
                  <Input
                    type="number"
                    value={formData.VenteflashPrice}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      VenteflashPrice: parseFloat(e.target.value) || product.initialPrice 
                    })}
                    className="bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Article Rouge Section */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="w-5 h-5 text-red-500" />
                <h3 className="font-medium text-lg text-gray-900">Article Rouge</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.isArticleRouge}
                    onCheckedChange={(checked) => setFormData({ ...formData, isArticleRouge: checked })}
                    className="data-[state=checked]:bg-red-600"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Marquer comme Article Rouge
                  </label>
                </div>

                {formData.isArticleRouge && (
                  <div className="grid gap-4 pt-4 border-t border-red-200">
                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-red-700">
                        Prix Article Rouge (DH)
                      </label>
                      <Input
                        type="number"
                        value={formData.articleRougePrice || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          articleRougePrice: parseFloat(e.target.value)
                        })}
                        className="bg-white border-red-200 focus:border-red-400 focus:ring-red-400"
                        required={formData.isArticleRouge}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5 text-red-700">
                        Magasin
                      </label>
                      <Select
                        value={formData.store || ''}
                        onValueChange={(value) => setFormData({ ...formData, store: value })}
                        required={formData.isArticleRouge}
                      >
                        <SelectTrigger className="bg-white border-red-200 focus:border-red-400 focus:ring-red-400">
                          <SelectValue placeholder="Sélectionner un magasin" />
                        </SelectTrigger>
                        <SelectContent>
                          {STORES.map((store) => (
                            <SelectItem key={store} value={store}>
                              {store}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 -mx-6 -mb-6 px-6 py-4 bg-white border-t flex justify-end gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          className="min-w-[100px] bg-white hover:bg-gray-50"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white shadow-lg
                   hover:shadow-blue-500/25 transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Updating...</span>
            </div>
          ) : (
            'Update Product'
          )}
        </Button>
      </div>
    </form>
  )
} 