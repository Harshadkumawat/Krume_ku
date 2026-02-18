import React from "react";

// --- 👕 CLOTHES GRID SKELETON ---
export const ClothesSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse p-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col gap-4">
          {/* Image Box Placeholder */}
          <div className="aspect-[3/4] bg-zinc-100 rounded-[2rem] w-full" />
          <div className="space-y-3">
            {/* Title Line */}
            <div className="h-3 bg-zinc-100 w-3/4 rounded-full" />
            {/* Price Line */}
            <div className="h-3 bg-zinc-100 w-1/4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

// --- 🔍 PRODUCT DETAILS SKELETON ---
export const DetailsSkeleton = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
      {/* Left: Gallery Placeholder */}
      <div className="lg:col-span-7 aspect-[4/5] bg-zinc-100 rounded-[2rem]" />

      {/* Right: Info Placeholder */}
      <div className="lg:col-span-5 space-y-10">
        <div className="space-y-4">
          <div className="h-10 bg-zinc-100 w-full rounded-xl" />
          <div className="h-10 bg-zinc-100 w-3/4 rounded-xl" />
          <div className="h-6 bg-zinc-100 w-1/4 rounded-full" />
        </div>
        <div className="h-32 bg-zinc-100 w-full rounded-[2rem]" />
        <div className="h-20 bg-zinc-900/5 w-full rounded-2xl" />
      </div>
    </div>
  );
};
