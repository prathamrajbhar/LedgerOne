import * as React from "react";
import Link from "next/link";
import { Package, FileText, Users, BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-[100dvh] w-full flex flex-col justify-between bg-[#F6F8FB] font-sans overflow-x-hidden">
      {/* Background Graphic */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/auth-bg.png')",
        }}
      />
      {/* Subtle overlay for small screens */}
      <div className="fixed inset-0 w-full h-full bg-white/40 lg:bg-transparent pointer-events-none z-0 backdrop-blur-[1px] lg:backdrop-blur-none" />

      {/* Top Header Bar: Logo on Left, Tagline on Right */}
      <header className="relative z-10 w-full pt-6 sm:pt-8 px-6 sm:px-12 lg:px-16 xl:px-20 flex items-start justify-between">
        {/* Left Branding */}
        <div>
          <Link href="/" className="inline-block group">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2942]">
              Ledger<span className="text-[#167C80]">One</span>
            </span>
            <p className="text-xs text-[#526477] mt-0.5 font-normal tracking-wide">
              Enterprise Accounting & Furniture ERP System
            </p>
          </Link>
          <div className="w-9 h-[3.5px] bg-[#167C80] rounded-full mt-2.5" />
        </div>

        {/* Right Tagline (Visible on md/lg screens, exact match with reference image) */}
        <div className="hidden sm:block text-right">
          <p className="text-xs font-medium text-[#526477] tracking-tight">Reliable Accounts.</p>
          <p className="text-xs font-medium text-[#526477] tracking-tight">Stronger Businesses.</p>
          <div className="w-6 h-[2.5px] bg-[#167C80] rounded-full ml-auto mt-1" />
        </div>
      </header>

      {/* Main Body: 2 Columns on Desktop */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 lg:px-16 xl:px-20 py-6 lg:py-4">
        {/* Left Column: Eyebrow, Headline, Description, 4 Colored Cards, Callout Quote */}
        <div className="hidden lg:flex flex-col justify-center space-y-5 xl:space-y-6 max-w-xl w-full pr-6 xl:pr-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 text-xs font-medium text-[#526477] tracking-wider">
            <span>Simplify</span>
            <span className="text-[#167C80] font-bold">•</span>
            <span>Automate</span>
            <span className="text-[#167C80] font-bold">•</span>
            <span>Grow</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl lg:text-[44px] xl:text-[48px] font-extrabold tracking-tight leading-[1.08]">
              <span className="text-[#0F2942]">Manage Smarter.</span>
              <br />
              <span className="text-[#167C80]">Grow Faster.</span>
            </h1>
            <p className="text-xs xl:text-sm text-[#526477] leading-relaxed max-w-md pt-1">
              A comprehensive double-entry accounting and inventory control platform purpose-built for furniture manufacturing and retail enterprises.
            </p>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-4 gap-2.5 xl:gap-3 max-w-md pt-1">
            {/* Inventory Tracking - Mint */}
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

            {/* General Ledger - Blue */}
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

            {/* Vendor & Portal - Purple */}
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

            {/* Financial Analytics - Orange */}
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

          {/* Quote Callout with Left Teal Border */}
          <div className="border-l-[2.5px] border-[#167C80] pl-3.5 py-1 text-xs text-[#526477] italic leading-relaxed pt-1">
            Everything your furniture business needs,
            <br />
            in one powerful platform.
          </div>
        </div>

        {/* Right Column: Centered Floating Auth Card */}
        <div className="flex-1 flex justify-center lg:justify-end items-center w-full py-4 sm:py-6">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>
      </div>

      {/* Empty bottom spacer for balance */}
      <div className="hidden lg:block h-6" />
    </main>
  );
}
