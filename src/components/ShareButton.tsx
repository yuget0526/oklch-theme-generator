"use client";

import React, { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface ShareButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
}

export default function ShareButton({ targetRef }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleCapture = async () => {
    if (!targetRef.current) return;

    setLoading(true);
    try {
      const dataUrl = await toPng(targetRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "white",
      });

      try {
        const blob = await (await fetch(dataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        toast.success("Image copied to clipboard!");
      } catch {
        // Fallback to download
        const link = document.createElement("a");
        link.download = `oklch-palette-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        toast.success("Image downloaded!");
      }
    } catch (err) {
      console.error("Failed to capture image", err);
      toast.error("Failed to capture image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCapture}
      disabled={loading}
      title="Capture preview as image"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Camera size={20} />
      )}
    </Button>
  );
}
