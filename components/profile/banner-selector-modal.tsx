"use client";

import * as React from "react";
import { Check, Image as ImageIcon, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PROFILE_BANNER_PRESETS, ProfileBannerPreset } from "@/lib/constants/profile-banners";

interface BannerSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBannerUrl?: string | null;
  onSelectBanner: (bannerUrl: string) => Promise<void>;
  loading?: boolean;
}

export function BannerSelectorModal({
  open,
  onOpenChange,
  currentBannerUrl,
  onSelectBanner,
  loading = false,
}: BannerSelectorModalProps) {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>(
    currentBannerUrl || null
  );

  React.useEffect(() => {
    setSelectedPreset(currentBannerUrl || null);
  }, [currentBannerUrl]);

  const handleApply = async () => {
    if (selectedPreset) {
      await onSelectBanner(selectedPreset);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-6 rounded-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="pb-3 border-b border-border">
          <DialogTitle className="text-lg font-bold text-navy flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal" />
            Select Profile Banner
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Choose from the top 15 high-definition enterprise banners hosted on S3 storage.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {PROFILE_BANNER_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.url;
              return (
                <div
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.url)}
                  className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "border-teal ring-2 ring-teal/30 shadow-md scale-[1.01]"
                      : "border-border hover:border-teal/50 hover:shadow-sm"
                  }`}
                >
                  <div className="h-24 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-teal text-white flex items-center justify-center shadow-xs">
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5 bg-white flex items-center justify-between">
                    <span className="text-xs font-semibold text-navy truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono px-1.5 py-0.5 rounded bg-surface-subtle">
                      HD
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            15 Curated S3 Enterprise Banners
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              disabled={loading || !selectedPreset}
              className="bg-teal hover:bg-teal/90 text-white text-xs font-semibold gap-1.5"
            >
              {loading ? "Saving..." : "Apply Banner"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
