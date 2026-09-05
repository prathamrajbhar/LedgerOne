import { NextRequest, NextResponse } from "next/server";
import { companySettingsService } from "@/lib/services/company-settings.service";

export async function GET() {
  try {
    const settings = await companySettingsService.get();
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const updated = await companySettingsService.update(data);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update settings" },
      { status: 400 }
    );
  }
}
