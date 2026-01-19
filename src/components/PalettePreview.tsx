import React, { useState } from "react";
import { ColorVariant, LayerScale } from "@/lib/color/color-utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { Edit2, Copy, Check, AlertTriangle } from "lucide-react";
import {
  SimulationType,
  simulateColorBlindness,
  isDistinguishable,
} from "@/lib/color/simulation";

interface PalettePreviewProps {
  role: string;
  variants?: ColorVariant[];
  layers?: LayerScale[];
  overrides?: Record<string, string>;
  onOverride?: (variableName: string, hex: string) => void;
  simulationMode?: SimulationType;
}

export default function PalettePreview({
  role,
  variants,
  layers,
  overrides = {},
  onOverride,
  simulationMode = "none",
}: PalettePreviewProps) {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const handleColorChange = (variableName: string, newHex: string) => {
    if (onOverride) {
      onOverride(variableName, newHex);
    }
  };

  const copyToClipboard = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (layers) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium capitalize">{role} Scale</h3>
          <span className="text-xs text-muted-foreground">
            {layers.length} steps
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {layers.map((layer) => {
            const hex = overrides[layer.variableName] || layer.hex;
            const onHex = overrides[layer.onVariableName] || layer.onHex;
            const isCopied = copiedHex === hex;

            const displayHex = simulateColorBlindness(hex, simulationMode);
            const displayOnHex = simulateColorBlindness(onHex, simulationMode);

            const hasConflict =
              simulationMode !== "none" &&
              !isDistinguishable(displayHex, displayOnHex);

            return (
              <Popover key={layer.step}>
                <PopoverTrigger asChild>
                  <div
                    className="group relative flex flex-col p-4 rounded-xl shadow-sm transition-all duration-200 hover:scale-110 hover:z-10 hover:shadow-xl ring-1 ring-border cursor-pointer"
                    style={{ backgroundColor: displayHex, color: displayOnHex }}
                  >
                    {hasConflict && (
                      <div
                        className="absolute top-1 right-1 text-red-500 bg-white/80 rounded-full p-0.5"
                        title="Low contrast in simulation"
                      >
                        <AlertTriangle size={12} />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold opacity-50 capitalize">
                        {layer.name}
                      </span>
                      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </div>
                    <div className="mt-auto space-y-1">
                      <div
                        className="flex items-center gap-1 group/hex cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(hex);
                        }}
                      >
                        <p className="text-sm font-mono select-all flex-1">
                          {hex}
                        </p>
                        {isCopied ? (
                          <Check className="w-3 h-3 opacity-70" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-0 group-hover/hex:opacity-50 transition-opacity" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-60 select-all">
                        {layer.variableName}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] opacity-60 pt-1 border-t border-current/10">
                        <span className="w-2 h-2 rounded-full bg-current" />
                        <span className="font-mono">{onHex}</span>
                      </div>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none text-sm">
                        Edit {layer.name}
                      </h4>
                      <HexColorPicker
                        color={hex}
                        onChange={(newColor) =>
                          handleColorChange(layer.variableName, newColor)
                        }
                      />
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs font-mono">{hex}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium leading-none text-sm">
                        Edit Text Color (On-{layer.name})
                      </h4>
                      <HexColorPicker
                        color={onHex}
                        onChange={(newColor) =>
                          handleColorChange(layer.onVariableName, newColor)
                        }
                      />
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: onHex }}
                        />
                        <span className="text-xs font-mono">{onHex}</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    );
  }

  if (variants) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium capitalize">{role} Colors</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {variants.map((variant) => {
            const hex = overrides[variant.variableName] || variant.hex;
            const onHex = overrides[variant.onVariableName] || variant.onHex;
            const isCopied = copiedHex === hex;

            const displayHex = simulateColorBlindness(hex, simulationMode);
            const displayOnHex = simulateColorBlindness(onHex, simulationMode);

            const hasConflict =
              simulationMode !== "none" &&
              !isDistinguishable(displayHex, displayOnHex);

            return (
              <Popover key={variant.name}>
                <PopoverTrigger asChild>
                  <div
                    className="group relative flex flex-col p-3 rounded-lg shadow-sm transition-all duration-200 hover:scale-105 hover:z-10 hover:shadow-lg ring-1 ring-border cursor-pointer h-24"
                    style={{ backgroundColor: displayHex, color: displayOnHex }}
                  >
                    {hasConflict && (
                      <div
                        className="absolute top-1 right-1 text-red-500 bg-white/80 rounded-full p-0.5"
                        title="Low contrast in simulation"
                      >
                        <AlertTriangle size={12} />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold capitalize opacity-90 truncate w-full pr-2">
                        {variant.name}
                      </span>
                      <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity flex-shrink-0" />
                    </div>
                    <div className="mt-auto space-y-0.5">
                      <div
                        className="flex items-center gap-1 group/hex cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(hex);
                        }}
                      >
                        <p className="text-sm font-mono font-semibold select-all">
                          {hex}
                        </p>
                        {isCopied ? (
                          <Check className="w-3 h-3 opacity-70" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-0 group-hover/hex:opacity-70 transition-opacity" />
                        )}
                      </div>
                      <p className="text-[10px] opacity-70 select-all truncate">
                        {variant.variableName}
                      </p>
                    </div>
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none text-sm">
                        Edit {variant.name}
                      </h4>
                      <HexColorPicker
                        color={hex}
                        onChange={(newColor) =>
                          handleColorChange(variant.variableName, newColor)
                        }
                      />
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs font-mono">{hex}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium leading-none text-sm">
                        Edit Text Color (On-{variant.name})
                      </h4>
                      <HexColorPicker
                        color={onHex}
                        onChange={(newColor) =>
                          handleColorChange(variant.onVariableName, newColor)
                        }
                      />
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-6 h-6 rounded border"
                          style={{ backgroundColor: onHex }}
                        />
                        <span className="text-xs font-mono">{onHex}</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
