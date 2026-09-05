import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";

export async function POST(request: NextRequest) {
  try {
    const { contactId, email } = await request.json();
    const result = await userService.inviteContact(contactId, email);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to invite contact" },
      { status: 400 }
    );
  }
}
