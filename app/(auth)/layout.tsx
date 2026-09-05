import * as React from "react";
import Link from "next/link";
import { Package, FileText, Users, BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-[100dvh] w-full bg-[#F6F8FB] font-sans overflow-x-hidden flex flex-col justify-between">
      {/* Background Graphic */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/auth-bg.png')",
        }}
      />
      {/* Subtle overlay for small screens */}
      <div className="fixed inset-0 w-full h-full bg-white/40 lg:bg-transparent pointer-events-none z-0 backdrop-blur-[1px] lg:backdrop-blur-none" />

      {/* Main Container constrained to standard desktop layout */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto min-h-[100dvh] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14">
        {/* Top Header Bar */}
        <header className="w-full flex items-start justify-between">
          {/* Left: Logo */}
          <div>
            <Link href="/" className="inline-block group">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942]">
                Ledger<span className="text-[#167C80]">One</span>
              </span>
              <p className="text-xs text-[#526477] mt-0.5 font-normal tracking-wide">
                Enterprise Accounting & Furniture ERP System
              </p>
            </Link>
            <div className="w-9 h-[3.5px] bg-[#167C80] rounded-full mt-2" />
          </div>

          {/* Right: Tagline */}
          <div className="hidden sm:block text-right">
            <p className="text-xs font-medium text-[#526477] tracking-tight">Reliable Accounts.</p>
            <p className="text-xs font-medium text-[#526477] tracking-tight">Stronger Businesses.</p>
            <div className="w-6 h-[2.5px] bg-[#167C80] rounded-full ml-auto mt-1" />
          </div>
        </header>

        {/* Content Section: 2 Columns */}
        <div className="my-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center py-6">
          {/* Left Column: 7 cols */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-4 xl:space-y-5 max-w-xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#526477] tracking-wider">
              <span>Simplify</span>
              <span className="text-[#167C80] font-bold">•</span>
              <span>Automate</span>
              <span className="text-[#167C80] font-bold">•</span>
              <span>Grow</span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-[46px] xl:text-[50px] font-extrabold tracking-tight leading-[1.08]">
                <span className="text-[#0F2942]">Manage Smarter.</span>
                <br />
                <span className="text-[#167C80]">Grow Faster.</span>
              </h1>
              <p className="text-xs xl:text-sm text-[#526477] leading-relaxed max-w-md pt-1">
                A comprehensive double-entry accounting and inventory control platform purpose-built for furniture manufacturing and retail enterprises.
              </p>
            </div>

            {/* 4 Feature Cards */}
            <div className="grid grid-cols-4 gap-2.5 xl:gap-3 max-w-lg pt-1">
              {/* Inventory Tracking */}
              <div className="bg-white/95 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-9 w-9 rounded-xl bg-[#DFF4EC] flex items-center justify-center text-[#0D9488] mb-1.5 flex-shrink-0">
                  <Package className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Inventory
                  <br />
                  Tracking
                </span>
              </div>

              {/* General Ledger */}
              <div className="bg-white/95 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-9 w-9 rounded-xl bg-[#E8F1FC] flex items-center justify-center text-[#1E70B8] mb-1.5 flex-shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  General
                  <br />
                  Ledger
                </span>
              </div>

              {/* Vendor & Portal */}
              <div className="bg-white/95 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
                <div className="h-9 w-9 rounded-xl bg-[#F2ECFD] flex items-center justify-center text-[#7C3AED] mb-1.5 flex-shrink-0">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                  Vendor &
                  <br />
                  Portal
                </span>
              </div>

              {/* Financial Analytics */}
              <div className="bg-white/95 backdrop-blur-sm border border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all">
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

            {/* Callout Quote */}
            <div className="border-l-[2.5px] border-[#167C80] pl-3.5 py-1 text-xs text-[#526477] italic leading-relaxed pt-1">
              Everything your furniture business needs,
              <br />
              in one powerful platform.
            </div>
          </div>

          {/* Right Column: 5 cols */}
          <div className="col-span-1 lg:col-span-5 flex justify-center lg:justify-center items-center w-full">
            <div className="w-full max-w-[420px]">
              {children}
            </div>
          </div>
        </div>

        {/* Mobile feature chips */}
        <div className="lg:hidden mt-4 pb-4 flex flex-wrap justify-center items-center gap-2 text-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[10px] font-semibold text-[#0F2942] shadow-xs">
            <Package className="h-3 w-3 text-[#0D9488]" /> Inventory
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[10px] font-semibold text-[#0F2942] shadow-xs">
            <FileText className="h-3 w-3 text-[#1E70B8]" /> General Ledger
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[10px] font-semibold text-[#0F2942] shadow-xs">
            <Users className="h-3 w-3 text-[#7C3AED]" /> Client Portal
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-white/90 text-[10px] font-semibold text-[#0F2942] shadow-xs">
            <BarChart3 className="h-3 w-3 text-[#EA580C]" /> Analytics
          </span>
        </div>

        {/* Bottom spacing */}
        <div className="hidden lg:block h-2" />
      </div>
    </main>
  );
}
