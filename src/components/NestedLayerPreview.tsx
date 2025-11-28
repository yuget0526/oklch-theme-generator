import React from "react";
import { ColorVariant, LayerScale, ThemeMode } from "@/lib/color/color-utils";
import ContrastBadge from "./ContrastBadge";

interface NestedLayerPreviewProps {
  layers: LayerScale[];
  primary: ColorVariant[];
  secondary: ColorVariant[];
  tertiary: ColorVariant[];
  mode: ThemeMode;
  backgroundColor: string;
  overrides?: Record<string, string>;
}

// Helper for Layer Header
const LayerHeader = ({
  label,
  layer,
}: {
  label: string;
  layer: { hex: string; onHex: string };
}) => (
  <div className="flex justify-between items-center mb-6 opacity-50 text-[10px] font-bold tracking-widest uppercase">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-current" />
      {label}
    </div>
    <div className="flex items-center gap-3">
      <span className="font-mono">{layer.hex}</span>
      <ContrastBadge
        bgColor={layer.hex}
        fgColor={layer.onHex}
        className="scale-90 origin-right"
      />
    </div>
  </div>
);

// Helper for Variant Column
const VariantColumn = ({
  title,
  variants,
  mainColor,
  resolveColor,
  mode,
  bgColor,
  fgColor,
}: {
  title: string;
  variants: ColorVariant[];
  mainColor: string;
  resolveColor: (
    v: ColorVariant
  ) => ColorVariant & { hex: string; onHex: string };
  mode: ThemeMode;
  bgColor?: string;
  fgColor?: string;
}) => (
  <div
    className={`flex-1 p-6 rounded-2xl ${
      !bgColor ? "bg-black/5 dark:bg-white/5" : ""
    }`}
    style={{
      backgroundColor: bgColor,
      color: fgColor,
    }}
  >
    <h3
      className="text-center font-bold text-lg mb-1"
      style={{ color: mainColor }}
    >
      {title}
    </h3>
    <p className="text-center text-xs opacity-50 mb-6">Color Variants</p>
    <div className="space-y-3">
      {variants
        .filter((v) => v.name.startsWith(mode))
        .map((v) => {
          const resolved = resolveColor(v);
          // Display name: "light" -> "Main", "light-variant" -> "Variant"
          const displayName =
            v.name.replace(mode, "").replace("-", "") || "Main";

          return (
            <div
              key={v.name}
              className="flex items-center justify-between px-4 py-3 rounded-lg text-xs font-medium shadow-sm"
              style={{ backgroundColor: resolved.hex, color: resolved.onHex }}
            >
              <span className="capitalize">
                {displayName === "variant" ? "Variant" : "Main"}
              </span>
              <ContrastBadge
                bgColor={resolved.hex}
                fgColor={resolved.onHex}
                className="scale-75 origin-right"
              />
            </div>
          );
        })}
    </div>
  </div>
);

// Recursive Layer Component
const RecursiveLayer = ({
  layers,
  depth = 0,
  children,
}: {
  layers: { name: string; hex: string; onHex: string }[];
  depth?: number;
  children: React.ReactNode;
}) => {
  if (layers.length === 0) {
    return <>{children}</>;
  }

  const [currentLayer, ...remainingLayers] = layers;
  const isLast = remainingLayers.length === 0;

  // Dynamic styles based on depth
  const getLayerStyle = (d: number) => {
    // Unify padding to p-4 sm:p-6 for all layers to ensure consistent spacing
    const baseStyle =
      "w-full shadow-sm transition-colors duration-300 flex flex-col p-4 sm:p-6 pb-0";

    if (d === 0) return `${baseStyle} max-w-7xl rounded-t-3xl`;
    if (d === 1) return `${baseStyle} rounded-t-3xl flex-1`;
    if (d === 2) return `${baseStyle} rounded-t-2xl flex-1`;
    // Default for deeper layers
    return "w-full rounded-t-xl p-4 sm:p-6 shadow-sm transition-colors duration-300 flex-1";
  };

  return (
    <div
      className={getLayerStyle(depth)}
      style={{ backgroundColor: currentLayer.hex, color: currentLayer.onHex }}
    >
      <LayerHeader label={currentLayer.name} layer={currentLayer} />
      {isLast ? (
        children
      ) : (
        <RecursiveLayer layers={remainingLayers} depth={depth + 1}>
          {children}
        </RecursiveLayer>
      )}
    </div>
  );
};

