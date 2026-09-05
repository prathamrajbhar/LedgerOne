import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth.config";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { bannerUrl, targetType, targetId } = body;

    if (!bannerUrl || typeof bannerUrl !== "string") {
      return NextResponse.json({ error: "Banner URL is required" }, { status: 400 });
    }

    if (targetType === "contact" || session.user.contactId === targetId) {
      const contactId = targetType === "contact" ? targetId : session.user.contactId;
      if (contactId) {
        await prisma.$executeRawUnsafe(
          `UPDATE "contacts" SET "bannerUrl" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
          bannerUrl,
          contactId
        );
      }

      if (session.user.id) {
        await prisma.$executeRawUnsafe(
          `UPDATE "users" SET "bannerUrl" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
          bannerUrl,
          session.user.id
        );
      }

      revalidatePath("/portal/profile");
      revalidatePath("/portal/dashboard");
    } else {
      const userId = targetId || session.user.id;
      await prisma.$executeRawUnsafe(
        `UPDATE "users" SET "bannerUrl" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
        bannerUrl,
        userId
      );

      // If user has a linked contact, sync contact.bannerUrl
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { contact: { select: { id: true } } },
      });
      if (user?.contact?.id) {
        await prisma.$executeRawUnsafe(
          `UPDATE "contacts" SET "bannerUrl" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
          bannerUrl,
          user.contact.id
        );
      }

      revalidatePath("/profile");
      revalidatePath("/dashboard");
    }

    return NextResponse.json({
      success: true,
      bannerUrl,
      message: "Banner updated successfully",
    });
  } catch (error) {
    console.error("Banner update error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to update banner",
      },
      { status: 500 }
    );
  }
}
