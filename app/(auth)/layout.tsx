import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, FileText, Users, BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      className="relative w-full h-[100dvh] h-[100svh] overflow-hidden bg-[#F6F8FB] font-sans flex flex-col justify-between selection:bg-[#167C80]/20 select-none"
      style={{
        paddingTop: "max(14px, env(safe-area-inset-top))",
        paddingBottom: "max(14px, env(safe-area-inset-bottom))",
        paddingLeft: "max(16px, env(safe-area-inset-left))",
        paddingRight: "max(16px, env(safe-area-inset-right))",
      }}
    >
      {/* Existing Background Image - Unmodified, cover, center */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/auth-bg.png')",
        }}
      />
      {/* Subtle readability overlay on mobile */}
      <div className="fixed inset-0 w-full h-full bg-white/20 lg:bg-transparent pointer-events-none z-0" />

      {/* Main Inner Shell - Strictly fits viewport, with comfortable left and right margins */}
      <div className="relative z-10 w-full h-full max-w-[1400px] mx-auto flex flex-col justify-between px-6 sm:px-12 lg:px-[100px] xl:px-[120px] overflow-hidden">
        {/* Top Header Bar: ~35px from top on desktop */}
        <header className="w-full flex items-start justify-between flex-shrink-0 pt-1 lg:pt-[15px]">
          {/* 1. TOP-LEFT BRANDING */}
          <div>
            <Link href="/" className="inline-block group">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-xl bg-white border border-border/60 shadow-2xs overflow-hidden flex items-center justify-center p-1">
                  <Image
                    src="/logo.png"
                    alt="LedgerOne Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942]">
                    Ledger<span className="text-[#167C80]">One</span>
                  </span>
                  <p className="text-[11px] sm:text-xs text-[#526477] -mt-0.5 font-normal tracking-wide">
                    Enterprise Accounting & Furniture ERP System
                  </p>
                </div>
              </div>
            </Link>
            <div className="w-[40px] h-[3px] bg-[#167C80] rounded-full mt-2" />
          </div>
        </header>

        {/* MAIN CONTENT - Perfectly centered vertically, 0 overflow */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center min-h-0 py-2 sm:py-3 lg:py-4">
          {/* Left Column: Hero Content & Feature Cards */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center space-y-[clamp(12px,2vh,24px)] max-w-xl pr-2">
            {/* Small Eyebrow Text */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#526477] tracking-wider uppercase">
              <span>Simplify</span>
              <span className="text-[#167C80] font-bold">·</span>
              <span>Automate</span>
              <span className="text-[#167C80] font-bold">·</span>
              <span>Grow</span>
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <h1 className="text-[clamp(32px,3.8vw,52px)] font-extrabold tracking-tight leading-[1.08]">
                <span className="text-[#0F2942]">Manage Smarter.</span>
                <br />
                <span className="text-[#167C80]">Grow Faster.</span>
              </h1>
              <p className="text-[clamp(11px,1.3vh,14px)] text-[#526477] leading-relaxed max-w-lg pt-1">
                A comprehensive double-entry accounting and inventory control platform purpose-built for furniture manufacturing and retail enterprises.
              </p>
            </div>

            {/* FEATURE CARDS */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-lg pt-1">
              {/* Card 1: Inventory Tracking */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#DFF4EC] flex items-center justify-center text-[#0D9488] mb-1.5 flex-shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Inventory
                  <br />
                  Tracking
                </span>
              </div>

              {/* Card 2: General Ledger */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#E8F1FC] flex items-center justify-center text-[#1E70B8] mb-1.5 flex-shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  General
                  <br />
                  Ledger
                </span>
              </div>

              {/* Card 3: Vendor & Portal */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#F2ECFD] flex items-center justify-center text-[#7C3AED] mb-1.5 flex-shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Vendor &
                  <br />
                  Portal
                </span>
              </div>

              {/* Card 4: Financial Analytics */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-[#FFF1E6] flex items-center justify-center text-[#EA580C] mb-1.5 flex-shrink-0">
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

          {/* Right Column: 5. LOGIN CARD */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end items-center w-full min-h-0">
            <div className="w-full max-w-[575px] flex justify-center lg:justify-end">
              {children}
            </div>
          </div>
        </div>

        {/* Footer spacer */}
        <div className="flex-shrink-0 h-1 sm:h-2" />
      </div>
    </main>
  );
}
