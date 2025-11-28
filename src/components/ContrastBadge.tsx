import React from "react";
import { getContrastResult, formatRatio } from "@/lib/color/accessibility";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContrastBadgeProps {
  bgColor: string;
  fgColor: string;
  className?: string;
}

export default function ContrastBadge({
  bgColor,
  fgColor,
  className,
}: ContrastBadgeProps) {
  const result = getContrastResult(bgColor, fgColor);
  const { ratio, aa, aaa } = result;

  let statusColor = "text-red-400";
  let Icon = X;

  if (aaa) {
    statusColor = "text-green-400";
    Icon = Check;
  } else if (aa) {
    statusColor = "text-yellow-400";
    Icon = Check;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-[10px] font-mono bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-full text-white shadow-sm border border-white/10",
        className
      )}
      title={`Contrast Ratio: ${formatRatio(ratio)} (AA: ${
        aa ? "Pass" : "Fail"
      }, AAA: ${aaa ? "Pass" : "Fail"})`}
    >
      <Icon size={10} className={statusColor} />
      <span>{formatRatio(ratio)}</span>
      {aaa && <span className="text-[9px] opacity-70 ml-0.5">AAA</span>}
      {!aaa && aa && <span className="text-[9px] opacity-70 ml-0.5">AA</span>}
    </div>
  );
}
