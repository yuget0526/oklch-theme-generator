"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleValueChange = (nextLocale: string) => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <Select value={locale} onValueChange={handleValueChange}>
      <SelectTrigger className="w-auto min-w-[70px] h-9 px-2 gap-2 border-none bg-transparent hover:bg-accent focus:ring-0 text-muted-foreground hover:text-foreground">
        <Languages className="w-4 h-4" />
        <SelectValue>{locale.toUpperCase()}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="ja">日本語</SelectItem>
      </SelectContent>
    </Select>
  );
}
