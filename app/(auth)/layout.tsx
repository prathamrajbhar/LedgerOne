import * as React from "react";
import Link from "next/link";
import { Package, FileText, Users, BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-[100dvh] w-full bg-[#F6F8FB] font-sans overflow-x-hidden flex flex-col justify-between selection:bg-[#167C80]/20">
      {/* Existing Background Image - Unmodified, uncropped, no recolor */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/auth-bg.png')",
        }}
      />
      {/* Subtle overlay only on very small screens for readability */}
      <div className="fixed inset-0 w-full h-full bg-white/30 sm:bg-transparent pointer-events-none z-0" />

      {/* Main Content Area */}
      <div className="relative z-10 w-full min-h-[100dvh] flex flex-col justify-between p-6 sm:p-9 lg:px-[80px] lg:pt-[35px] lg:pb-8">
        {/* Top Header Bar */}
        <header className="w-full flex items-start justify-between">
          {/* 1. TOP-LEFT BRANDING */}
          <div>
            <Link href="/" className="inline-block group">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942]">
                Ledger<span className="text-[#167C80]">One</span>
              </span>
              <p className="text-xs text-[#526477] mt-0.5 font-normal tracking-wide">
                Enterprise Accounting & Furniture ERP System
              </p>
            </Link>
            <div className="w-[40px] h-[3px] bg-[#167C80] rounded-full mt-2" />
          </div>

          {/* 2. TOP-RIGHT TAGLINE (~140px from right on wide screens) */}
          <div className="hidden sm:block text-right lg:mr-[60px] xl:mr-[80px]">
            <p className="text-xs font-medium text-[#526477] tracking-tight">Reliable Accounts.</p>
            <p className="text-xs font-medium text-[#526477] tracking-tight">Stronger Businesses.</p>
            <div className="w-[30px] h-[2.5px] bg-[#167C80] rounded-full ml-auto mt-1" />
          </div>
        </header>

        {/* 3 & 4 & 5. MAIN HERO & LOGIN CARD (Centered Vertically) */}
        <div className="my-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-center py-6">
          {/* Left Column: Hero Content & Feature Cards */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-7 flex flex-col space-y-5 max-w-xl">
            {/* Small Eyebrow Text */}
            <div className="flex items-center gap-2 text-xs font-semibold text-[#526477] tracking-wider uppercase">
              <span>Simplify</span>
              <span className="text-[#167C80] font-bold">·</span>
              <span>Automate</span>
              <span className="text-[#167C80] font-bold">·</span>
              <span>Grow</span>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-[44px] lg:text-[48px] xl:text-[52px] font-extrabold tracking-tight leading-[1.08]">
                <span className="text-[#0F2942]">Manage Smarter.</span>
                <br />
                <span className="text-[#167C80]">Grow Faster.</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#526477] leading-relaxed max-w-lg pt-1">
                A comprehensive double-entry accounting and inventory control platform purpose-built for furniture manufacturing and retail enterprises.
              </p>
            </div>

            {/* 4. FEATURE CARDS */}
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 max-w-lg pt-1">
              {/* Card 1: Inventory Tracking */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-9 w-9 rounded-xl bg-[#DFF4EC] flex items-center justify-center text-[#0D9488] mb-1.5 flex-shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Inventory
                  <br />
                  Tracking
                </span>
              </div>

              {/* Card 2: General Ledger */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-9 w-9 rounded-xl bg-[#E8F1FC] flex items-center justify-center text-[#1E70B8] mb-1.5 flex-shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  General
                  <br />
                  Ledger
                </span>
              </div>

              {/* Card 3: Vendor & Portal */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-9 w-9 rounded-xl bg-[#F2ECFD] flex items-center justify-center text-[#7C3AED] mb-1.5 flex-shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Vendor &
                  <br />
                  Portal
                </span>
              </div>

              {/* Card 4: Financial Analytics */}
              <div className="bg-white/90 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-9 w-9 rounded-xl bg-[#FFF1E6] flex items-center justify-center text-[#EA580C] mb-1.5 flex-shrink-0">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Financial
                  <br />
                  Analytics
                </span>
              </div>
            </div>

            {/* Below the cards: Callout Quote */}
            <div className="border-l-[2.5px] border-[#167C80] pl-3.5 py-1 text-xs text-[#526477] italic leading-relaxed pt-1">
              Everything your furniture business needs,
              <br />
              in one powerful platform.
            </div>
          </div>

          {/* Right Column: 5. LOGIN CARD */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end items-center w-full">
            <div className="w-full max-w-[575px]">
              {children}
            </div>
          </div>
        </div>

        {/* Bottom spacing helper */}
        <div className="hidden lg:block h-2" />
      </div>
    </main>
  );
}
