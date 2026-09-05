import * as React from "react";
import Link from "next/link";
import { Package, FileText, Users, BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col lg:flex-row items-stretch bg-[#F6F8FB] font-sans overflow-x-hidden">
      {/* Background Graphic */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/auth-bg.png')",
        }}
      />
      {/* Soft adaptive overlay for mobile & narrow screens */}
      <div className="fixed inset-0 w-full h-full bg-white/45 lg:bg-transparent pointer-events-none z-0 backdrop-blur-[1px] lg:backdrop-blur-none" />

      {/* Mobile Top Header Branding (< lg screens) */}
      <div className="lg:hidden relative z-10 w-full pt-5 pb-2 px-6 flex items-center justify-between">
        <Link href="/" className="inline-block group">
          <span className="text-2xl font-extrabold tracking-tight text-[#0F2942]">
            Ledger<span className="text-[#167C80]">One</span>
          </span>
          <p className="text-[11px] text-[#526477] font-normal">
            Enterprise Accounting & Furniture ERP
          </p>
        </Link>
        <div className="w-8 h-1 bg-[#167C80] rounded-full" />
      </div>

      {/* Left Column: Brand Identity, Value Proposition & Feature Badges (Desktop lg+) */}
      <div className="hidden lg:flex relative z-10 flex-1 flex-col justify-between py-8 xl:py-12 px-8 xl:px-16 2xl:px-20 max-w-[50%] min-h-[100dvh]">
        {/* Top Header Branding */}
        <div>
          <Link href="/" className="inline-block group">
            <span className="text-2xl xl:text-3xl font-extrabold tracking-tight text-[#0F2942]">
              Ledger<span className="text-[#167C80]">One</span>
            </span>
            <p className="text-xs text-[#526477] mt-0.5 font-normal tracking-wide">
              Enterprise Accounting & Furniture ERP System
            </p>
          </Link>
          <div className="w-10 h-1 bg-[#167C80] rounded-full mt-2" />
        </div>

        {/* Center Hero Copy & 4 Capability Indicators */}
        <div className="my-auto py-4 space-y-4 xl:space-y-6 max-w-lg">
          <div className="space-y-2.5">
            <h1 className="text-3xl xl:text-4xl 2xl:text-[42px] font-extrabold text-[#0F2942] tracking-tight leading-[1.14]">
              Manage Smarter.
              <br />
              <span className="text-[#0F2942]">Grow Faster.</span>
            </h1>
            <p className="text-xs xl:text-sm text-[#4A5568] leading-relaxed max-w-md">
              A comprehensive double-entry accounting and inventory control platform purpose-built for furniture manufacturing and retail enterprises.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-4 gap-2 xl:gap-2.5 pt-1">
            <div className="bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-2.5 xl:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full">
              <div className="h-7 w-7 xl:h-8 xl:w-8 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1 flex-shrink-0">
                <Package className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Inventory
                <br />
                Tracking
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-2.5 xl:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full">
              <div className="h-7 w-7 xl:h-8 xl:w-8 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1 flex-shrink-0">
                <FileText className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                General
                <br />
                Ledger
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-2.5 xl:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full">
              <div className="h-7 w-7 xl:h-8 xl:w-8 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1 flex-shrink-0">
                <Users className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Vendor &
                <br />
                Portal
              </span>
            </div>

            <div className="bg-white/90 backdrop-blur-sm border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-2.5 xl:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full">
              <div className="h-7 w-7 xl:h-8 xl:w-8 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1 flex-shrink-0">
                <BarChart3 className="h-3.5 w-3.5 xl:h-4 xl:w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Financial
                <br />
                Analytics
              </span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[11px] text-[#526477]/80">
          © {new Date().getFullYear()} LedgerOne Enterprise. All rights reserved.
        </div>
      </div>

      {/* Right Column: Centered Floating Auth Card Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-4 sm:py-8 lg:py-10 px-4 sm:px-8 lg:px-10 xl:px-16 w-full lg:max-w-[50%] min-h-[calc(100dvh-80px)] lg:min-h-[100dvh]">
        <div className="w-full max-w-[425px] my-auto">
          {children}
        </div>

        {/* Mobile-only compact feature indicators below the card */}
        <div className="lg:hidden mt-5 pb-6 flex flex-wrap justify-center items-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[10px] font-semibold text-[#0F2942] shadow-xs">
            <Package className="h-3 w-3 text-[#16324F]" /> Inventory
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[10px] font-semibold text-[#0F2942] shadow-xs">
            <FileText className="h-3 w-3 text-[#16324F]" /> General Ledger
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[10px] font-semibold text-[#0F2942] shadow-xs">
            <Users className="h-3 w-3 text-[#16324F]" /> Client Portal
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[10px] font-semibold text-[#0F2942] shadow-xs">
            <BarChart3 className="h-3 w-3 text-[#16324F]" /> Analytics
          </span>
        </div>
      </div>
    </main>
  );
}
