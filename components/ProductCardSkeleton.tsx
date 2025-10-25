export default function ProductCardSkeleton() {
  return (
    <div className="w-full h-[400px] bg-white/5 rounded-lg animate-pulse">
      <div className="aspect-square bg-gray-800/50" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-800/50 rounded w-3/4" />
        <div className="h-4 bg-gray-800/50 rounded w-1/2" />
        <div className="h-8 bg-gray-800/50 rounded w-full mt-4" />
      </div>
    </div>
  )
} 