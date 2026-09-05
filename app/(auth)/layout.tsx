import * as React from "react";
import Link from "next/link";
import { Package, FileText, Users, BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full flex flex-col lg:flex-row items-stretch bg-[#F6F8FB] overflow-x-hidden font-sans">
      {/* Clean Background Graphic (Office scene with desk, plant, art, and natural lighting - NO baked-in text) */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none z-0"
        style={{
          backgroundImage: "url('/auth-bg.png')",
        }}
      />

      {/* Left Column: Real Accessible Typography, Brand Header, Value Proposition & Feature Cards */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14 lg:max-w-[50%] lg:min-h-screen">
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
          <div className="w-10 h-1 bg-[#167C80] rounded-full mt-3.5" />
        </div>

        {/* Center Hero Copy & 4 Feature Icons */}
        <div className="my-8 lg:my-auto space-y-6 max-w-lg">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#0F2942] tracking-tight leading-[1.14]">
              Manage Smarter.
              <br />
              <span className="text-[#0F2942]">Grow Faster.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5568] leading-relaxed max-w-md">
              A complete accounting and business management solution designed for modern furniture enterprises.
            </p>
          </div>

          {/* 4 Feature Pills / Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full h-24">
              <div className="h-9 w-9 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1.5 flex-shrink-0">
                <Package className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Inventory
                <br />
                Management
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full h-24">
              <div className="h-9 w-9 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1.5 flex-shrink-0">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Accounting
                <br />
                & Finance
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full h-24">
              <div className="h-9 w-9 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1.5 flex-shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Team
                <br />
                Collaboration
              </span>
            </div>

            <div className="bg-white/95 backdrop-blur-md border border-white/80 shadow-[0_4px_16px_rgba(0,0,0,0.05)] rounded-2xl p-3 flex flex-col items-center justify-center text-center hover:-translate-y-0.5 transition-all w-full h-24">
              <div className="h-9 w-9 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-[#16324F] mb-1.5 flex-shrink-0">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-semibold text-[#0F2942] leading-tight">
                Insightful
                <br />
                Reports
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Left Quote */}
        <div className="hidden lg:block pt-4">
          <p className="text-xs italic text-[#4A5568] font-medium leading-relaxed">
            &ldquo;Accurate records.
            <br />
            A stronger tomorrow.&rdquo;
          </p>
          <div className="w-8 h-0.5 bg-[#167C80] rounded-full mt-2" />
        </div>
      </div>

      {/* Right Column: Built for Furniture Businesses, Floating Auth Card, and Footer */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-6 sm:p-8 lg:p-12 lg:max-w-[50%] lg:min-h-screen">
        {/* Top Right Tag */}
        <div className="hidden lg:flex items-center justify-end gap-2 text-xs font-medium text-[#526477]">
          <span>Built for Furniture Businesses</span>
          <span className="w-6 h-0.5 bg-[#167C80] rounded-full inline-block" />
        </div>

        {/* Main Floating Auth Card Container placed at exact center-right */}
        <div className="my-auto py-4 flex justify-center lg:justify-start lg:pl-6">
          <div className="w-full max-w-[435px]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-[#64748B] space-y-0.5 pt-4">
          <p>© 2026 LedgerOne. All rights reserved.</p>
          <p className="text-[10px] text-[#64748B]/80">
            Accurate records. A stronger tomorrow.
          </p>
        </div>
      </div>
    </main>
  );
}
