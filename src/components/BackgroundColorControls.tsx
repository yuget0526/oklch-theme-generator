"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

interface BackgroundColorControlsProps {
  mode: "sync" | "custom";
  hue: number;
  chroma: number;
  currentHex: string;
  onModeChange: (isCustom: boolean) => void;
  onHueChange: (hue: number) => void;
  onChromaChange: (chroma: number) => void;
  onHexChange: (hex: string) => void;
}

export default function BackgroundColorControls({
  mode,
  hue,
  chroma,
  currentHex,
  onModeChange,
  onHueChange,
  onChromaChange,
  onHexChange,
}: BackgroundColorControlsProps) {
  const MAX_CHROMA = 0.01;
  const WARNING_THRESHOLD = 0.01;

  const [hexInput, setHexInput] = useState(currentHex);

  useEffect(() => {
    setHexInput(currentHex);
  }, [currentHex]);

  const handleHexBlur = () => {
    // Validate HEX format
    const hexPattern = /^#?[0-9A-F]{6}$/i;
    if (hexPattern.test(hexInput)) {
      const normalizedHex = hexInput.startsWith("#")
        ? hexInput
        : `#${hexInput}`;
      onHexChange(normalizedHex);
    } else {
      // Revert to current valid value
      setHexInput(currentHex);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Preview */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-base font-semibold">Background Color</Label>
          <div className="flex items-center gap-2">
            <Switch
              id="bg-mode"
              checked={mode === "custom"}
              onCheckedChange={onModeChange}
              className="scale-75 origin-left"
            />
            <Label
              htmlFor="bg-mode"
              className="text-xs text-muted-foreground font-normal cursor-pointer"
            >
              {mode === "sync" ? "Sync mode" : "Custom mode"}
            </Label>
          </div>
        </div>
        <div
          className="w-12 h-12 rounded-lg shadow-sm border border-border transition-colors duration-200"
          style={{ backgroundColor: currentHex }}
          aria-label="Background color preview"
        />
      </div>

      {mode === "sync" && (
        <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground flex items-center gap-2">
          <span>🔗</span>
          Synced with Primary hue (Chroma: 0.008)
        </div>
      )}

      {mode === "custom" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* HEX Input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              HEX Color
            </Label>
            <Input
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={handleHexBlur}
              placeholder="#RRGGBB"
              className="font-mono text-base h-10 bg-background"
            />
          </div>

          {/* Chroma Slider (C) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Chroma (C)</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {chroma.toFixed(3)}
              </span>
            </div>
            <Slider
              min={0}
              max={0.04}
              step={0.001}
              value={[chroma]}
              onValueChange={(vals) => onChromaChange(vals[0])}
              className="py-1"
            />
            {chroma > WARNING_THRESHOLD && (
              <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800 text-xs">
                <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                <p className="text-yellow-700 dark:text-yellow-300">
                  {chroma > MAX_CHROMA
                    ? `Will be adjusted to ${MAX_CHROMA}`
                    : "Exceeds recommended value (≤0.01)"}
                </p>
              </div>
            )}
          </div>

          {/* Hue Slider (H) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Hue (H)</Label>
              <span className="text-sm font-mono text-muted-foreground">
                {Math.round(hue)}°
              </span>
            </div>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[hue]}
              onValueChange={(vals) => onHueChange(vals[0])}
              className="py-1"
            />
            <div
              className="h-2 w-full rounded-full opacity-20 mt-1"
              style={{
                background: `linear-gradient(to right, 
                  oklch(0.6 0.2 0), oklch(0.6 0.2 60), oklch(0.6 0.2 120), 
                  oklch(0.6 0.2 180), oklch(0.6 0.2 240), oklch(0.6 0.2 300), oklch(0.6 0.2 360))`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
