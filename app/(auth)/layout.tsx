import * as React from "react";
import Link from "next/link";
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
        paddingTop: "max(12px, env(safe-area-inset-top))",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
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
      {/* Readability backdrop on smaller screens */}
      <div className="fixed inset-0 w-full h-full bg-white/25 lg:bg-transparent pointer-events-none z-0" />

      {/* Main Inner Shell - Strictly fits viewport */}
      <div className="relative z-10 w-full h-full max-w-[1360px] mx-auto flex flex-col justify-between px-6 sm:px-12 lg:px-20 xl:px-28 overflow-hidden">
        {/* Top Header Bar */}
        <header className="w-full flex items-start justify-between flex-shrink-0 pt-1 lg:pt-2">
          {/* 1. TOP-LEFT BRANDING */}
          <div>
            <Link href="/" className="inline-block group">
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#0F2942]">
                Ledger<span className="text-[#167C80]">One</span>
              </span>
              <p className="text-[10px] sm:text-xs text-[#526477] mt-0.5 font-normal tracking-wide">
                Enterprise Accounting & Furniture ERP System
              </p>
            </Link>
            <div className="w-[36px] sm:w-[40px] h-[2.5px] sm:h-[3px] bg-[#167C80] rounded-full mt-1.5" />
          </div>
        </header>

        {/* MAIN CONTENT - Perfectly centered, 0 overflow */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center min-h-0 py-2 sm:py-3 lg:py-4">
          {/* Left Column: Hero Content & Feature Cards (Responsive clamp scaling) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center space-y-[clamp(10px,1.8vh,24px)] max-w-xl pr-2">
            {/* Small Eyebrow Text */}
            <div className="flex items-center gap-2 text-[clamp(10px,1.1vh,12px)] font-semibold text-[#526477] tracking-wider uppercase">
              <span>Simplify</span>
              <span className="text-[#167C80] font-bold">·</span>
              <span>Automate</span>
              <span className="text-[#167C80] font-bold">·</span>
              <span>Grow</span>
            </div>

            {/* Heading */}
            <div className="space-y-1 sm:space-y-1.5">
              <h1 className="text-[clamp(28px,3.8vw,52px)] font-extrabold tracking-tight leading-[1.08]">
                <span className="text-[#0F2942]">Manage Smarter.</span>
                <br />
                <span className="text-[#167C80]">Grow Faster.</span>
              </h1>
              <p className="text-[clamp(11px,1.25vh,14px)] text-[#526477] leading-relaxed max-w-lg pt-0.5">
                A comprehensive double-entry accounting and inventory control platform purpose-built for furniture manufacturing and retail enterprises.
              </p>
            </div>

            {/* FEATURE CARDS */}
            <div className="grid grid-cols-4 gap-2 xl:gap-3 max-w-lg pt-0.5">
              {/* Card 1: Inventory Tracking */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-[#DFF4EC] flex items-center justify-center text-[#0D9488] mb-1 sm:mb-1.5 flex-shrink-0">
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Inventory
                  <br />
                  Tracking
                </span>
              </div>

              {/* Card 2: General Ledger */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-[#E8F1FC] flex items-center justify-center text-[#1E70B8] mb-1 sm:mb-1.5 flex-shrink-0">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-[#0F2942] leading-tight">
                  General
                  <br />
                  Ledger
                </span>
              </div>

              {/* Card 3: Vendor & Portal */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-[#F2ECFD] flex items-center justify-center text-[#7C3AED] mb-1 sm:mb-1.5 flex-shrink-0">
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Vendor &
                  <br />
                  Portal
                </span>
              </div>

              {/* Card 4: Financial Analytics */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-xl sm:rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-[#FFF1E6] flex items-center justify-center text-[#EA580C] mb-1 sm:mb-1.5 flex-shrink-0">
                  <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Financial
                  <br />
                  Analytics
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: 5. LOGIN CARD */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end items-center w-full min-h-0">
            <div className="w-full max-w-[430px] sm:max-w-[440px] flex justify-center">
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
