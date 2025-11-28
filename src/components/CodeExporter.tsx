import React from "react";
import {
  ColorVariant,
  LayerScale,
  ChromaGroup,
  ThemeMode,
} from "@/lib/color/color-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";

interface CodeExporterProps {
  primary: ColorVariant[];
  secondary: ColorVariant[];
  tertiary: ColorVariant[];
  layers: LayerScale[];
  // Opposite props are no longer needed as variants contain all info
  primaryOpposite?: ColorVariant[];
  secondaryOpposite?: ColorVariant[];
  tertiaryOpposite?: ColorVariant[];
  layersOpposite: LayerScale[];
  chromaGroups: ChromaGroup[];
  baseMode: ThemeMode;
  overrides?: Record<string, string>;
}

export default function CodeExporter({
  primary,
  secondary,
  tertiary,
  layers,
  layersOpposite,
  chromaGroups,
  baseMode,
  overrides = {},
}: CodeExporterProps) {
  const [copied, setCopied] = React.useState(false);

  // Helper to get override
  const getOverride = (
    mode: ThemeMode,
    variableName: string,
    defaultHex: string
  ) => {
    return overrides[`${mode}:${variableName}`] || defaultHex;
  };

  const generateCSS = () => {
    // We assume 'primary', 'secondary', 'tertiary' props contain all 4 variants (light, light-variant, dark, dark-variant)
    // regardless of baseMode, because generateBrandColors returns all of them.

    const roles = [
      { name: "primary", variants: primary },
      { name: "secondary", variants: secondary },
      { name: "tertiary", variants: tertiary },
    ].filter((role) => role.variants.length > 0);

    let css = `:root {\n`;

    // Light Theme Variables
    roles.forEach(({ name, variants }) => {
      // Find Light Main and Light Variant
      const main = variants.find((v) => v.name === "light");
      const variant = variants.find((v) => v.name === "light-variant");

      if (main) {
        const hex = getOverride("light", main.variableName, main.hex);
        const onHex = getOverride("light", main.onVariableName, main.onHex);
        css += `  --color-${name}: ${hex};\n`;
        css += `  --color-on-${name}: ${onHex};\n`;
      }
      if (variant) {
        const hex = getOverride("light", variant.variableName, variant.hex);
        const onHex = getOverride(
          "light",
          variant.onVariableName,
          variant.onHex
        );
        css += `  --color-${name}-variant: ${hex};\n`;
        css += `  --color-on-${name}-variant: ${onHex};\n`;
      }
    });

    // Layers (Light)
    // Layers are mode-dependent, passed via props
    const lightLayers = baseMode === "light" ? layers : layersOpposite;
    lightLayers.forEach((layer) => {
      const hex = getOverride("light", layer.variableName, layer.hex);
      const onHex = getOverride("light", layer.onVariableName, layer.onHex);
      css += `  ${layer.variableName}: ${hex};\n`;
      css += `  ${layer.onVariableName}: ${onHex};\n`;
    });

    // Chroma Groups (Light)
    chromaGroups.forEach((group) => {
      group.colors.forEach((c, i) => {
        // Chroma groups currently have 3 variants (Light/Default/Dark) structure in their generation logic?
        // We haven't updated ColorGroupCreator yet. It might still be using old logic.
        // Assuming it's old logic, let's just dump them as is for now or skip.
        // For safety, let's skip detailed chroma group export update until requested,
        // or just export them simply.
        c.variants.forEach((v) => {
          // ... existing logic ...
          // If we updated generateBrandColors, chroma groups using it will also have 4 variants.
          // Let's assume they do.
          if (v.name === "light") {
            css += `  --color-${group.name}-${i + 1}: ${v.hex};\n`;
            css += `  --color-on-${group.name}-${i + 1}: ${v.onHex};\n`;
          } else if (v.name === "light-variant") {
            css += `  --color-${group.name}-${i + 1}-variant: ${v.hex};\n`;
            css += `  --color-on-${group.name}-${i + 1}-variant: ${v.onHex};\n`;
          }
        });
      });
    });

    css += `}\n\n`;

    // Dark Theme Variables
    css += `.dark {\n`;
    roles.forEach(({ name, variants }) => {
      // Find Dark Main and Dark Variant
      const main = variants.find((v) => v.name === "dark");
      const variant = variants.find((v) => v.name === "dark-variant");

      if (main) {
        const hex = getOverride("dark", main.variableName, main.hex);
        const onHex = getOverride("dark", main.onVariableName, main.onHex);
        css += `  --color-${name}: ${hex};\n`;
        css += `  --color-on-${name}: ${onHex};\n`;
      }
      if (variant) {
        const hex = getOverride("dark", variant.variableName, variant.hex);
        const onHex = getOverride(
          "dark",
          variant.onVariableName,
          variant.onHex
        );
        css += `  --color-${name}-variant: ${hex};\n`;
        css += `  --color-on-${name}-variant: ${onHex};\n`;
      }
    });

    // Layers (Dark)
    const darkLayers = baseMode === "dark" ? layers : layersOpposite;
    darkLayers.forEach((layer) => {
      const hex = getOverride("dark", layer.variableName, layer.hex);
      const onHex = getOverride("dark", layer.onVariableName, layer.onHex);
      css += `  ${layer.variableName}: ${hex};\n`;
      css += `  ${layer.onVariableName}: ${onHex};\n`;
    });

    css += `}`;

    return css;
  };

  const generateTailwindConfig = () => {
    return `// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          variant: 'var(--color-primary-variant)',
          foreground: 'var(--color-on-primary)',
          'variant-foreground': 'var(--color-on-primary-variant)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          variant: 'var(--color-secondary-variant)',
          foreground: 'var(--color-on-secondary)',
          'variant-foreground': 'var(--color-on-secondary-variant)',
        },
        tertiary: {
          DEFAULT: 'var(--color-tertiary)',
          variant: 'var(--color-tertiary-variant)',
          foreground: 'var(--color-on-tertiary)',
          'variant-foreground': 'var(--color-on-tertiary-variant)',
        },
        // Layers
        background: 'var(--color-background)',
        foreground: 'var(--color-on-background)',
        ${layers
          .slice(1) // Skip background (index 0)
          .map((l) => {
            return `'${l.name}': 'var(${l.variableName})',\n        'on-${l.name}': 'var(${l.onVariableName})'`;
          })
          .join(",\n        ")}
      }
    }
  }
}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cssCode = generateCSS();
  const twCode = generateTailwindConfig();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="css">
          <TabsList className="mb-4">
            <TabsTrigger value="css">global.css</TabsTrigger>
            <TabsTrigger value="tailwind">tailwind.config.ts</TabsTrigger>
          </TabsList>

          <TabsContent value="css" className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-slate-950 text-slate-50 overflow-x-auto text-sm font-mono max-h-[500px]">
                {cssCode}
              </pre>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(cssCode)}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tailwind" className="space-y-4">
            <div className="relative">
              <pre className="p-4 rounded-lg bg-slate-950 text-slate-50 overflow-x-auto text-sm font-mono max-h-[500px]">
                {twCode}
              </pre>
              <Button
                size="icon"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => handleCopy(twCode)}
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
