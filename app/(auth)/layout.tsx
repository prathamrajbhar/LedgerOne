import * as React from "react";
import Link from "next/link";
import { Package, FileText, Users, BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full flex flex-col lg:flex-row items-stretch bg-[#F6F8FB] font-sans">
      {/* Background Graphic */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/auth-bg.png')",
        }}
      />

      {/* Left Column: Brand Identity, Value Proposition & Feature Badges */}
      <div className="relative z-10 flex-1 flex flex-col justify-between py-8 sm:py-10 lg:py-12 xl:py-16 px-6 sm:px-12 lg:px-14 xl:px-20 2xl:px-24 lg:max-w-[50%] lg:min-h-screen">
        {/* Top Header Branding */}
        <div>
          <Link href="/" className="inline-block group">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942]">
              Ledger<span className="text-[#167C80]">One</span>
            </span>
            <p className="text-xs text-[#526477] mt-0.5 font-normal tracking-wide">
              Enterprise Accounting & Furniture ERP System
            </p>
          </Link>
          <div className="w-10 h-1 bg-[#167C80] rounded-full mt-2.5" />
        </div>

        {/* Center Hero Copy & 4 Capability Indicators */}
        <div className="my-auto py-6 space-y-5 max-w-lg">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl xl:text-[42px] font-extrabold text-[#0F2942] tracking-tight leading-[1.12]">
              Manage Smarter.
              <br />
              <span className="text-[#0F2942]">Grow Faster.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed max-w-md">
              A comprehensive double-entry accounting and inventory control platform purpose-built for furniture manufacturing and retail enterprises.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full h-22">
              <div className="h-8 w-8 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1.5 flex-shrink-0">
                <Package className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Inventory
                <br />
                Tracking
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full h-22">
              <div className="h-8 w-8 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1.5 flex-shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                General
                <br />
                Ledger
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full h-22">
              <div className="h-8 w-8 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1.5 flex-shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Vendor &
                <br />
                Client Portal
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full h-22">
              <div className="h-8 w-8 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1.5 flex-shrink-0">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Financial
                <br />
                Analytics
              </span>
            </div>
          </div>
        </div>

        {/* Empty bottom space to maintain alignment */}
        <div className="hidden lg:block h-2" />
      </div>

      {/* Right Column: Floating Auth Card Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center py-8 sm:py-10 lg:py-12 xl:py-16 px-6 sm:px-10 lg:pl-10 lg:pr-16 xl:pr-24 2xl:pr-32 lg:max-w-[50%] lg:min-h-screen">
        {/* Main Floating Auth Card Container */}
        <div className="my-auto flex justify-center items-center w-full">
          <div className="w-full max-w-[425px]">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
}
