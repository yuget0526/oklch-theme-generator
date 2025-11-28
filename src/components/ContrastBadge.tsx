import {
  getContrastResult,
  formatRatio,
  formatAPCA,
} from "@/lib/color/accessibility";
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
  const { ratio, aa, aaa, apca, apcaLevel } = result;

  // Pass if WCAG AA (4.5) OR APCA Lc >= 60 (Large Text/Button)
  const isPass = aa || Math.abs(apca) >= 60;

  // Unified style: Darker background and stronger border for better visibility on light backgrounds
  const themeClass = "bg-slate-800/90 text-white border-white/20 shadow-sm";

  let statusColor = "text-red-300";
  let Icon = X;

  if (aaa || Math.abs(apca) >= 75) {
    statusColor = "text-green-300";
    Icon = Check;
  } else if (isPass) {
    statusColor = "text-yellow-300";
    Icon = Check;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-[10px] font-mono backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border w-[100px]",
        themeClass,
        className
      )}
      title={`WCAG Ratio: ${formatRatio(ratio)} (AA: ${
        aa ? "Pass" : "Fail"
      }, AAA: ${aaa ? "Pass" : "Fail"})\nAPCA: ${formatAPCA(
        apca
      )} (${apcaLevel})`}
    >
      <Icon size={12} className={statusColor} />
      <div className="flex flex-col leading-none gap-0.5 items-start">
        <div className="flex items-center gap-1">
          <span className="font-bold">{formatRatio(ratio)}</span>
          <span className="opacity-40">|</span>
          <span className="opacity-90">{aaa ? "AAA" : aa ? "AA" : "-"}</span>
        </div>
        <div className="text-[9px] opacity-70">
          Lc {Math.round(Math.abs(apca))}
        </div>
      </div>
    </div>
  );
}