export function NestedLayerPreview({
  layers,
  primary,
  secondary,
  tertiary,
  mode,
  backgroundColor,
  overrides = {},
}: NestedLayerPreviewProps) {
  const resolveColor = (variant: ColorVariant | undefined) => {
    if (!variant)
      return {
        hex: "#000000",
        onHex: "#FFFFFF",
        variableName: "",
        onVariableName: "",
        name: "",
        role: "",
        oklch: { mode: "oklch" as const, l: 0, c: 0, h: 0 },
      };
    const hex = overrides[variant.variableName] || variant.hex;
    const onHex = overrides[variant.onVariableName] || variant.onHex;
    return { ...variant, hex, onHex };
  };

  const resolveLayer = (layer: LayerScale | undefined) => {
    if (!layer)
      return {
        hex: "#FFFFFF",
        onHex: "#000000",
        variableName: "",
        onVariableName: "",
        name: "",
        role: "",
      };
    const hex = overrides[layer.variableName] || layer.hex;
    const onHex = overrides[layer.onVariableName] || layer.onHex;
    return { ...layer, hex, onHex };
  };

  // Extract variants for current mode (for buttons)
  const pMain = resolveColor(primary.find((v) => v.name === mode));

  // Resolve all layers
  const resolvedLayers = layers.map(resolveLayer);

  // Create background layer
  // We use the first layer's onHex as a fallback for text color if needed,
  // though typically the background layer should have its own contrast color calculated.
  // For now, using resolvedLayers[0].onHex is a reasonable approximation if we don't have a specific one.
  const bgLayer = {
    name: "BACKGROUND",
    hex: backgroundColor,
    onHex: resolvedLayers[0]?.onHex || "#000000",
  };

  // Split layers:
  // - containerLayers: All layers except the last one (used for the nested container structure)
  // - cardLayer: The last layer (used for the content cards/variants)
  // This ensures the cards have a distinct background from the container they sit in.
  // We also prepend the main background layer to the container layers.
  const layersForContainer =
    resolvedLayers.length > 1 ? resolvedLayers.slice(0, -1) : resolvedLayers;
  const containerLayers = [bgLayer, ...layersForContainer];

  const cardLayer =
    resolvedLayers.length > 1
      ? resolvedLayers[resolvedLayers.length - 1]
      : resolvedLayers[0];

  return (
    <div className="w-full min-h-full p-6 transition-colors duration-300 flex flex-col items-center">
      <RecursiveLayer layers={containerLayers}>
        {/* Main Content */}
        <div className="text-center space-y-6 max-w-2xl mx-auto mb-16">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{ color: pMain.hex }}
          >
            Nested Layers
          </h1>
          <p className="text-lg opacity-70 leading-relaxed">
            This preview demonstrates how the generated background layers create
            depth and hierarchy in your interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Filled Button */}
            <div className="relative group">
              <button
                className="pl-6 pr-32 py-3 rounded-lg font-semibold shadow-sm transition-transform active:scale-95 flex items-center h-12"
                style={{ backgroundColor: pMain.hex, color: pMain.onHex }}
              >
                Get Started
              </button>
              <div className="absolute top-1/2 -translate-y-1/2 right-3">
                <ContrastBadge bgColor={pMain.hex} fgColor={pMain.onHex} />
              </div>
            </div>

            {/* Outlined Button */}
            <div className="relative group">
              <button
                className="pl-6 pr-32 py-3 rounded-lg font-semibold border-2 transition-transform active:scale-95 flex items-center h-12"
                style={{
                  borderColor: pMain.hex,
                  color: pMain.hex,
                  backgroundColor: "transparent",
                }}
              >
                Learn More
              </button>
              <div className="absolute top-1/2 -translate-y-1/2 right-3">
                <ContrastBadge bgColor={cardLayer.hex} fgColor={pMain.hex} />
              </div>
            </div>
          </div>
        </div>

        {/* Color Variants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <VariantColumn
            title="Primary"
            variants={primary}
            mainColor={pMain.hex}
            resolveColor={resolveColor}
            mode={mode}
            bgColor={cardLayer.hex}
            fgColor={cardLayer.onHex}
          />
          {secondary.length > 0 && (
            <VariantColumn
              title="Secondary"
              variants={secondary}
              mainColor={resolveColor(secondary[0]).hex}
              resolveColor={resolveColor}
              mode={mode}
              bgColor={cardLayer.hex}
              fgColor={cardLayer.onHex}
            />
          )}
          {tertiary.length > 0 && (
            <VariantColumn
              title="Tertiary"
              variants={tertiary}
              mainColor={resolveColor(tertiary[0]).hex}
              resolveColor={resolveColor}
              mode={mode}
              bgColor={cardLayer.hex}
              fgColor={cardLayer.onHex}
            />
          )}
        </div>
      </RecursiveLayer>
    </div>
  );
}
