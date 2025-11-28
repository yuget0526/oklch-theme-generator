"use client";

import { Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied!", {
        description: "Share this URL to collaborate with your settings.",
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopyLink}
      title="Copy settings link"
    >
      {copied ? <Check size={20} /> : <Link2 size={20} />}
    </Button>
  );
}
