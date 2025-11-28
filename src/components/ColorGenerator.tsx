"use client";

import React, { useState, useMemo } from "react";
import { oklch, formatHex } from "culori";
import { LightnessChart } from "@/components/LightnessChart";
import {
  ThemeMode,
  ChromaGroup,
  generateBrandColors,
  generateLayerScale,
  generateOppositeLayerScale,
} from "@/lib/color/color-utils";
import OKLCHColorPicker from "./OKLCHColorPicker";
import LayerCountInput from "./LayerCountInput";
import PalettePreview from "./PalettePreview";
import ColorGroupCreator from "./ColorGroupCreator";
import CodeExporter from "./CodeExporter";
import NestedLayerPreview from "@/components/NestedLayerPreview";
import ShareButton from "@/components/ShareButton";
import {
  LayoutDashboard,
  Palette,
  Code,
  Settings2,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import BackgroundColorControls from "@/components/BackgroundColorControls";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

export default function ColorGenerator() {
  // State
  const [primaryColor, setPrimaryColor] = useState<string>("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState<string>("#10b981");
  const [tertiaryColor, setTertiaryColor] = useState<string>("#f43f5e");

  const [layerCount, setLayerCount] = useState<number>(5);
  const [baseMode, setBaseMode] = useState<ThemeMode>("light");
  const [layerDirection, setLayerDirection] = useState<"normal" | "inverted">(
    "normal"
  );
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>(
    {}
  );

  const [chromaGroups, setChromaGroups] = useState<ChromaGroup[]>([]);
  const [customLightness, setCustomLightness] = useState<number[] | undefined>(
    undefined
  );

  // Background color state
  const [bgMode, setBgMode] = useState<"sync" | "custom">("sync");
  const [customBgHue, setCustomBgHue] = useState<number | null>(null);
  const [customBgChroma, setCustomBgChroma] = useState<number | null>(null);

  // Handlers with reset logic
  const handleLayerCountChange = (count: number) => {
    setLayerCount(count);
    setCustomLightness(undefined);
  };

  const handleModeChange = (mode: ThemeMode) => {
    setBaseMode(mode);
    setCustomLightness(undefined);
  };

  const handleDirectionChange = (dir: "normal" | "inverted") => {
    setLayerDirection(dir);
    setCustomLightness(undefined);
  };

  // Background color validation
  const validateChroma = (chroma: number): number => {
    const MAX_CHROMA = 0.01;
    if (chroma > MAX_CHROMA) {
      toast.info("Chroma adjusted to 0.01 for readability", {
        description: "Background chroma was too high",
      });
      return MAX_CHROMA;
    }
    return chroma;
  };

  // Background color handlers
  const handleBgModeChange = (isCustom: boolean) => {
    if (isCustom) {
      // Switch to Custom mode
      setCustomBgHue(primaryVariants[0].oklch.h || 0);
      setCustomBgChroma(0.008);
      setBgMode("custom");
    } else {
      // Switch to Sync mode
      setCustomBgHue(null);
      setCustomBgChroma(null);
      setBgMode("sync");
    }
  };

  const handleBgHueChange = (hue: number) => {
    setCustomBgHue(hue);
    if (bgMode === "sync") {
      setBgMode("custom");
    }
  };

  const handleBgChromaChange = (chroma: number) => {
    const validated = validateChroma(chroma);
    setCustomBgChroma(validated);
    if (bgMode === "sync") {
      setBgMode("custom");
    }
  };

  const handleBgHexChange = (hex: string) => {
    // Convert HEX to OKLCH
    const color = oklch(hex);
    if (!color) return;

    const hue = color.h || 0;
    let chroma = color.c || 0;

    // Validate and correct chroma if necessary
    const MAX_CHROMA = 0.01;
    if (chroma > MAX_CHROMA) {
      toast.info("Chroma adjusted to 0.01 for readability", {
        description: `Hue (${Math.round(hue)}°) preserved, chroma corrected`,
      });
      chroma = MAX_CHROMA;
    }

    // Update both hue and chroma
    setCustomBgHue(hue);
    setCustomBgChroma(chroma);

    if (bgMode === "sync") {
      setBgMode("custom");
    }
  };

  // Derived State - Brand Colors (3 variants)
  const primaryVariants = useMemo(
    () => generateBrandColors(primaryColor, "primary"),
    [primaryColor]
  );

  const secondaryVariants = useMemo(
    () => generateBrandColors(secondaryColor, "secondary"),
    [secondaryColor]
  );

  const tertiaryVariants = useMemo(
    () => generateBrandColors(tertiaryColor, "tertiary"),
    [tertiaryColor]
  );

  // Derived State - Background color values
  const effectiveBgHue = useMemo(() => {
    if (bgMode === "sync") {
      return primaryVariants[0].oklch.h || 0;
    }
    return customBgHue ?? (primaryVariants[0].oklch.h || 0);
  }, [bgMode, customBgHue, primaryVariants]);

  const effectiveBgChroma = useMemo(() => {
    if (bgMode === "sync") {
      return 0.008;
    }
    return customBgChroma ?? 0.008;
  }, [bgMode, customBgChroma]);

  // Current background color as HEX
  const currentBgHex = useMemo(() => {
    const bgColor = oklch({
      mode: "oklch",
      l: baseMode === "light" ? 0.98 : 0.15,
      c: effectiveBgChroma,
      h: effectiveBgHue,
    });
    return formatHex(bgColor) || "#FFFFFF";
  }, [effectiveBgHue, effectiveBgChroma, baseMode]);

  // Derived State - Layer Scales (Backgrounds)
  const layerScales = useMemo(
    () =>
      generateLayerScale(
        effectiveBgHue,
        effectiveBgChroma,
        layerCount,
        baseMode,
        layerDirection,
        customLightness
      ),
    [
      effectiveBgHue,
      effectiveBgChroma,
      layerCount,
      baseMode,
      layerDirection,
      customLightness,
    ]
  );

  const oppositeMode = baseMode === "light" ? "dark" : "light";

  const oppositeLayerScales = useMemo(
    () => generateOppositeLayerScale(layerScales),
    [layerScales]
  );

  // Layer scales are mode-aware (Backgrounds need to flip)
  const activeLayers = layerScales;
  const inactiveLayers = oppositeLayerScales;

  // Handlers
  const handleAddChromaGroup = (group: ChromaGroup) => {
    setChromaGroups([...chromaGroups, group]);
  };

  const handleRemoveChromaGroup = (id: string) => {
    setChromaGroups(chromaGroups.filter((g) => g.id !== id));
  };

  const handleOverride = (variableName: string, hex: string) => {
    // Scope overrides by mode so they don't leak between Light/Dark
    const key = `${baseMode}:${variableName}`;
    setColorOverrides((prev) => ({ ...prev, [key]: hex }));
  };

  // Helper to get overrides for the current view
  const currentModeOverrides = useMemo(() => {
    const resolved: Record<string, string> = {};
    Object.entries(colorOverrides).forEach(([key, value]) => {
      if (key.startsWith(`${baseMode}:`)) {
        resolved[key.split(":")[1]] = value;
      }
    });
    return resolved;
  }, [colorOverrides, baseMode]);

  const oppositeModeOverrides = useMemo(() => {
    const resolved: Record<string, string> = {};
    Object.entries(colorOverrides).forEach(([key, value]) => {
      if (key.startsWith(`${oppositeMode}:`)) {
        resolved[key.split(":")[1]] = value;
      }
    });
    return resolved;
  }, [colorOverrides, oppositeMode]);

  // Calculate current lightness values for the chart
  const currentLightnessValues = useMemo(
    () => layerScales.map((l) => l.oklch.l || 0),
    [layerScales]
  );

  const sidebarProps = {
    baseMode,
    layerCount,
    setLayerCount: handleLayerCountChange,
    layerDirection,
    setLayerDirection: handleDirectionChange,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    tertiaryColor,
    setTertiaryColor,
    chromaGroups,
    handleAddChromaGroup,
    handleRemoveChromaGroup,
    currentLightnessValues,
    setCustomLightness,
    // Background color props
    bgMode,
    effectiveBgHue,
    effectiveBgChroma,
    currentBgHex,
    handleBgModeChange,
    handleBgHueChange,
    handleBgChromaChange,
    handleBgHexChange,
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r bg-card flex-shrink-0 h-full overflow-hidden">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Tabs defaultValue="preview" className="flex-1 flex flex-col h-full">
          <header className="h-16 border-b bg-card flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="-ml-2">
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <SidebarContent {...sidebarProps} />
                </SheetContent>
              </Sheet>
            </div>

            <TabsList>
              <TabsTrigger value="preview" className="space-x-2">
                <LayoutDashboard size={16} />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="palette" className="space-x-2">
                <Palette size={16} />
                <span>Palette</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="space-x-2">
                <Code size={16} />
                <span>Export</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <ShareButton targetRef={previewRef} />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleModeChange(baseMode === "light" ? "dark" : "light")
                }
                title="テーマ切り替え"
              >
                {baseMode === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <TabsContent
              value="preview"
              className="absolute inset-0 m-0 h-full w-full animate-in fade-in duration-300"
            >
              <div ref={previewRef} className="h-full w-full">
                <NestedLayerPreview
                  layers={activeLayers}
                  primary={primaryVariants}
                  secondary={secondaryVariants}
                  tertiary={tertiaryVariants}
                  mode={baseMode}
                  overrides={currentModeOverrides}
                />
              </div>
            </TabsContent>

            <TabsContent
              value="palette"
              className="absolute inset-0 m-0 h-full w-full overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300"
            >
              <div
                ref={paletteRef}
                className="max-w-6xl mx-auto pb-20 space-y-12"
              >
                <section>
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                    <span>Active Theme ({baseMode})</span>
                  </h2>
                  <div className="space-y-8">
                    <PalettePreview
                      role="primary"
                      variants={primaryVariants}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                    />
                    <PalettePreview
                      role="secondary"
                      variants={secondaryVariants}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                    />
                    <PalettePreview
                      role="tertiary"
                      variants={tertiaryVariants}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                    />
                    <PalettePreview
                      role="layers"
                      layers={activeLayers}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                    />
                  </div>
                </section>

                <section className="opacity-75">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                    <span>Opposite Theme ({oppositeMode})</span>
                  </h2>
                  <div className="space-y-8">
                    {/* 
                      For Opposite Theme, we only show Layers because Brand Colors are shared.
                      If the user edits a color here, they are editing the OPPOSITE mode.
                    */}
                    <PalettePreview
                      role="layers"
                      layers={inactiveLayers}
                      overrides={oppositeModeOverrides}
                      onOverride={(v, h) => {
                        const key = `${oppositeMode}:${v}`;
                        setColorOverrides((prev) => ({ ...prev, [key]: h }));
                      }}
                    />
                  </div>
                </section>

                {chromaGroups.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold mb-6">Chroma Groups</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {chromaGroups.map((group) => (
                        <div
                          key={group.id}
                          className="p-6 bg-card rounded-xl border shadow-sm"
                        >
                          <h3 className="font-bold mb-4">{group.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            {group.colors.map((c, i) => (
                              <div key={i} className="flex flex-col space-y-2">
                                <span className="text-xs font-mono text-muted-foreground">
                                  Hue {Math.round(c.hue)}°
                                </span>
                                <div className="flex space-x-1">
                                  {c.variants.map((v, j) => (
                                    <div
                                      key={j}
                                      className="w-8 h-8 rounded shadow-sm ring-1 ring-border"
                                      style={{ backgroundColor: v.hex }}
                                      title={v.name}
                                    />
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </TabsContent>

            <TabsContent
              value="code"
              className="absolute inset-0 m-0 h-full w-full overflow-y-auto p-4 md:p-8 animate-in fade-in duration-300"
            >
              <div className="max-w-6xl mx-auto">
                <CodeExporter
                  primary={primaryVariants}
                  secondary={secondaryVariants}
                  tertiary={tertiaryVariants}
                  layers={activeLayers}
                  primaryOpposite={primaryVariants}
                  secondaryOpposite={secondaryVariants}
                  tertiaryOpposite={tertiaryVariants}
                  layersOpposite={inactiveLayers}
                  chromaGroups={chromaGroups}
                  baseMode={baseMode}
                  overrides={colorOverrides} // Pass raw overrides
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

interface SidebarContentProps {
  baseMode: ThemeMode;
  layerCount: number;
  setLayerCount: (count: number) => void;
  layerDirection: "normal" | "inverted";
  setLayerDirection: (dir: "normal" | "inverted") => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  tertiaryColor: string;
  setTertiaryColor: (color: string) => void;
  chromaGroups: ChromaGroup[];
  handleAddChromaGroup: (group: ChromaGroup) => void;
  handleRemoveChromaGroup: (id: string) => void;
  currentLightnessValues: number[];
  setCustomLightness: (values: number[] | undefined) => void;
  // Background color props
  bgMode: "sync" | "custom";
  effectiveBgHue: number;
  effectiveBgChroma: number;
  currentBgHex: string;
  handleBgModeChange: (isCustom: boolean) => void;
  handleBgHueChange: (hue: number) => void;
  handleBgChromaChange: (chroma: number) => void;
  handleBgHexChange: (hex: string) => void;
}

function SidebarContent({
  baseMode,
  layerCount,
  setLayerCount,
  layerDirection,
  setLayerDirection,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  tertiaryColor,
  setTertiaryColor,
  chromaGroups,
  handleAddChromaGroup,
  handleRemoveChromaGroup,
  currentLightnessValues,
  setCustomLightness,
  // Background color props
  bgMode,
  effectiveBgHue,
  effectiveBgChroma,
  currentBgHex,
  handleBgModeChange,
  handleBgHueChange,
  handleBgChromaChange,
  handleBgHexChange,
}: SidebarContentProps) {
  // Determine chart range based on mode
  const chartMin = baseMode === "light" ? 0.8 : 0.0;
  const chartMax = baseMode === "light" ? 1.0 : 0.6;

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 px-6 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
            O
          </div>
          <span className="font-bold text-lg tracking-tight">OKLCH Gen</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6 space-y-6">
          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Settings2 size={16} />
              <span>Configuration</span>
            </div>
            <LayerCountInput value={layerCount} onChange={setLayerCount} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">
                  Lightness Curve
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setCustomLightness(undefined)}
                >
                  Reset
                </Button>
              </div>
              <LightnessChart
                values={currentLightnessValues}
                onChange={setCustomLightness}
                min={chartMin}
                max={chartMax}
              />
            </div>

            <BackgroundColorControls
              mode={bgMode}
              hue={effectiveBgHue}
              chroma={effectiveBgChroma}
              currentHex={currentBgHex}
              onModeChange={handleBgModeChange}
              onHueChange={handleBgHueChange}
              onChromaChange={handleBgChromaChange}
              onHexChange={handleBgHexChange}
            />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Invert Layers
                </label>
                <p className="text-xs text-muted-foreground">
                  {layerDirection === "normal"
                    ? "Light to Dark"
                    : "Dark to Light"}
                </p>
              </div>
              <Switch
                checked={layerDirection === "inverted"}
                onCheckedChange={(checked) =>
                  setLayerDirection(checked ? "inverted" : "normal")
                }
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Palette size={16} />
              <span>Brand Colors</span>
            </div>
            <div className="space-y-6">
              <OKLCHColorPicker
                label="Primary"
                color={primaryColor}
                onChange={setPrimaryColor}
              />
              <OKLCHColorPicker
                label="Secondary"
                color={secondaryColor}
                onChange={setSecondaryColor}
              />
              <OKLCHColorPicker
                label="Tertiary"
                color={tertiaryColor}
                onChange={setTertiaryColor}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-4 pb-6">
            <div className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Chroma Groups</span>
            </div>
            <ColorGroupCreator onAdd={handleAddChromaGroup} />
            <div className="space-y-2">
              {chromaGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded border"
                >
                  <span className="text-sm font-medium">{group.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveChromaGroup(group.id)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
