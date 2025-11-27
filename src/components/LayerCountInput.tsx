import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface LayerCountInputProps {
  value: number;
  onChange: (value: number) => void;
}

export default function LayerCountInput({
  value,
  onChange,
}: LayerCountInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-sm font-medium">Layers</Label>
        <Badge variant="secondary" className="font-mono">
          {value}
        </Badge>
      </div>
      <Slider
        min={3}
        max={7}
        step={1}
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        className="w-full"
      />
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>3</span>
        <span>7</span>
      </div>
    </div>
  );
}
