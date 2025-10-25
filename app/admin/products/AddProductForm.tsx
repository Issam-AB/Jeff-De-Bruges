'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PREDEFINED_CATEGORIES } from '@/lib/categories';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Info, Flame, Star, Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { put } from '@vercel/blob';

interface AddProductFormProps {
  onClose: () => void;
  onProductAdded: () => void;
}

const MAX_GALLERY_IMAGES = 4;
const MAX_FILE_SIZE = 5; // MB

const CATEGORY_STRUCTURE = {
  'SALONS': ['Salon en L', 'Salon en U'],
  'CANAPES': ['Canapé 2 Places', 'Canapé 3 Places', 'Fauteuils'],
  'CHAMBRE': ['Lits', 'Matelas', 'Table de Chevet'],
  'TABLES': ['Tables Basses', 'Tables à Manger', 'Tables d\'Appoint'],
  'CHAISES': ['Chaises de Salle à Manger', 'Chaises de Bureau'],
  'RANGEMENT': ['Armoires', 'Bibliothèques', 'Commodes', 'Buffets'],
  'DECO': ['Tapis', 'Miroirs', 'Tableaux', 'Vases'],
  'JARDIN': ['Ensemble D\'extérieur', 'Tables de Jardin', 'Chaises de Jardin']
};

const STORES = ['Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Bouskoura'] as const;

