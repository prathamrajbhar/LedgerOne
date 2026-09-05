"use client";

import * as React from "react";
import { Sparkles, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AiFileUploaderProps {
  onParsedData: (data: unknown) => void;
  parseAction: (formData: FormData) => Promise<{ success: boolean; data?: unknown; error?: string }>;
  label?: string;
  accept?: string;
  description?: string;
}

export function AiFileUploader({
  onParsedData,
  parseAction,
  label = "Auto-Fill with AI Document Scan",
  accept = "image/*,application/pdf",
  description = "Upload invoice PDF, vendor bill, or receipt image to auto-populate form inputs",
}: AiFileUploaderProps) {
  const [isScanning, setIsScanning] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const [fileName, setFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setIsScanning(true);

    const formData = new FormData();
    formData.append("file", file);

    const toastId = toast.loading(`AI is scanning "${file.name}" and extracting data...`);

    try {
      const res = await parseAction(formData);

      if (!res.success || !res.data) {
        toast.error(res.error || "Failed to parse document", { id: toastId });
        setIsScanning(false);
        return;
      }

      toast.success("Document analyzed! Form fields have been auto-filled.", { id: toastId });
      onParsedData(res.data);
    } catch {
      toast.error("An error occurred while uploading document", { id: toastId });
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border-2 border-dashed p-4 text-center transition-all ${
        dragActive
          ? "border-indigo-500 bg-indigo-50/60"
          : "border-indigo-200/80 bg-gradient-to-r from-indigo-50/40 via-blue-50/30 to-purple-50/30 hover:border-indigo-300"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        disabled={isScanning}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            {isScanning ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900">{label}</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                AI Vision
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {fileName && !isScanning ? (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="h-3 w-3" /> Auto-filled from: {fileName}
                </span>
              ) : (
                description
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-2xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
        >
          {isScanning ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <UploadCloud className="h-3.5 w-3.5" />
              Upload PDF or Image
            </>
          )}
        </button>
      </div>
    </div>
  );
}
