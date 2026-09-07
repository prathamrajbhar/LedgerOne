"use client";

import * as React from "react";
import { Layers, Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormInput } from "@/components/forms/form-input";

interface ProductDimensionsFieldsetProps {
  material: string;
  onMaterialChange: (val: string) => void;
  length: string;
  onLengthChange: (val: string) => void;
  width: string;
  onWidthChange: (val: string) => void;
  height: string;
  onHeightChange: (val: string) => void;
  dimensionUnit: string;
  onDimensionUnitChange: (unit: string) => void;
}

export function ProductDimensionsFieldset({
  material,
  onMaterialChange,
  length,
  onLengthChange,
  width,
  onWidthChange,
  height,
  onHeightChange,
  dimensionUnit,
  onDimensionUnitChange,
}: ProductDimensionsFieldsetProps) {
  const combinedDimension = [
    length ? `${length}${dimensionUnit}` : null,
    width ? `${width}${dimensionUnit}` : null,
    height ? `${height}${dimensionUnit}` : null,
  ]
    .filter(Boolean)
    .join(" × ");

  return (
    <Card className="bg-white border-border shadow-card rounded-2xl overflow-hidden">
      <CardHeader className="p-5 sm:p-6 bg-surface-subtle/50 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-[#E3F3F3] text-[#167C80] flex items-center justify-center">
            <Layers className="h-3.5 w-3.5 text-[#167C80]" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Material & Physical Specifications
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Provide dimensional and material details for furniture craftsmanship.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div>
          <FormInput
            label="Material / Finish"
            value={material}
            onChange={(e) => onMaterialChange(e.target.value)}
            placeholder="e.g. Solid Teak Wood + Natural Matte PU Finish"
            helperText="Primary wood species, upholstery fabric, metal grade, or paint finish."
          />
        </div>

        <div className="p-4 rounded-xl border border-border/80 bg-[#F9FAFB]/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-teal/10 text-teal flex items-center justify-center">
                <Ruler className="h-3.5 w-3.5 text-teal" />
              </div>
              <label className="text-xs font-semibold text-foreground">
                Physical Dimensions (Individual Parameters)
              </label>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Unit:</span>
              <select
                value={dimensionUnit}
                onChange={(e) => onDimensionUnitChange(e.target.value)}
                aria-label="Dimension Unit"
                className="h-7 px-2 text-xs font-semibold rounded-md border border-border bg-white text-foreground focus:outline-hidden focus:ring-1 focus:ring-navy cursor-pointer"
              >
                <option value="cm">cm (Centimeters)</option>
                <option value="mm">mm (Millimeters)</option>
                <option value="in">in (Inches)</option>
                <option value="ft">ft (Feet)</option>
                <option value="m">m (Meters)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormInput
              label={`Length (${dimensionUnit})`}
              type="number"
              min="0"
              step="0.1"
              value={length}
              onChange={(e) => onLengthChange(e.target.value)}
              placeholder="e.g. 180"
            />

            <FormInput
              label={`Width / Depth (${dimensionUnit})`}
              type="number"
              min="0"
              step="0.1"
              value={width}
              onChange={(e) => onWidthChange(e.target.value)}
              placeholder="e.g. 90"
            />

            <FormInput
              label={`Height (${dimensionUnit})`}
              type="number"
              min="0"
              step="0.1"
              value={height}
              onChange={(e) => onHeightChange(e.target.value)}
              placeholder="e.g. 75"
            />
          </div>

          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-border text-xs">
            <span className="text-[11px] text-muted-foreground">Combined Dimension:</span>
            <span className="font-mono font-semibold text-foreground">
              {combinedDimension || (
                <span className="text-muted-foreground/60 italic font-sans text-[11px]">
                  Enter L × W × H parameters above
                </span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
