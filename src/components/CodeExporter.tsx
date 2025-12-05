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

type ExportFormat = "css" | "tailwindV4" | "tailwindV3" | "figmaToken";

interface CodeExporterProps {
  primary: ColorVariant[];
  secondary: ColorVariant[];
  tertiary: ColorVariant[];
  layers: LayerScale[];
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
  const [copiedTab, setCopiedTab] = React.useState<ExportFormat | null>(null);

  // Helper to get override
  const getOverride = (
    mode: ThemeMode,
    variableName: string,
    defaultHex: string
  ) => {
    return overrides[`${mode}:${variableName}`] || defaultHex;
  };

  // ===== Pure CSS Generation =====
  const generatePureCSS = () => {
    const roles = [
      { name: "primary", variants: primary },
      { name: "secondary", variants: secondary },
      { name: "tertiary", variants: tertiary },
    ].filter((role) => role.variants.length > 0);

    let css = `:root {\n`;

    // Light Theme Variables
    roles.forEach(({ name, variants }) => {
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
        c.variants.forEach((v) => {
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

  // ===== Tailwind v4 Generation (@theme directive) =====
  const generateTailwindV4 = () => {
    const roles = [
      { name: "primary", variants: primary },
      { name: "secondary", variants: secondary },
      { name: "tertiary", variants: tertiary },
    ].filter((role) => role.variants.length > 0);

    let css = `/* Tailwind CSS v4 - @theme directive */\n@theme {\n`;

    // Light Theme as default
    roles.forEach(({ name, variants }) => {
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

    // Layers (Light as default)
    const lightLayers = baseMode === "light" ? layers : layersOpposite;
    lightLayers.forEach((layer) => {
      const hex = getOverride("light", layer.variableName, layer.hex);
      const onHex = getOverride("light", layer.onVariableName, layer.onHex);
      // Convert variable name format
      const varName = layer.variableName.startsWith("--color-")
        ? layer.variableName
        : `--color-${layer.variableName.replace(/^--/, "")}`;
      const onVarName = layer.onVariableName.startsWith("--color-")
        ? layer.onVariableName
        : `--color-${layer.onVariableName.replace(/^--/, "")}`;
      css += `  ${varName}: ${hex};\n`;
      css += `  ${onVarName}: ${onHex};\n`;
    });

    css += `}\n\n`;

    // Dark mode using CSS custom media
    css += `/* Dark mode overrides */\n@custom-variant dark (&:is(.dark *));\n\n`;

    css += `:root.dark {\n`;
    roles.forEach(({ name, variants }) => {
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

    const darkLayers = baseMode === "dark" ? layers : layersOpposite;
    darkLayers.forEach((layer) => {
      const hex = getOverride("dark", layer.variableName, layer.hex);
      const onHex = getOverride("dark", layer.onVariableName, layer.onHex);
      const varName = layer.variableName.startsWith("--color-")
        ? layer.variableName
        : `--color-${layer.variableName.replace(/^--/, "")}`;
      const onVarName = layer.onVariableName.startsWith("--color-")
        ? layer.onVariableName
        : `--color-${layer.onVariableName.replace(/^--/, "")}`;
      css += `  ${varName}: ${hex};\n`;
      css += `  ${onVarName}: ${onHex};\n`;
    });

    css += `}`;

    return css;
  };

  // ===== Tailwind v3 Generation (tailwind.config.ts) =====
  const generateTailwindV3 = () => {
    const layerColors = layers
      .slice(1) // Skip background (index 0)
      .map((l) => {
        return `'${l.name}': 'var(${l.variableName})',\n        'on-${l.name}': 'var(${l.onVariableName})'`;
      })
      .join(",\n        ");

    return `// tailwind.config.ts (Tailwind CSS v3)
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
        ${layerColors}
      }
    }
  }
}

export default config;`;
  };

  // ===== Figma Token Generation (W3C DTCG format) =====
  const generateFigmaToken = () => {
    const roles = [
      { name: "primary", variants: primary },
      { name: "secondary", variants: secondary },
      { name: "tertiary", variants: tertiary },
    ].filter((role) => role.variants.length > 0);

    interface TokenValue {
      $value: string;
      $type: string;
      $description?: string;
    }

    interface TokenGroup {
      [key: string]: TokenValue | TokenGroup;
    }

    const tokens: TokenGroup = {
      color: {} as TokenGroup,
    };

    // Brand colors
    roles.forEach(({ name, variants }) => {
      const colorGroup: TokenGroup = {};

      // Light mode colors
      const lightMain = variants.find((v) => v.name === "light");
      const lightVariant = variants.find((v) => v.name === "light-variant");

      if (lightMain) {
        colorGroup["light"] = {
          $value: getOverride("light", lightMain.variableName, lightMain.hex),
          $type: "color",
        };
        colorGroup["light-foreground"] = {
          $value: getOverride(
            "light",
            lightMain.onVariableName,
            lightMain.onHex
          ),
          $type: "color",
        };
      }
      if (lightVariant) {
        colorGroup["light-variant"] = {
          $value: getOverride(
            "light",
            lightVariant.variableName,
            lightVariant.hex
          ),
          $type: "color",
        };
        colorGroup["light-variant-foreground"] = {
          $value: getOverride(
            "light",
            lightVariant.onVariableName,
            lightVariant.onHex
          ),
          $type: "color",
        };
      }

      // Dark mode colors
      const darkMain = variants.find((v) => v.name === "dark");
      const darkVariant = variants.find((v) => v.name === "dark-variant");

      if (darkMain) {
        colorGroup["dark"] = {
          $value: getOverride("dark", darkMain.variableName, darkMain.hex),
          $type: "color",
        };
        colorGroup["dark-foreground"] = {
          $value: getOverride("dark", darkMain.onVariableName, darkMain.onHex),
          $type: "color",
        };
      }
      if (darkVariant) {
        colorGroup["dark-variant"] = {
          $value: getOverride(
            "dark",
            darkVariant.variableName,
            darkVariant.hex
          ),
          $type: "color",
        };
        colorGroup["dark-variant-foreground"] = {
          $value: getOverride(
            "dark",
            darkVariant.onVariableName,
            darkVariant.onHex
          ),
          $type: "color",
        };
      }

      (tokens.color as TokenGroup)[name] = colorGroup;
    });

    // Layer tokens
    const layerTokens: TokenGroup = {};

    // Light layers
    const lightLayers = baseMode === "light" ? layers : layersOpposite;
    lightLayers.forEach((layer) => {
      const layerName = layer.name.replace(/\s+/g, "-").toLowerCase();
      if (!layerTokens[layerName]) {
        layerTokens[layerName] = {} as TokenGroup;
      }
      (layerTokens[layerName] as TokenGroup)["light"] = {
        $value: getOverride("light", layer.variableName, layer.hex),
        $type: "color",
      };
      (layerTokens[layerName] as TokenGroup)["light-foreground"] = {
        $value: getOverride("light", layer.onVariableName, layer.onHex),
        $type: "color",
      };
    });

    // Dark layers
    const darkLayers = baseMode === "dark" ? layers : layersOpposite;
    darkLayers.forEach((layer) => {
      const layerName = layer.name.replace(/\s+/g, "-").toLowerCase();
      if (!layerTokens[layerName]) {
        layerTokens[layerName] = {} as TokenGroup;
      }
      (layerTokens[layerName] as TokenGroup)["dark"] = {
        $value: getOverride("dark", layer.variableName, layer.hex),
        $type: "color",
      };
      (layerTokens[layerName] as TokenGroup)["dark-foreground"] = {
        $value: getOverride("dark", layer.onVariableName, layer.onHex),
        $type: "color",
      };
    });

    tokens["layer"] = layerTokens;

    return JSON.stringify(tokens, null, 2);
  };

  const handleCopy = (text: string, format: ExportFormat) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(format);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const cssCode = generatePureCSS();
  const twV4Code = generateTailwindV4();
  const twV3Code = generateTailwindV3();
  const figmaCode = generateFigmaToken();

  const renderCodeBlock = (
    code: string,
    format: ExportFormat,
    language: string
  ) => (
    <div className="relative">
      <pre
        className={`p-4 rounded-lg bg-slate-950 text-slate-50 overflow-x-auto text-sm font-mono max-h-[500px] ${
          language === "json" ? "whitespace-pre" : ""
        }`}
      >
        {code}
      </pre>
      <Button
        size="icon"
        variant="secondary"
        className="absolute top-2 right-2"
        onClick={() => handleCopy(code, format)}
      >
        {copiedTab === format ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="css">
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="css">Pure CSS</TabsTrigger>
            <TabsTrigger value="tailwindV4">Tailwind v4</TabsTrigger>
            <TabsTrigger value="tailwindV3">Tailwind v3</TabsTrigger>
            <TabsTrigger value="figmaToken">Figma Token</TabsTrigger>
          </TabsList>

          <TabsContent value="css" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              スタンダードなCSS変数形式。:root と .dark セレクタを使用。
            </p>
            {renderCodeBlock(cssCode, "css", "css")}
          </TabsContent>

          <TabsContent value="tailwindV4" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Tailwind CSS
              v4の@themeディレクティブ形式。globals.cssに追加してください。
            </p>
            {renderCodeBlock(twV4Code, "tailwindV4", "css")}
          </TabsContent>

          <TabsContent value="tailwindV3" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Tailwind CSS v3の設定ファイル形式。Pure
              CSSも併せてglobals.cssに追加してください。
            </p>
            {renderCodeBlock(twV3Code, "tailwindV3", "typescript")}
          </TabsContent>

          <TabsContent value="figmaToken" className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              W3C DTCG仕様準拠のFigma Token形式（JSON）。Tokens
              Studio等で使用可能。
            </p>
            {renderCodeBlock(figmaCode, "figmaToken", "json")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
