"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface BackgroundColorControlsProps {
  mode: "sync" | "custom";
  hue: number;
  chroma: number;
  primaryHue: number;
  onModeChange: (isCustom: boolean) => void;
  onHueChange: (hue: number) => void;
  onChromaChange: (chroma: number) => void;
}

export default function BackgroundColorControls({
  mode,
  hue,
  chroma,
  primaryHue,
  onModeChange,
  onHueChange,
  onChromaChange,
}: BackgroundColorControlsProps) {
  const MAX_CHROMA = 0.01;
  const WARNING_THRESHOLD = 0.01;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Background Color</Label>
          <p className="text-xs text-muted-foreground">
            {mode === "sync" ? "Primaryの色相と同期" : "カスタム設定"}
          </p>
        </div>
        <Badge
          variant={mode === "sync" ? "default" : "secondary"}
          className="ml-2"
        >
          {mode === "sync" ? "🔗 同期中" : "カスタム"}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="bg-mode" className="text-xs text-muted-foreground">
          {mode === "sync" ? "Syncモード" : "Customモード"}
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
                    ? `可読性のため${MAX_CHROMA}に調整されます`
                    : "推奨値(0.01以下)を超えています"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
