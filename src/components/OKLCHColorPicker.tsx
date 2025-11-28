import React, { useMemo, useState } from "react";
import { Oklch, formatHex, converter } from "culori";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

const toOklch = converter("oklch");

interface OKLCHColorPickerProps {
  label: string;
  color: string; // HEX color
  onChange: (hex: string) => void;
  mode?: "light" | "dark";
  disabled?: boolean;
  onToggle?: (enabled: boolean) => void; // Added onToggle prop
}

const RECOMMENDED_RANGES = {
  light: { min: 0.45, max: 0.65 },
  dark: { min: 0.65, max: 0.85 },
};

export default function OKLCHColorPicker({
  label,
  color,
  onChange,
  mode = "light",
  disabled = false,
  onToggle, // Destructured onToggle prop
}: OKLCHColorPickerProps) {
  const [hexInput, setHexInput] = useState(color);

  // Derive OKLCH from incoming color prop
  const oklch: Oklch = useMemo(() => {
    const parsed = toOklch(color);
    return parsed || ({ mode: "oklch", l: 0.5, c: 0.15, h: 250 } as Oklch);
  }, [color]);

  const handleLChange = (value: number[]) => {
    const newOklch: Oklch = { ...oklch, l: value[0], mode: "oklch" };
    const hex = formatHex(newOklch);
    onChange(hex);
    setHexInput(hex);
  };

  const handleCChange = (value: number[]) => {
    const newOklch: Oklch = { ...oklch, c: value[0], mode: "oklch" };
    const hex = formatHex(newOklch);
    onChange(hex);
    setHexInput(hex);
  };

  const handleHChange = (value: number[]) => {
    const newOklch: Oklch = { ...oklch, h: value[0], mode: "oklch" };
    const hex = formatHex(newOklch);
    onChange(hex);
    setHexInput(hex);
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexInput(value);

    // Validate HEX format
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      onChange(value);
    }
  };

  const handleHexInputBlur = () => {
    // Reset to current valid color if invalid
    setHexInput(color);
  };

  const l = oklch.l || 0;
  const c = oklch.c || 0;
  const h = oklch.h || 0;

  const range = RECOMMENDED_RANGES[mode];
  const isUnsafeLightness = l < range.min || l > range.max;
  const hex = formatHex(oklch) || "#000000";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">{label}</Label>
          {onToggle && (
            <Switch checked={!disabled} onCheckedChange={onToggle} />
          )}
        </div>
        {!disabled && (
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded shadow-sm ring-1 ring-border"
              style={{ backgroundColor: hex }}
            />
          </div>
        )}
      </div>

      {!disabled && (
        <>
          {/* HEX Input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">HEX Color</Label>
            <Input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              onBlur={handleHexInputBlur}
              placeholder="#000000"
              className="font-mono text-sm"
              disabled={disabled}
            />
          </div>

          {/* Lightness Warning */}
          {isUnsafeLightness && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700 dark:text-amber-400">
                <p className="font-semibold">Check Lightness</p>
                <p>
                  For {mode} mode, recommended lightness is between{" "}
                  {Math.round(range.min * 100)}% and{" "}
                  {Math.round(range.max * 100)}%.
                </p>
              </div>
            </div>
          )}

          {/* Lightness Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Lightness (L)
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                {l.toFixed(2)}
              </span>
            </div>
            <div className="relative">
              {/* Recommended Range Indicators */}
              <div className="absolute -top-6 left-0 right-0 h-8 pointer-events-none">
                {/* Min Marker */}
                <div
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${range.min * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-mono mb-0.5">
                    {range.min}
                  </span>
                  <div className="w-px h-4 bg-green-500 dark:bg-green-400" />
                </div>

                {/* Max Marker */}
                <div
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${range.max * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-mono mb-0.5">
                    {range.max}
                  </span>
                  <div className="w-px h-4 bg-green-500 dark:bg-green-400" />
                </div>
              </div>
              <Slider
                value={[l]}
                onValueChange={handleLChange}
                min={0}
                max={1}
                step={0.01}
                className="relative mt-8"
                disabled={disabled}
              />
            </div>
          </div>

          {/* Chroma Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Chroma (C)
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                {c.toFixed(3)}
              </span>
            </div>
            <Slider
              value={[c]}
              onValueChange={handleCChange}
              min={0}
              max={0.4}
              step={0.001}
              className="relative"
              disabled={disabled}
            />
          </div>

          {/* Hue Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Hue (H)</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {Math.round(h)}°
              </span>
            </div>
            <Slider
              value={[h]}
              onValueChange={handleHChange}
              min={0}
              max={360}
              step={1}
              className="relative"
              disabled={disabled}
            />
          </div>
        </>
      )}
    </div>
  );
}
