import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth.config";
import { s3StorageClient } from "@/lib/storage/s3-client";
import { UserRole } from "@prisma/client";

// Maximum upload size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Restrict product image uploads strictly to ADMINISTRATOR
    if (session.user.role !== UserRole.ADMINISTRATOR) {
      return NextResponse.json(
        { error: "Forbidden: Only administrators can upload product images" },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

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

    // Upload to S3 bucket in products folder
    const uploadedUrl = await s3StorageClient.uploadFile({
      file: buffer,
      fileName: safeName,
      mimeType: file.type,
      folder: "products",
    });

    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      message: "Product image uploaded successfully",
    });
  } catch (error) {
    console.error("Product image upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload product image to S3",
      },
      { status: 500 }
    );
  }
}
