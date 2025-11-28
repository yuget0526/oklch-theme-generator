"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface BackgroundColorControlsProps {
  mode: "sync" | "custom";
  hue: number;
  chroma: number;
  primaryHue: number;
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
  primaryHue,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Background Color</Label>
          <p className="text-xs text-muted-foreground">
            {mode === "sync" ? "Synced with Primary hue" : "Custom settings"}
          </p>
        </div>
        <Badge
          variant={mode === "sync" ? "default" : "secondary"}
          className="ml-2"
        >
          {mode === "sync" ? "🔗 Synced" : "Custom"}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="bg-mode" className="text-xs text-muted-foreground">
          {mode === "sync" ? "Sync mode" : "Custom mode"}
        </Label>
        <Switch
          id="bg-mode"
          checked={mode === "custom"}
          onCheckedChange={onModeChange}
        />
      </div>

      {mode === "custom" && (
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">HEX Code</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {currentHex}
              </span>
            </div>
            <Input
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={handleHexBlur}
              placeholder="#RRGGBB"
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Hue (H)</Label>
              <span className="text-xs font-mono text-muted-foreground">
                {Math.round(hue)}°
              </span>
            </div>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[hue]}
              onValueChange={(vals) => onHueChange(vals[0])}
            />
            <p className="text-xs text-muted-foreground">
              Primary: {Math.round(primaryHue)}°
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Chroma (C)
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                {chroma.toFixed(3)}
              </span>
            </div>
            <Slider
              min={0}
              max={0.04}
              step={0.001}
              value={[chroma]}
              onValueChange={(vals) => onChromaChange(vals[0])}
            />
            {chroma > WARNING_THRESHOLD && (
              <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded border border-yellow-200 dark:border-yellow-800">
                <span className="text-yellow-600 dark:text-yellow-400 text-xs">
                  ⚠️
                </span>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  {chroma > MAX_CHROMA
                    ? `Will be adjusted to ${MAX_CHROMA} for readability`
                    : "Exceeds recommended value (≤0.01)"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
