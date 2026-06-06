import React from 'react';

const SkeletonCard = () => (
  <div className="block group animate-pulse">
    <div className="relative aspect-square rounded-[10px] overflow-hidden bg-[#EEEBEB]" />
    <div className="pt-[5px] pb-[2px] space-y-1.5">
      <div className="h-2 w-12 bg-[#EEEBEB] rounded" />
      <div className="h-3 w-3/4 bg-[#E3E0E0] rounded" />
      <div className="h-2.5 w-1/3 bg-[#EEEBEB] rounded" />
    </div>
  </div>
);

const ProductGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[10px] md:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default ProductGridSkeleton;
