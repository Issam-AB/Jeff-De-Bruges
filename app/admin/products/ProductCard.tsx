'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Package, Eye, EyeOff, Star } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ProductForm from '@/components/admin/ProductForm';
import { Badge } from '@/components/ui/badge';
import { fetchStoreAvailability } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onEdit: (product: Product) => void;
  onDeleteClick: (product: Product) => void;
  onUpdate: () => void;
}

function getStatusBadge(product: Product, totalStock: number) {
  if (product.isArticleRouge) {
    return <Badge variant="destructive" className="bg-red-100 text-red-800">Article Rouge</Badge>
  }
  
  if (totalStock > 0) {
    return <Badge variant="default" className="bg-green-100 text-green-800">In Stock</Badge>
  }
  
  return <Badge variant="secondary" className="bg-gray-600 text-gray-200">Out of Stock</Badge>
}

export function ProductCard({ 
  product, 
  viewMode, 
  onEdit,
  onDeleteClick,
  onUpdate 
}: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalStock, setTotalStock] = useState(0);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const data = await fetchStoreAvailability(product.ref)
        const total = Object.values(data).reduce((sum, stock) => sum + stock, 0)
        setTotalStock(total)
      } catch (error) {
        console.error('Failed to fetch stock:', error)
      }
    }

    fetchStock()
  }, [product.ref])

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingStatus(true);
    
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive
        })
      });
      
      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getDiscountPercentage = () => {
    if (!product.VenteflashPrice || product.VenteflashPrice >= product.initialPrice) return 0;
    return Math.round(((product.initialPrice - product.VenteflashPrice) / product.initialPrice) * 100);
  };

  return (
    <Card className={`overflow-hidden transition-all duration-200 hover:shadow-lg ${
      !product.isActive ? 'opacity-60' : ''
    }`}>
      <div className={`
        bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden
        ${viewMode === 'list' ? 'flex' : ''}
      `}>
        <div className={`
          relative aspect-square
          ${viewMode === 'list' ? 'w-48 shrink-0' : ''}
        `}>
          {!product.isActive && (
            <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] z-10" />
          )}
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2 z-20">
            {getStatusBadge(product, totalStock)}
          </div>
          
          {getDiscountPercentage() > 0 && (
            <div className="absolute top-2 left-2 z-20">
              <Badge variant="destructive" className="bg-red-500 text-white">
                -{getDiscountPercentage()}%
              </Badge>
            </div>
          )}
        </div>
        
        <div className={`
          p-4
          ${viewMode === 'list' ? 'flex-1' : ''}
        `}>
          <div className="space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-white line-clamp-2 flex-1">
                  {product.name}
                </h3>
                {(product.isTopProduct ?? false) && (
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Top
                    </div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 font-mono">
                Ref: {product.ref}
              </p>
              <p className="text-sm text-gray-300">
                {product.mainCategory} {product.subCategory && `• ${product.subCategory}`}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-white">
                    {formatPrice(product.VenteflashPrice || product.initialPrice)}
                  </span>
                  {product.VenteflashPrice && product.VenteflashPrice < product.initialPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.initialPrice)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleStatus}
                    disabled={isTogglingStatus}
                    className="p-1 h-8 w-8 text-gray-300 hover:bg-gray-700"
                  >
                    {product.isActive ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {product.isArticleRouge && (
                <div className="flex items-center gap-2 text-red-600">
                  <Star className="w-4 h-4" />
                  <span className="text-sm font-medium">Article Rouge</span>
                  {product.store && (
                    <span className="text-xs bg-red-100 px-2 py-1 rounded">
                      {product.store}
                    </span>
                  )}
                </div>
              )}

              <div className="text-xs text-gray-400">
                Stock: {totalStock} units
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-600">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteClick(product)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20 border-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-[90vw] xl:max-w-[80vw] 2xl:max-w-[1400px]">
          <ProductForm
            initialData={{
              ...product,
              topDealsPrice: product.VenteflashPrice ?? product.initialPrice
            }}
            onSubmit={async (data) => {
              try {
                const response = await fetch(`/api/products/${product.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...data,
                    VenteflashPrice: data.topDealsPrice
                  }),
                });
                
                if (!response.ok) throw new Error('Failed to update product');
                
                setIsEditing(false);
                onUpdate();
              } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product');
              }
            }}
            buttonText="Update Product"
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}