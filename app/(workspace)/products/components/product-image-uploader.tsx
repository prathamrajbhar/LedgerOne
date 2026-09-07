"use client";

import * as React from "react";
import Image from "next/image";
import { Upload, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ProductImageUploaderProps {
  image: string;
  productName: string;
  onImageChange: (url: string) => void;
}

export function ProductImageUploader({
  image,
  productName,
  onImageChange,
}: ProductImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = React.useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      toast.error("Invalid file format. Please upload JPG, PNG, WEBP or GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds 5MB limit.");
      return;
    }

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/products/upload", {
        method: "POST",
        body: data,
      });

      const resJson = await res.json();
      if (!res.ok || !resJson.success) {
        throw new Error(resJson.error || "Failed to upload image");
      }

      onImageChange(resJson.url);
      toast.success("Product image uploaded to S3 successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload product image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
      <CardHeader className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-teal/10 text-teal flex items-center justify-center">
              <ImageIcon className="h-3.5 w-3.5 text-teal" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-foreground">
                Product Image (Admin Only)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Upload a high-resolution catalog photo stored securely in AWS S3.
              </CardDescription>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider bg-teal/10 text-teal px-2 py-0.5 rounded-full border border-teal/20">
            Admin Access
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleImageFileChange}
        />

        {image ? (
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-border/80 bg-[#F9FAFB]">
            <div className="relative h-28 w-28 rounded-xl overflow-hidden border border-border bg-white flex-shrink-0 shadow-sm group">
              <Image
                src={image}
                alt={productName || "Product image"}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <div className="space-y-2 flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold text-foreground break-all line-clamp-1">
                {image.split("/").pop()}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Image uploaded and linked to this product. It will be showcased in the catalog and product details.
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs h-8 gap-1.5 cursor-pointer"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Upload className="h-3.5 w-3.5" />
                  )}
                  Change Photo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => onImageChange("")}
                  className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => !uploadingImage && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-teal/50 hover:bg-teal-light/20 transition-all cursor-pointer ${
              uploadingImage ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-teal-light text-teal flex items-center justify-center mb-3">
              {uploadingImage ? (
                <Loader2 className="h-6 w-6 animate-spin text-teal" />
              ) : (
                <Upload className="h-6 w-6 text-teal" />
              )}
            </div>
            <p className="text-xs font-semibold text-foreground">
              {uploadingImage ? "Uploading to S3..." : "Click to upload product image"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Supported formats: JPEG, PNG, WEBP, GIF (Max size 5MB)
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
