import React, { useState } from "react";
import { ChromaGroup, generateChromaGroup } from "@/lib/color/color-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ColorGroupCreatorProps {
  onAdd: (group: ChromaGroup) => void;
}

export default function ColorGroupCreator({ onAdd }: ColorGroupCreatorProps) {
  const [name, setName] = useState("Tag");
  const [chroma, setChroma] = useState(0.15);
  const [lightness, setLightness] = useState(0.7);
  const [count, setCount] = useState(6);

  const handleAdd = () => {
    const group = generateChromaGroup(
      chroma,
      lightness,
      count,
      name.toLowerCase(),
    );
    onAdd(group);
  };

  return (
    <Card className="border-dashed shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">New Group</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="group-name" className="text-xs text-muted-foreground">
            Group Name
          </Label>
          <Input
            id="group-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">
                Lightness (L)
              </Label>
              <span className="text-xs font-mono text-muted-foreground">
                {lightness.toFixed(2)}
              </span>
            </div>
            <div className="relative">
              {/* Ruler markers at recommended range */}
              <div className="absolute -top-6 left-0 right-0 h-8 flex items-end">
                {/* 0.4 marker */}
                <div
                  className="absolute flex flex-col items-center"
                  style={{ left: "40%" }}
                >
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-mono mb-0.5">
                    0.4
                  </span>
                  <div className="w-px h-4 bg-green-500 dark:bg-green-400" />
                </div>
                {/* 0.7 marker */}
                <div
                  className="absolute flex flex-col items-center"
                  style={{ left: "70%" }}
                >
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-mono mb-0.5">
                    0.7
                  </span>
                  <div className="w-px h-4 bg-green-500 dark:bg-green-400" />
                </div>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[lightness]}
                onValueChange={(vals) => setLightness(vals[0])}
                className="mt-8"
              />
            </div>
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
              max={0.3}
              step={0.001}
              value={[chroma]}
              onValueChange={(vals) => setChroma(vals[0])}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="count" className="text-xs text-muted-foreground">
            Color Count
          </Label>
          <Input
            id="count"
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="font-mono text-sm"
          />
        </div>

        {/* Live Preview */}
        <div className="pt-2">
          <Label className="text-xs text-muted-foreground block mb-2">
            Preview
          </Label>
          <div className="grid grid-cols-6 gap-0.5 rounded-md overflow-hidden h-12">
            {generateChromaGroup(
              chroma,
              lightness,
              count,
              "preview",
            ).colors.map((c, i) => (
              <div
                key={i}
                className="h-full w-full"
                style={{ backgroundColor: c.variants[0].hex }} // Show Main variant
                title={`Hue: ${Math.round(c.hue)}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 px-1">
            <span>{count} hues</span>
            <span>L: {lightness.toFixed(2)}</span>
            <span>C: {chroma.toFixed(3)}</span>
          </div>
        </div>

        <Button onClick={handleAdd} className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </CardContent>
    </Card>
  );
}
