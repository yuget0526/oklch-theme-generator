import React, { useState } from "react";
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
  primaryOpposite: ColorVariant[];
  secondaryOpposite: ColorVariant[];
  tertiaryOpposite: ColorVariant[];
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
  primaryOpposite,
  secondaryOpposite,
  tertiaryOpposite,
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
    const lightVariants =
      baseMode === "light"
        ? { p: primary, s: secondary, t: tertiary, l: layers }
        : {
            p: primaryOpposite,
            s: secondaryOpposite,
            t: tertiaryOpposite,
            l: layersOpposite,
          };

    const darkVariants =
      baseMode === "dark"
        ? { p: primary, s: secondary, t: tertiary, l: layers }
        : {
            p: primaryOpposite,
            s: secondaryOpposite,
            t: tertiaryOpposite,
            l: layersOpposite,
          };

    let css = `:root {\n`;

    // Light Theme Variables
    // Brand Colors
    [lightVariants.p, lightVariants.s, lightVariants.t].forEach(
      (variants, i) => {
        const prefix = ["primary", "secondary", "tertiary"][i];
        variants.forEach((v) => {
          const suffix =
            v.name === "default"
              ? "DEFAULT"
              : v.name === "light"
              ? "lightvariant"
              : "darkvariant";
          const hex = getOverride("light", v.variableName, v.hex);
          const onHex = getOverride("light", v.onVariableName, v.onHex);
          css += `  --color-${prefix}-${suffix}: ${hex};\n`;
          css += `  --color-on-${prefix}-${suffix}: ${onHex};\n`;
        });
      }
    );

    // Layers (Light)
    lightVariants.l.forEach((layer) => {
      const hex = getOverride("light", layer.variableName, layer.hex);
      const onHex = getOverride("light", layer.onVariableName, layer.onHex);
      css += `  ${layer.variableName}: ${hex};\n`;
      css += `  ${layer.onVariableName}: ${onHex};\n`;
    });

    // Chroma Groups (Light)
    chromaGroups.forEach((group) => {
      group.colors.forEach((c, i) => {
        c.variants.forEach((v) => {
          const suffix =
            v.name === "default"
              ? "DEFAULT"
              : v.name === "light"
              ? "lightvariant"
              : "darkvariant";
          // Chroma groups don't have overrides UI yet, but if they did...
          // We don't have variableNames for chroma groups stored in the object properly maybe?
          // The generator doesn't assign variableName to chroma group variants in the same way?
          // Actually generateBrandColors DOES assign variableName.
          // But the variableName in generateBrandColors uses the 'role' arg.
          // In generateChromaGroup, we pass `${name}-${i+1}` as role.
          // So variableName is `--color-${name}-${i+1}-DEFAULT`.
          const hex = getOverride("light", v.variableName, v.hex);
          const onHex = getOverride("light", v.onVariableName, v.onHex);
          css += `  --color-${group.name}-${i + 1}-${suffix}: ${hex};\n`;
          css += `  --color-on-${group.name}-${i + 1}-${suffix}: ${onHex};\n`;
        });
      });
    });

    css += `}\n\n`;

    // Dark Theme Variables
    css += `.dark {\n`;
    [darkVariants.p, darkVariants.s, darkVariants.t].forEach((variants, i) => {
      const prefix = ["primary", "secondary", "tertiary"][i];
      variants.forEach((v) => {
        const suffix =
          v.name === "default"
            ? "DEFAULT"
            : v.name === "light"
            ? "lightvariant"
            : "darkvariant";
        const hex = getOverride("dark", v.variableName, v.hex);
        const onHex = getOverride("dark", v.onVariableName, v.onHex);
        css += `  --color-${prefix}-${suffix}: ${hex};\n`;
        css += `  --color-on-${prefix}-${suffix}: ${onHex};\n`;
      });
    });

    // Layers (Dark)
    darkVariants.l.forEach((layer) => {
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
          DEFAULT: 'var(--color-primary-DEFAULT)',
          lightvariant: 'var(--color-primary-lightvariant)',
          darkvariant: 'var(--color-primary-darkvariant)',
          'on-DEFAULT': 'var(--color-on-primary-DEFAULT)',
          'on-lightvariant': 'var(--color-on-primary-lightvariant)',
          'on-darkvariant': 'var(--color-on-primary-darkvariant)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary-DEFAULT)',
          lightvariant: 'var(--color-secondary-lightvariant)',
          darkvariant: 'var(--color-secondary-darkvariant)',
          'on-DEFAULT': 'var(--color-on-secondary-DEFAULT)',
          'on-lightvariant': 'var(--color-on-secondary-lightvariant)',
          'on-darkvariant': 'var(--color-on-secondary-darkvariant)',
        },
        tertiary: {
          DEFAULT: 'var(--color-tertiary-DEFAULT)',
          lightvariant: 'var(--color-tertiary-lightvariant)',
          darkvariant: 'var(--color-tertiary-darkvariant)',
          'on-DEFAULT': 'var(--color-on-tertiary-DEFAULT)',
          'on-lightvariant': 'var(--color-on-tertiary-lightvariant)',
          'on-darkvariant': 'var(--color-on-tertiary-darkvariant)',
        },
        // Layers
        background: 'var(--color-background)',
        'on-background': 'var(--color-on-background)',
        ${layers
          .slice(1) // Skip background (index 0)
          .map((l, i) => {
            // l.name is surface-1, surface-2...
            // We want:
            // 'surface-1': 'var(--color-surface-1)',
            // 'on-surface-1': 'var(--color-on-surface-1)',
            return `'${l.name}': 'var(${l.variableName})',\n        'on-${l.name}': 'var(${l.onVariableName})'`;
          })
          .join(",\n        ")}
        // Chroma Groups would be added similarly
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
