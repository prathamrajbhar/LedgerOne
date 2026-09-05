import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth.config";
import { s3StorageClient } from "@/lib/storage/s3-client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Maximum upload size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const targetType = (formData.get("targetType") as string) || "user"; // "user" or "contact"
    const targetId = (formData.get("targetId") as string) || session.user.id;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Sanitize filename
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Upload to S3 bucket in profile-photos folder
    const uploadedUrl = await s3StorageClient.uploadFile({
      file: buffer,
      fileName: safeName,
      mimeType: file.type,
      folder: "profile-photos",
    });

    if (targetType === "contact" || session.user.contactId === targetId) {
      // Update contact profile image
      const contactId = targetType === "contact" ? targetId : session.user.contactId;
      if (contactId) {
        await prisma.contact.update({
          where: { id: contactId },
          data: { profileImage: uploadedUrl },
        });
      }

      // Also update linked user avatar if exists
      if (session.user.id) {
        await prisma.$executeRawUnsafe(
          `UPDATE "users" SET "avatarUrl" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
          uploadedUrl,
          session.user.id
        );
      }

      revalidatePath("/portal/profile");
      revalidatePath("/portal/dashboard");
    } else {
      // Update workspace user avatar
      const userId = targetId || session.user.id;
      await prisma.$executeRawUnsafe(
        `UPDATE "users" SET "avatarUrl" = $1, "updatedAt" = NOW() WHERE "id" = $2`,
        uploadedUrl,
        userId
      );

      // If user has a linked contact, update contact.profileImage as well
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { contact: { select: { id: true } } },
      });
      if (user?.contact?.id) {
        await prisma.contact.update({
          where: { id: user.contact.id },
          data: { profileImage: uploadedUrl },
        });
      }

      revalidatePath("/profile");
      revalidatePath("/dashboard");
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      message: "Profile photo uploaded successfully",
    });
  } catch (error) {
    console.error("Profile photo upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload profile photo to S3",
      },
      { status: 500 }
    );
  }
}
