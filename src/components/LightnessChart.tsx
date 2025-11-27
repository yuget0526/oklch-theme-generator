"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface LightnessChartProps {
  values: number[]; // Array of lightness values (0-1)
  onChange: (newValues: number[]) => void;
  className?: string;
  min?: number;
  max?: number;
}

export function LightnessChart({
  values,
  onChange,
  className,
  min = 0,
  max = 1,
}: LightnessChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  // SVG Dimensions
  const width = 200; // viewBox width (2:1 aspect ratio to match container)
  const height = 100; // viewBox height
  const padding = 15; // Increased padding for labels
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const handlePointerDown = (index: number, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingIndex(index);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIndex === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    // Calculate new Y based on pointer position
    // Y is inverted in SVG (0 is top), but Lightness 1 is White (Top) or Bottom?
    // Usually graphs show 1 at top.
    // So Y=0 (top) -> L=1. Y=height (bottom) -> L=0.

    // Relative Y in pixels
    const relativeY = e.clientY - rect.top;

    // Convert to 0-1 range
    // y = padding + (1 - L) * graphHeight
    // relativeY / rect.height = svgY / height
    // But let's just use the percentage of the container height.

    const percentY = Math.max(0, Math.min(1, relativeY / rect.height));

    // Map percentY (0 top -> 1 bottom) to Lightness (1 top -> 0 bottom)
    // L = 1 - percentY
    // But we have padding in the SVG visualization.
    // Ideally we map the pointer to the graph area.

    // Let's simplify: map the pointer Y directly to L value, ignoring padding for interaction logic if possible,
    // or strictly map to the visual graph.

    // Let's map strictly to visual graph for accuracy.
    // The graph area is from `padding` to `height - padding`.
    // Total SVG height corresponds to `rect.height`.
    // SVG Y = percentY * 100.

    const svgY = percentY * height;

    // Clamp to graph area
    const clampedSvgY = Math.max(padding, Math.min(height - padding, svgY));

    // Convert SVG Y to Lightness
    // clampedSvgY = padding + (1 - L) * graphHeight
    // (clampedSvgY - padding) / graphHeight = 1 - L
    // L = 1 - (clampedSvgY - padding) / graphHeight

    // normalizedY (0 at top, 1 at bottom)
    const normalizedY = (clampedSvgY - padding) / graphHeight;

    // L = max - normalizedY * (max - min)
    const newL = max - normalizedY * (max - min);

    const newValues = [...values];
    newValues[draggingIndex] = Number(newL.toFixed(3));
    onChange(newValues);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setDraggingIndex(null);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Generate path data
  const points = values.map((l, i) => {
    const x = padding + (i / (values.length - 1)) * graphWidth;
    // normalizedL (0 at min, 1 at max)
    const normalizedL = (l - min) / (max - min);
    // y (padding at max, padding+height at min)
    const y = padding + (1 - normalizedL) * graphHeight;
    return { x, y, l };
  });

  const pathData =
    points.length > 1
      ? `M ${points[0].x} ${points[0].y} ` +
        points
          .slice(1)
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ")
      : "";

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full aspect-[2/1] bg-card border rounded-lg p-4 select-none touch-none",
        className
      )}
    >
      <div className="w-full h-full relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          {/* Grid lines */}
          <line
            x1={padding}
            y1={padding}
            x2={width - padding}
            y2={padding}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={0.5}
          />
          <line
            x1={padding}
            y1={height / 2}
            x2={width - padding}
            y2={height / 2}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={0.5}
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={0.5}
          />

          {/* Labels */}
          <text
            x={padding - 2}
            y={padding + 3}
            textAnchor="end"
            fontSize={6}
            fill="currentColor"
            opacity={0.5}
          >
            {max}
          </text>
          <text
            x={padding - 2}
            y={height - padding + 3}
            textAnchor="end"
            fontSize={6}
            fill="currentColor"
            opacity={0.5}
          >
            {min}
          </text>

          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-primary"
          />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                className={cn(
                  "fill-background stroke-primary cursor-ns-resize transition-all",
                  draggingIndex === i
                    ? "r-6 stroke-[3px]"
                    : "stroke-[2px] hover:r-5"
                )}
                onPointerDown={(e) => handlePointerDown(i, e)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
              {/* Tooltip on hover/drag */}
              {draggingIndex === i && (
                <text
                  x={p.x}
                  y={p.y - 8}
                  textAnchor="middle"
                  fontSize={8}
                  fill="currentColor"
                  className="font-mono font-bold"
                >
                  {p.l.toFixed(2)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
