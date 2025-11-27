import React from "react";
import { ThemeMode } from "@/lib/color/color-utils";

interface ThemeSelectorProps {
  currentMode: ThemeMode;
  onModeChange: (mode: ThemeMode) => void;
}

export default function ThemeSelector({
  currentMode,
  onModeChange,
}: ThemeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Base Theme
      </label>
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => onModeChange("light")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            currentMode === "light"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Light
        </button>
        <button
          onClick={() => onModeChange("dark")}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            currentMode === "dark"
              ? "bg-gray-700 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Dark
        </button>
      </div>
      <p className="text-xs text-gray-500">
        The opposite theme will be automatically generated.
      </p>
    </div>
  );
}
