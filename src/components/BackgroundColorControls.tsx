"use client";

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("BackgroundColorControls");
  const MAX_CHROMA = 0.03;
  const WARNING_THRESHOLD = 0.02;

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

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleHexBlur();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Preview */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium">{t("title")}</Label>
          <div className="flex items-center gap-2">
            <Switch
              id="bg-mode"
              checked={mode === "custom"}
              onCheckedChange={onModeChange}
            />
            <Label
              htmlFor="bg-mode"
              className="text-xs text-muted-foreground font-normal cursor-pointer"
            >
              {mode === "sync" ? t("syncMode") : t("customMode")}
            </Label>
          </div>
        </div>
        <div
          className="w-8 h-8 rounded shadow-sm ring-1 ring-border transition-colors duration-200"
          style={{ backgroundColor: currentHex }}
          aria-label="Background color preview"
        />
      </div>

      {mode === "sync" && (
        <div className="space-y-3">
          <div className="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground flex items-center gap-2">
            <span>🔗</span>
            {t("syncMessage")}
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onModeChange(true)}
          >
            🎨 {t("customBackgroundButton")}
          </Button>
        </div>
      )}

      {mode === "custom" && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* HEX Input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              {t("hexColor")}
            </Label>
            <Input
              value={hexInput}
              onChange={(e) => setHexInput(e.target.value)}
              onBlur={handleHexBlur}
              onKeyDown={handleHexKeyDown}
              placeholder="#RRGGBB"
              className="font-mono text-sm"
            />
          </div>

          {/* Chroma Slider (C) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t("chroma")}
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                {chroma.toFixed(3)}
              </span>
            </div>
            <Slider
              min={0}
              max={0.05}
              step={0.001}
              value={[chroma]}
              onValueChange={(vals) => onChromaChange(vals[0])}
              className="relative"
            />
            {chroma > WARNING_THRESHOLD && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md mt-2">
                <span className="text-amber-600 dark:text-amber-500 text-xs mt-0.5">
                  ⚠️
                </span>
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-semibold mb-1">{t("chromaAdjusted")}</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    {chroma > MAX_CHROMA
                      ? t("chromaCapped", { max: MAX_CHROMA })
                      : t("chromaExceeds")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hue Slider (H) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                {t("hue")}
              </Label>
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
              className="relative"
            />
          </div>
        </div>
      )}
    </div>
  );
}
