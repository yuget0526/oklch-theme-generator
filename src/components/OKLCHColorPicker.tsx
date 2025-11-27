import React, { useMemo, useState } from "react";
import { Oklch, formatHex, converter } from "culori";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

const toOklch = converter("oklch");

interface OKLCHColorPickerProps {
  label: string;
  color: string; // HEX color
  onChange: (hex: string) => void;
}

export default function OKLCHColorPicker({
  label,
  color,
  onChange,
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

  const isLightnessOutOfRange = l < 0.4 || l > 0.7;
  const hex = formatHex(oklch) || "#000000";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded shadow-sm ring-1 ring-border"
            style={{ backgroundColor: hex }}
          />
        </div>
      </div>

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
        />
      </div>

      {/* Lightness Warning */}
      {isLightnessOutOfRange && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <p className="font-semibold mb-1">
              Lightness outside recommended range
            </p>
            <p className="text-amber-700 dark:text-amber-300">
              For optimal visibility in both light and dark modes, consider
              adjusting lightness to 0.4-0.7 range.
            </p>
          </div>
        </div>
      )}

      {/* Lightness Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Lightness (L)</Label>
          <span className="text-xs font-mono text-muted-foreground">
            {l.toFixed(2)}
          </span>
        </div>
        <div className="relative">
          {/* Ruler markers at recommended range */}
          <div className="absolute -top-6 left-0 right-0 h-8 flex items-end">
            {/* 0.4 marker */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: "40%" }}
            >
              <span className="text-[10px] text-green-600 dark:text-green-400 font-mono mb-0.5">
                0.4
              </span>
              <div className="w-px h-4 bg-green-500 dark:bg-green-400" />
            </div>
            {/* 0.7 marker */}
            <div
              className="absolute flex flex-col items-center"
              style={{ left: "70%" }}
            >
              <span className="text-[10px] text-green-600 dark:text-green-400 font-mono mb-0.5">
                0.7
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
          />
        </div>
      </div>

      {/* Chroma Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Chroma (C)</Label>
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
        />
      </div>
    </div>
  );
}