// Image Upload Component
function ImageUpload({ 
  mainImage, 
  gallery, 
  onImagesUpdated 
}: { 
  mainImage: string; 
  gallery: string[]; 
  onImagesUpdated: (mainImage: string, gallery: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File, isMain = false) => {
    setUploading(true);
    try {
      const blob = await put(file.name, file, { access: 'public' });
      if (isMain) {
        onImagesUpdated(blob.url, gallery);
      } else {
        onImagesUpdated(mainImage, [...gallery, blob.url]);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-300">Main Image</label>
        <div className="relative">
          {mainImage ? (
            <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 border border-gray-700">
              <Image src={mainImage} alt="Main" fill className="object-cover" />
              <button
                onClick={() => onImagesUpdated('', gallery)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="aspect-square rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/50 flex items-center justify-center hover:border-gray-500 transition-colors">
              <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-gray-300">
                <Upload className="w-8 h-8" />
                <span className="text-sm">Upload Main Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], true)}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Images */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-300">Gallery Images</label>
          <span className="text-xs text-gray-500">{gallery.length}/4</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {gallery.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
              <Image src={url} alt={`Gallery ${index + 1}`} fill className="object-cover" />
              <button
                onClick={() => onImagesUpdated(mainImage, gallery.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {gallery.length < 4 && (
            <div className="aspect-square rounded-lg border-2 border-dashed border-gray-600 bg-gray-800/50 flex items-center justify-center hover:border-gray-500 transition-colors">
              <label className="cursor-pointer flex flex-col items-center gap-1 text-gray-400 hover:text-gray-300">
                <ImageIcon className="w-6 h-6" />
                <span className="text-xs">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                  disabled={uploading}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AddProductForm({ onClose, onProductAdded }: AddProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    ref: '',
    dimensions: '',
    mainCategory: PREDEFINED_CATEGORIES[0]?.id || 'tous',
    subCategory: '',
    initialPrice: '',
    VenteflashPrice: '',
    mainImage: '',
    gallery: [] as string[],
    isActive: true,
    isArticleRouge: false,
    articleRougePrice: null as number | null,
    store: null as string | null,
    isTopProduct: false,
  });

  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mainCategory: selectedMainCategory || formData.mainCategory,
          initialPrice: Number(formData.initialPrice),
          VenteflashPrice: Number(formData.VenteflashPrice),
          gallery: formData.gallery || []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      onProductAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const availableSubcategories = CATEGORY_STRUCTURE[formData.mainCategory as keyof typeof CATEGORY_STRUCTURE] || [];

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader className="pb-3 border-b border-gray-700">
          <DialogTitle className="text-xl font-bold text-white">Add New Product</DialogTitle>
          <p className="text-gray-400 text-xs">Create a new product for your catalog</p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <ImageUpload
                mainImage={formData.mainImage}
                gallery={formData.gallery}
                onImagesUpdated={(mainImage, gallery) => 
                  setFormData({ ...formData, mainImage, gallery })
                }
              />
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Info className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Product Reference</label>
                  <Input
                    value={formData.ref}
                    onChange={(e) => setFormData({ ...formData, ref: e.target.value })}
                    placeholder="e.g., 123.45.678"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Product Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Dimensions</label>
                  <Input
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    placeholder="e.g., 200x150x80 cm"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">Categories</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Main Category</label>
                  <Select
                    value={selectedMainCategory || formData.mainCategory}
                    onValueChange={(value) => {
                      setSelectedMainCategory(value);
                      setFormData({ ...formData, mainCategory: value, subCategory: '' });
                    }}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {Object.keys(CATEGORY_STRUCTURE).map((category) => (
                        <SelectItem key={category} value={category} className="text-white hover:bg-gray-600">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Subcategory</label>
                  <Select
                    value={formData.subCategory}
                    onValueChange={(value) => setFormData({ ...formData, subCategory: value })}
                    disabled={!availableSubcategories.length}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {availableSubcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory} className="text-white hover:bg-gray-600">
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-yellow-500/20 rounded-lg">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Pricing</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Initial Price (DH)</label>
                  <Input
                    type="number"
                    value={formData.initialPrice}
                    onChange={(e) => setFormData({ ...formData, initialPrice: e.target.value })}
                    placeholder="0.00"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">Black Friday Price (DH)</label>
                  <Input
                    type="number"
                    value={formData.VenteflashPrice}
                    onChange={(e) => setFormData({ ...formData, VenteflashPrice: e.target.value })}
                    placeholder="0.00"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Article Rouge */}
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 rounded-lg p-4 border border-red-800">
              <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-red-500/20 rounded-lg">
                  <Flame className="w-4 h-4 text-red-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Article Rouge</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.isArticleRouge}
                    onCheckedChange={(checked) => setFormData({ ...formData, isArticleRouge: checked })}
                  />
                  <label className="text-sm font-medium text-gray-300">Mark as Article Rouge</label>
                </div>
                
                {formData.isArticleRouge && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-red-800">
                    <div>
                      <label className="block text-sm font-medium text-red-300 mb-2">Article Rouge Price (DH)</label>
                      <Input
                        type="number"
                        value={formData.articleRougePrice || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          articleRougePrice: parseFloat(e.target.value) 
                        })}
                        className="bg-gray-700 border-red-700 text-white placeholder-gray-400 focus:border-red-500 focus:ring-red-500"
                        required={formData.isArticleRouge}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-300 mb-2">Store</label>
                      <Select
                        value={formData.store || ''}
                        onValueChange={(value) => setFormData({ ...formData, store: value })}
                        required={formData.isArticleRouge}
                      >
                        <SelectTrigger className="bg-gray-700 border-red-700 text-white focus:border-red-500 focus:ring-red-500">
                          <SelectValue placeholder="Select store" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-red-700">
                          {STORES.map((store) => (
                            <SelectItem key={store} value={store} className="text-white hover:bg-gray-600">
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

            {/* Top Products */}
            <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                  <Star className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Top Products</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={formData.isTopProduct}
                    onCheckedChange={(checked) => setFormData({ ...formData, isTopProduct: checked })}
                  />
                  <label className="text-sm font-medium text-gray-300">Mark as Top Product</label>
                </div>
                
                <div className="text-xs text-gray-400 bg-gray-800/50 rounded-lg p-3">
                  <p>• Top products appear first in the product grid</p>
                  <p>• Perfect for highlighting your best sellers</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-500/20 rounded-lg">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-white">Status</h3>
              </div>
              
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <label className="text-sm font-medium text-gray-300">Active Product</label>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </Button>
        </div>
      </form>
    </div>
  );
}