"use client";

import React, { useState, useEffect, useRef } from "react";
import { oklch, formatHex } from "culori";
import {
  Settings2,
  Share2,
  Copy,
  LayoutDashboard,
  Palette,
  Code,
  Menu,
  Moon,
  Sun,
  Dices,
  Coffee,
  Github,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import BackgroundColorControls from "@/components/BackgroundColorControls";
import SimulationControl from "@/components/SimulationControl"; // Import Control
import OKLCHColorPicker from "@/components/OKLCHColorPicker";
import { LightnessChart } from "@/components/LightnessChart";
import { NestedLayerPreview } from "@/components/NestedLayerPreview";
import LayerCountInput from "@/components/LayerCountInput";
import PalettePreview from "@/components/PalettePreview";
import CodeExporter from "@/components/CodeExporter";
import ColorGroupCreator from "@/components/ColorGroupCreator";
import {
  type ChromaGroup,
  generateLayerScale,
  generateBrandColors,
  generateOppositeLayerScale,
  generateRandomPalette,
  ThemeMode,
} from "@/lib/color/color-utils";
import { generateSemanticColors } from "@/lib/color/semantic-colors";
import { SimulationType } from "@/lib/color/simulation"; // Import SimulationType
import NextImage from "next/image";

// ... (existing imports)

// ... (existing imports)
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { useRouter, usePathname } from "@/i18n/routing";
import { useDebouncedCallback } from "use-debounce";

export default function ColorGenerator() {
  const t = useTranslations("ColorGenerator");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initial State from URL
  const [primaryColor, setPrimaryColor] = useState<string>(
    searchParams.get("p") ? `#${searchParams.get("p")}` : "#3b82f6",
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    searchParams.get("s") ? `#${searchParams.get("s")}` : "#059669",
  );
  const [tertiaryColor, setTertiaryColor] = useState<string>(
    searchParams.get("t") ? `#${searchParams.get("t")}` : "#8b5cf6",
  );

  const [showSecondary, setShowSecondary] = useState<boolean>(true);
  const [showTertiary, setShowTertiary] = useState<boolean>(true);

  const [layerCount, setLayerCount] = useState<number>(
    searchParams.get("lc") ? Number(searchParams.get("lc")) : 6,
  );
  const [baseMode, setBaseMode] = useState<ThemeMode>(
    (searchParams.get("m") as ThemeMode) || "light",
  );
  const [layerDirection, setLayerDirection] = useState<"normal" | "inverted">(
    searchParams.get("ld") === "i" ? "inverted" : "normal",
  );

  // Custom lightness... complex to deserialize efficiently from simple params, skipping for now unless critical.

  // Background Color State
  const [bgMode, setBgMode] = useState<"sync" | "custom">(
    searchParams.get("bg") === "c" ? "custom" : "sync",
  );
  const [customBgHue, setCustomBgHue] = useState<number | undefined>(
    searchParams.get("bgh") ? Number(searchParams.get("bgh")) : undefined,
  );
  const [customBgChroma, setCustomBgChroma] = useState<number | undefined>(
    searchParams.get("bgc") ? Number(searchParams.get("bgc")) : undefined,
  );

  const [simulationMode, setSimulationMode] = useState<SimulationType>("none");

  // Sync state to URL with debounce
  const updateUrl = useDebouncedCallback(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Colors (strip #)
    params.set("p", primaryColor.replace("#", ""));
    params.set("s", secondaryColor.replace("#", ""));
    params.set("t", tertiaryColor.replace("#", ""));

    // Toggles (Implied by presence? No, let's look at show states)
    // If we want to hide them, we might need a flag, or just unset the color?
    // But color state is persistent.
    // Let's just sync the colors for now.

    params.set("lc", layerCount.toString());
    params.set("m", baseMode);
    params.set("ld", layerDirection === "inverted" ? "i" : "n");

    if (bgMode === "custom") {
      params.set("bg", "c");
      if (customBgHue !== undefined) params.set("bgh", customBgHue.toString());
      if (customBgChroma !== undefined)
        params.set("bgc", customBgChroma.toString());
    } else {
      params.delete("bg");
      params.delete("bgh");
      params.delete("bgc");
    }

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, 500);

  // Trigger URL update on state change
  useEffect(() => {
    updateUrl();
  }, [
    primaryColor,
    secondaryColor,
    tertiaryColor,
    layerCount,
    baseMode,
    layerDirection,
    bgMode,
    customBgHue,
    customBgChroma,
    updateUrl,
  ]);

  const [customLightness, setCustomLightness] = useState<number[] | undefined>(
    undefined,
  );

  // Manual Color Overrides (variableName -> hex)
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>(
    {},
  );

  const [chromaGroups, setChromaGroups] = useState<ChromaGroup[]>([]);

  // Refs for screenshots/scrolling
  const previewRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Handlers for Background Controls
  const handleBgModeChange = (isCustom: boolean) => {
    setBgMode(isCustom ? "custom" : "sync");
  };

  const handleLayerCountChange = (count: number) => {
    setLayerCount(count);
    // Reset custom lightness when layer count changes
    setCustomLightness(undefined);
  };

  const handleBgHueChange = (hue: number) => {
    setCustomBgHue(hue);
    if (bgMode === "sync") {
      setBgMode("custom");
    }
  };

  const handleBgChromaChange = (chroma: number) => {
    setCustomBgChroma(chroma);
    if (chroma > 0.01) {
      toast.info("High chroma detected", {
        description:
          "Text readability might be affected on high chroma backgrounds.",
      });
    }
    if (bgMode === "sync") {
      setBgMode("custom");
    }
  };

  const handleBgHexChange = (hex: string) => {
    const color = oklch(hex);
    if (!color) return;

    const hue = color.h || 0;
    let chroma = color.c || 0;

    // Validate and correct chroma if necessary
    const MAX_CHROMA = 0.03;
    if (chroma > MAX_CHROMA) {
      toast.info("Chroma adjusted to 0.03 for readability", {
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

  // Derived State - Brand Colors (4 variants)
  const primaryVariants = generateBrandColors(
    primaryColor,
    "primary",
    baseMode,
  );
  const secondaryVariants = showSecondary
    ? generateBrandColors(secondaryColor, "secondary", baseMode)
    : [];
  const tertiaryVariants = showTertiary
    ? generateBrandColors(tertiaryColor, "tertiary", baseMode)
    : [];

  // Derived State - Background color values
  const effectiveBgHue = (() => {
    if (bgMode === "sync") {
      return primaryVariants[0].oklch.h || 0;
    }
    return customBgHue ?? (primaryVariants[0].oklch.h || 0);
  })();

  const effectiveBgChroma = (() => {
    if (bgMode === "sync") {
      // If primary color is achromatic (low chroma), keep background neutral
      const primaryC = primaryVariants[0]?.oklch.c || 0;
      if (primaryC < 0.02) {
        return 0;
      }
      return 0.012;
    }
    return customBgChroma ?? 0.012;
  })();

  // Current background color as HEX
  const currentBgHex = (() => {
    let l = baseMode === "light" ? 0.98 : 0.15;

    // Adjust for inverted direction to ensure background matches the layer stack start
    if (layerDirection === "inverted") {
      // Light Mode Inverted: Start darker (0.92) so layers can get lighter
      // Dark Mode Inverted: Start lighter (0.35) so layers can get darker
      l = baseMode === "light" ? 0.92 : 0.35;
    }

    const bgColor = oklch({
      mode: "oklch",
      l,
      c: effectiveBgChroma,
      h: effectiveBgHue,
    });
    return formatHex(bgColor) || "#FFFFFF";
  })();

  // Derived State - Semantic Colors
  const semanticColors = generateSemanticColors(baseMode, currentBgHex);
  const semanticVariants = Object.values(semanticColors);

  // Derived State - Layer Scales (Backgrounds)
  const layerScales = generateLayerScale(
    effectiveBgHue,
    effectiveBgChroma,
    layerCount,
    baseMode,
    layerDirection,
    customLightness,
  );

  const oppositeMode = baseMode === "light" ? "dark" : "light";

  const oppositeLayerScales = generateOppositeLayerScale(layerScales);

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
  const currentModeOverrides = (() => {
    const resolved: Record<string, string> = {};
    Object.entries(colorOverrides).forEach(([key, value]) => {
      if (key.startsWith(`${baseMode}:`)) {
        resolved[key.split(":")[1]] = value;
      }
    });
    return resolved;
  })();

  const oppositeModeOverrides = (() => {
    const resolved: Record<string, string> = {};
    Object.entries(colorOverrides).forEach(([key, value]) => {
      if (key.startsWith(`${oppositeMode}:`)) {
        resolved[key.split(":")[1]] = value;
      }
    });
    return resolved;
  })();

  // Calculate current lightness values for the chart
  const currentLightnessValues = layerScales.map((l) => l.oklch.l || 0);

  const handleModeChange = (mode: ThemeMode) => {
    // When switching modes, we want to set the current input color
    // to the color that was generated for that mode.

    const targetVariantName = mode === "light" ? "light" : "dark";

    const newPrimary = primaryVariants.find(
      (v) => v.name === targetVariantName,
    )?.hex;
    const newSecondary = secondaryVariants.find(
      (v) => v.name === targetVariantName,
    )?.hex;
    const newTertiary = tertiaryVariants.find(
      (v) => v.name === targetVariantName,
    )?.hex;

    if (newPrimary) setPrimaryColor(newPrimary);
    if (newSecondary) setSecondaryColor(newSecondary);
    if (newTertiary) setTertiaryColor(newTertiary);

    setBaseMode(mode);
    setCustomLightness(undefined);
  };

  const sidebarProps = {
    baseMode,
    layerCount,
    setLayerCount: handleLayerCountChange,
    layerDirection,
    setLayerDirection,
    primaryColor,
    setPrimaryColor,
    secondaryColor,
    setSecondaryColor,
    tertiaryColor,
    setTertiaryColor,
    showSecondary,
    setShowSecondary,
    showTertiary,
    setShowTertiary,
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
    simulationMode,
    setSimulationMode,
  };

  const handleRandomize = () => {
    const palette = generateRandomPalette(currentBgHex);
    setPrimaryColor(palette.primary);
    setSecondaryColor(palette.secondary);
    setTertiaryColor(palette.tertiary);
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
            <div className="flex items-center gap-2 lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-ml-2"
                    aria-label={t("menu")}
                  >
                    <Menu size={20} />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                  <SidebarContent {...sidebarProps} />
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <CopyLinkButton />
            </div>

            <TabsList>
              <TabsTrigger value="preview" className="space-x-2">
                <LayoutDashboard size={16} />
                <span>{t("preview")}</span>
              </TabsTrigger>
              <TabsTrigger value="palette" className="space-x-2">
                <Palette size={16} />
                <span>{t("palette")}</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="space-x-2">
                <Code size={16} />
                <span>{t("export")}</span>
              </TabsTrigger>
            </TabsList>

            <div className="hidden lg:flex items-center gap-2">
              <SimulationControl
                simulationMode={simulationMode}
                onSimulationChange={setSimulationMode}
                variant="header"
              />
              <LocaleSwitcher />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRandomize}
                title={t("randomize")}
                aria-label={t("randomize")}
              >
                <Dices size={20} />
              </Button>
              <CopyLinkButton />
              <BuyMeACoffeeButton />
              <ShareButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  handleModeChange(baseMode === "light" ? "dark" : "light")
                }
                title={`Switch to ${
                  baseMode === "light" ? "dark" : "light"
                } mode`}
                aria-label={t("themeSwitch")}
              >
                {baseMode === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  window.open(
                    "https://github.com/gigaptera/oklch-theme-generator",
                    "_blank",
                  )
                }
                title="GitHub"
                aria-label="GitHub"
              >
                <Github size={20} />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <TabsContent
              value="preview"
              className="absolute inset-0 m-0 h-full w-full animate-in fade-in duration-300 overflow-y-auto"
            >
              <div className="min-h-full w-full" ref={previewRef}>
                <NestedLayerPreview
                  layers={activeLayers}
                  primary={primaryVariants}
                  secondary={secondaryVariants}
                  tertiary={tertiaryVariants}
                  mode={baseMode}
                  backgroundColor={currentBgHex}
                  overrides={currentModeOverrides}
                  simulationMode={simulationMode}
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
                    <span>{t("activeTheme", { mode: baseMode })}</span>
                  </h2>
                  <div className="space-y-8">
                    <PalettePreview
                      role="primary"
                      variants={primaryVariants.filter((v) =>
                        v.name.startsWith(baseMode),
                      )}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                      simulationMode={simulationMode}
                    />
                    <PalettePreview
                      role="secondary"
                      variants={secondaryVariants.filter((v) =>
                        v.name.startsWith(baseMode),
                      )}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                    />
                    <PalettePreview
                      role="tertiary"
                      variants={tertiaryVariants.filter((v) =>
                        v.name.startsWith(baseMode),
                      )}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                    />
                    <PalettePreview
                      role="layers"
                      layers={activeLayers}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                    />
                    <Separator className="col-span-full" />
                    <PalettePreview
                      role="semantic"
                      variants={semanticVariants}
                      overrides={currentModeOverrides}
                      onOverride={handleOverride}
                    />
                    <PalettePreview
                      role="semantic" // Helper to map type "semantic" to "primary" or just use "semantic" if PalettePreview supports it?
                      // Wait, PalettePreview props: role is "primary" | "secondary" | "tertiary" | "layers".
                      // I need to update PalettePreview types or cast/fake it.
                      // Let's check PalettePreview types first. Assuming I can extend it or use "primary" label for now but customized?
                      // Actually, let's just use "primary" as a fallback if types are strict, but better to update types.
                      // For now, let's look at PalettePreview.tsx next.
                      // I'll assume for this step I add it, and if it errors I fix PalettePreview.
                      // But wait, "semantic" is not a valid role in current types.
                      // I'll use "primary" for now to pass type check and change label via title if possible?
                      // No, role controls the label.
                      // I'll skip adding this block in this tool call and check/update PalettePreview first.
                      // So I will only do the first edit.
                    />
                  </div>
                </section>

                <section className="opacity-75">
                  <h2 className="text-2xl font-bold mb-6 flex items-center space-x-2">
                    <span>{t("oppositeTheme", { mode: oppositeMode })}</span>
                  </h2>
                  <div className="space-y-8">
                    <PalettePreview
                      role="primary"
                      variants={primaryVariants.filter((v) =>
                        v.name.startsWith(oppositeMode),
                      )}
                      overrides={oppositeModeOverrides}
                      onOverride={(v, h) => {
                        const key = `${oppositeMode}:${v}`;
                        setColorOverrides((prev) => ({ ...prev, [key]: h }));
                      }}
                    />
                    <PalettePreview
                      role="secondary"
                      variants={secondaryVariants.filter((v) =>
                        v.name.startsWith(oppositeMode),
                      )}
                      overrides={oppositeModeOverrides}
                      onOverride={(v, h) => {
                        const key = `${oppositeMode}:${v}`;
                        setColorOverrides((prev) => ({ ...prev, [key]: h }));
                      }}
                    />
                    <PalettePreview
                      role="tertiary"
                      variants={tertiaryVariants.filter((v) =>
                        v.name.startsWith(oppositeMode),
                      )}
                      overrides={oppositeModeOverrides}
                      onOverride={(v, h) => {
                        const key = `${oppositeMode}:${v}`;
                        setColorOverrides((prev) => ({ ...prev, [key]: h }));
                      }}
                    />
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
                    <h2 className="text-2xl font-bold mb-6">
                      {t("chromaGroups")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {chromaGroups.map((group) => (
                        <div
                          key={group.id}
                          className="p-4 bg-card rounded-lg border shadow-sm"
                        >
                          <h3 className="font-bold mb-3 text-sm">
                            {group.name}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {group.colors.map((c, i) => (
                              <div key={i} className="flex flex-col space-y-1">
                                <span className="text-[10px] font-mono text-muted-foreground">
                                  Hue {Math.round(c.hue)}°
                                </span>
                                <div className="flex space-x-0.5">
                                  {c.variants.map((v, j) => (
                                    <div
                                      key={j}
                                      className="w-6 h-6 rounded-sm shadow-sm ring-1 ring-border/50"
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
  showSecondary: boolean;
  setShowSecondary: (show: boolean) => void;
  showTertiary: boolean;
  setShowTertiary: (show: boolean) => void;
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
  showSecondary,
  setShowSecondary,
  showTertiary,
  setShowTertiary,
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
  const t = useTranslations("ColorGenerator");
  // Determine chart range based on mode
  const chartMin = baseMode === "light" ? 0.8 : 0.0;
  const chartMax = baseMode === "light" ? 1.0 : 0.6;

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 px-6 border-b flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <NextImage
            src="/gigaptera_logo_hue.svg"
            alt="Gigaptera Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <h1 className="font-bold text-lg tracking-tight">a11yPalette</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6 space-y-6">
          <section className="space-y-4">
            <h2 className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Settings2 size={16} />
              <span>{t("configuration")}</span>
            </h2>
            <LayerCountInput value={layerCount} onChange={setLayerCount} />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none">
                  {t("lightnessCurve")}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setCustomLightness(undefined)}
                >
                  {t("reset")}
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
                  {t("invertLayers")}
                </label>
                <p className="text-xs text-muted-foreground">
                  {layerDirection === "normal"
                    ? t("lightToDark")
                    : t("darkToLight")}
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
            <h2 className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <Palette size={16} />
              <span>{t("brandColors")}</span>
            </h2>
            <div className="space-y-6">
              <OKLCHColorPicker
                label="Primary"
                color={primaryColor}
                onChange={setPrimaryColor}
                backgroundHex={currentBgHex}
              />
              <OKLCHColorPicker
                label="Secondary"
                color={secondaryColor}
                onChange={setSecondaryColor}
                disabled={!showSecondary}
                onToggle={setShowSecondary}
                backgroundHex={currentBgHex}
              />
              <OKLCHColorPicker
                label="Tertiary"
                color={tertiaryColor}
                onChange={setTertiaryColor}
                disabled={!showTertiary}
                onToggle={setShowTertiary}
                backgroundHex={currentBgHex}
              />
            </div>
          </section>

          <Separator />

          <section className="space-y-4 pb-6">
            <h2 className="flex items-center space-x-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <span>{t("chromaGroups")}</span>
            </h2>
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

const CopyLinkButton = () => {
  const t = useTranslations("ColorGenerator");
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopyLink}
      title={t("copyLink")}
      aria-label={t("copyLink")}
    >
      <Copy size={20} />
    </Button>
  );
};

const ShareButton = () => {
  const t = useTranslations("ColorGenerator");
  const handleShare = async () => {
    // Basic share implementation, extend as needed
    if (navigator.share) {
      try {
        await navigator.share({
          title: "a11yPalette",
          text: "Check out this accessible color palette!",
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      toast.info("Sharing not supported on this browser");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      title={t("share")}
      aria-label={t("share")}
    >
      <Share2 size={20} />
    </Button>
  );
};

const BuyMeACoffeeButton = () => {
  const t = useTranslations("ColorGenerator");
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() =>
        window.open("https://www.buymeacoffee.com/gigaptera", "_blank")
      }
      title={t("buyMeACoffee")}
      aria-label={t("buyMeACoffee")}
      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-500 dark:hover:text-amber-400 dark:hover:bg-amber-950/30"
    >
      <Coffee size={20} />
    </Button>
  );
};
