import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SimulationType } from "@/lib/color/simulation";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";

interface SimulationControlProps {
  simulationMode: SimulationType;
  onSimulationChange: (mode: SimulationType) => void;
  variant?: "sidebar" | "header";
}

export default function SimulationControl({
  simulationMode,
  onSimulationChange,
  variant = "sidebar",
}: SimulationControlProps) {
  const t = useTranslations("SimulationControl");

  const isHeader = variant === "header";

  if (isHeader) {
    return (
      <Select
        value={simulationMode}
        onValueChange={(val) => onSimulationChange(val as SimulationType)}
      >
        <SelectTrigger
          className="h-9 px-2 gap-2 border-none bg-transparent hover:bg-accent focus:ring-0 w-auto min-w-[40px]"
          aria-label={t("title")}
        >
          {simulationMode === "none" ? (
            <Eye className="w-4 h-4 text-muted-foreground" />
          ) : (
            <EyeOff className="w-4 h-4 text-primary" />
          )}
          <span className="hidden xl:inline text-sm font-medium">
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="none">{t("none")}</SelectItem>
          <SelectItem value="protanopia">{t("protanopia")}</SelectItem>
          <SelectItem value="deuteranopia">{t("deuteranopia")}</SelectItem>
          <SelectItem value="tritanopia">{t("tritanopia")}</SelectItem>
          <SelectItem value="achromatopsia">{t("achromatopsia")}</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <span>👁️</span>
          {t("title")}
        </Label>
      </div>

      <Select
        value={simulationMode}
        onValueChange={(val) => onSimulationChange(val as SimulationType)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("selectPlaceholder")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">{t("none")}</SelectItem>
          <SelectItem value="protanopia">{t("protanopia")}</SelectItem>
          <SelectItem value="deuteranopia">{t("deuteranopia")}</SelectItem>
          <SelectItem value="tritanopia">{t("tritanopia")}</SelectItem>
          <SelectItem value="achromatopsia">{t("achromatopsia")}</SelectItem>
        </SelectContent>
      </Select>

      {simulationMode !== "none" && (
        <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
          {t("description")}
        </p>
      )}
    </div>
  );
}
