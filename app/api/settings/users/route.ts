import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/lib/services/user.service";

export async function GET() {
  try {
    const users = await userService.list();
    return NextResponse.json({ data: users });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const newUser = await userService.create(data);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 400 }
    );
  }
}
