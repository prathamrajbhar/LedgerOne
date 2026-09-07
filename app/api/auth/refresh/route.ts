import { NextRequest, NextResponse } from "next/server";
import { refreshTokenService } from "@/lib/services/refresh-token.service";
import { UnauthorizedError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawToken = body?.refreshToken as string | undefined;

    if (!rawToken || typeof rawToken !== "string") {
      return NextResponse.json(
        { success: false, error: "Refresh token is required" },
        { status: 400 }
      );
    }

    const rotated = await refreshTokenService.rotateRefreshToken(rawToken);

    return NextResponse.json({
      success: true,
      refreshToken: rotated.rawToken,
      expiresAt: rotated.expiresAt.toISOString(),
      familyId: rotated.familyId,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to rotate token" },
      { status: 500 }
    );
  }
}
