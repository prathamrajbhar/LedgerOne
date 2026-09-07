export interface ParsedDimensions {
  length: string;
  width: string;
  height: string;
  unit: string;
}

export function parseDimensions(raw?: string): ParsedDimensions {
  if (!raw) return { length: "", width: "", height: "", unit: "cm" };

  // Pattern matching: e.g. "180cm x 90cm x 75cm" or "180 x 90 x 75 cm" or "180 x 90 x 75 mm" or "72 x 36 x 30 in"
  const unitMatch = raw.match(/(cm|mm|in|ft|m)\b/i);
  const unit = unitMatch ? unitMatch[1].toLowerCase() : "cm";

  // Extract all numbers
  const nums = raw.match(/(\d+(\.\d+)?)/g);
  if (nums && nums.length >= 3) {
    return {
      length: nums[0] || "",
      width: nums[1] || "",
      height: nums[2] || "",
      unit,
    };
  }
  if (nums && nums.length === 2) {
    return {
      length: nums[0] || "",
      width: nums[1] || "",
      height: "",
      unit,
    };
  }
  if (nums && nums.length === 1) {
    return {
      length: nums[0] || "",
      width: "",
      height: "",
      unit,
    };
  }
  return { length: "", width: "", height: "", unit: "cm" };
}

export function formatDimensions(
  length?: string,
  width?: string,
  height?: string,
  unit = "cm",
  fallbackRaw = ""
): string {
  if (length || width || height) {
    const parts: string[] = [];
    if (length) parts.push(`${length}${unit}`);
    if (width) parts.push(`${width}${unit}`);
    if (height) parts.push(`${height}${unit}`);
    return parts.join(" × ");
  }
  return fallbackRaw.trim();
}
