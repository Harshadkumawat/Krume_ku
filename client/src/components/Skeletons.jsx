import React from "react";

const SkeletonBase = ({ className }) => (
  <div className={`animate-pulse bg-zinc-100 rounded-md ${className}`} />
);

export const ClothesSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 p-4 md:p-10">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          {/* Image Box */}
          <SkeletonBase className="aspect-[3/4] rounded-[1.5rem] md:rounded-[2.5rem] w-full" />

          <div className="space-y-3 px-1">
            {/* Title Line */}
            <SkeletonBase className="h-3 w-3/4 rounded-full" />
            {/* Price Line */}
            <SkeletonBase className="h-3 w-1/4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const DetailsSkeleton = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 animate-pulse">
      {/* Left: Gallery Placeholder */}
      <div className="lg:col-span-7 aspect-[4/5] bg-zinc-50 rounded-[2rem] md:rounded-[3rem]" />

      {/* Right: Info Placeholder */}
      <div className="lg:col-span-5 space-y-8 md:space-y-12 py-4">
        <div className="space-y-5">
          <SkeletonBase className="h-8 md:h-12 w-full rounded-xl" />
          <SkeletonBase className="h-8 md:h-12 w-4/5 rounded-xl" />
          <SkeletonBase className="h-5 md:h-6 w-1/4 rounded-full" />
        </div>

        {/* Action Buttons area */}
        <div className="space-y-4">
          <SkeletonBase className="h-14 md:h-16 w-full rounded-2xl" />
          <SkeletonBase className="h-14 md:h-16 w-full rounded-2xl" />
        </div>

        {/* Description area */}
        <div className="space-y-3">
          <SkeletonBase className="h-3 w-full" />
          <SkeletonBase className="h-3 w-full" />
          <SkeletonBase className="h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
};

export function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-4 w-full h-full animate-pulse">
      <SkeletonBase className="aspect-[3/4] w-full rounded-2xl" />
      <div className="space-y-2 px-1">
        <SkeletonBase className="h-3 w-3/4 rounded-full" />
        <SkeletonBase className="h-3 w-1/4 rounded-full" />
      </div>
    </div>
  );
}

export const ListSkeleton = () => {
  return (
    <div className="w-full p-4 md:p-6 bg-white border border-zinc-100 rounded-[1.2rem] md:rounded-[1.5rem] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 animate-pulse mb-4 md:mb-6">
      <div className="flex gap-4 md:gap-5 flex-1 w-full">
        <div className="w-20 h-24 md:w-24 md:h-32 bg-zinc-100 rounded-xl flex-shrink-0" />

        <div className="flex flex-col justify-center flex-1 space-y-3 py-1">
          <div className="h-2 w-20 bg-zinc-100 rounded-full" />
          <div className="h-4 w-3/4 md:w-1/2 bg-zinc-100 rounded-full" />{" "}
          <div className="flex gap-2 mt-1">
            <div className="h-3 w-12 bg-zinc-100 rounded-md" />
            <div className="h-3 w-12 bg-zinc-100 rounded-md" />
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className="h-4 w-16 bg-zinc-100 rounded-full" />
            <div className="h-5 w-20 bg-zinc-100 rounded-full" />{" "}
          </div>
        </div>
      </div>

      <div className="w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t border-zinc-100 md:border-t-0">
        <div className="h-12 w-full md:w-40 bg-zinc-100 rounded-xl" />
      </div>
    </div>
  );
};

export const OrderDetailsSkeleton = () => (
  <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-16 pb-20 animate-pulse">
    <div className="flex justify-between mb-10">
      <SkeletonBase className="h-6 w-32" />
      <SkeletonBase className="h-8 w-24 rounded-full" />
    </div>
    <div className="mb-12 space-y-4">
      <SkeletonBase className="h-12 md:h-16 w-1/2 md:w-1/3 rounded-xl" />
      <SkeletonBase className="h-4 w-40" />
    </div>
    <SkeletonBase className="h-24 rounded-xl mb-16" />
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-6">
        <SkeletonBase className="h-32 rounded-xl" />
        <SkeletonBase className="h-32 rounded-xl" />
      </div>
      <div className="lg:col-span-4 space-y-6">
        <SkeletonBase className="h-48 rounded-xl" />
        <SkeletonBase className="h-48 rounded-xl" />
      </div>
    </div>
  </div>
);
