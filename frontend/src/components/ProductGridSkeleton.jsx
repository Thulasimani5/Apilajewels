import React from 'react';

const SkeletonCard = () => (
  <div className="block group animate-pulse">
    <div className="relative overflow-hidden bg-[#EEEBEB]" style={{ aspectRatio: '195 / 244' }} />
    <div className="pt-[16px] space-y-[6px]">
      <div className="h-2 w-12 bg-[#EEEBEB] rounded" />
      <div className="h-[36px] w-3/4 bg-[#E3E0E0] rounded" />
      <div className="h-3 w-1/3 bg-[#EEEBEB] rounded mt-[5px]" />
    </div>
  </div>
);

const ProductGridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-[4px] gap-y-[20px] md:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default ProductGridSkeleton;
