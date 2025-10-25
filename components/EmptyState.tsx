import { motion } from 'framer-motion'
import { Category } from '@/lib/categories'

interface EmptyStateProps {
  category: Category | undefined
}

export default function EmptyState({ category }: EmptyStateProps) {
  return (
    <div className="w-full mt-24 flex flex-col items-center justify-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md mx-auto p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-6"
        >
          <div className="w-20 h-20 mx-auto bg-orange-50 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-orange-500"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M20 12H4M8 16l-4-4 4-4"
              />
            </svg>
          </div>
        </motion.div>

        {/* Main Message */}
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-semibold text-gray-800 mb-3"
        >
          {category 
            ? `Aucun produit dans ${category.name}`
            : 'Aucun produit disponible'
          }
        </motion.h3>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 mb-6"
        >
          Nous n'avons pas encore de produits dans cette catégorie
        </motion.p>

        {/* Suggestions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-400"
        >
          <p>Suggestions:</p>
          <ul className="mt-2 space-y-1">
            <li>• Essayez une autre catégorie</li>
            <li>• Revenez plus tard pour voir les nouveautés</li>
            <li>• Consultez notre collection complète</li>
          </ul>
        </motion.div>
      </motion.div>
    </div>
  )
}

