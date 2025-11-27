import React from "react";
import { HexColorPicker } from "react-colorful";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({
  label,
  color,
  onChange,
}: ColorPickerProps) {
  return (
    <div className="flex items-center justify-between group">
      <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors cursor-pointer">
        {label}
      </Label>
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <div
              className="w-8 h-8 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-transform hover:scale-110 cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ backgroundColor: color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="end">
            <HexColorPicker color={color} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <Input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 h-8 px-2 py-1 text-xs font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}
