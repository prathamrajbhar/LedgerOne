import * as React from "react";

export default function WorkspaceLoading() {
  return (
    <div className="w-full h-full p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200/80 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-24 bg-slate-200/80 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200/80 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-white border border-slate-100 p-4 shadow-xs flex flex-col justify-between"
          >
            <div className="flex justify-between items-center">
              <div className="h-4 w-20 bg-slate-100 rounded-md" />
              <div className="h-8 w-8 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-6 w-28 bg-slate-200/80 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main Content / Table Skeleton */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="h-5 w-36 bg-slate-200/80 rounded-md" />
          <div className="h-8 w-44 bg-slate-100 rounded-lg" />
        </div>
        <div className="space-y-3 pt-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-slate-50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
