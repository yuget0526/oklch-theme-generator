"use client";

import React, { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { captureWithWatermark, copyImageToClipboard } from "@/lib/screenshot";
import { toast } from "sonner";

interface ShareButtonProps {
  targetRef: React.RefObject<HTMLElement | null>;
  disabled?: boolean;
}

export default function ShareButton({ targetRef, disabled }: ShareButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleShare = async () => {
    if (!targetRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      // Capture screenshot with watermark
      const blob = await captureWithWatermark(targetRef.current);

      // Copy to clipboard
      await copyImageToClipboard(blob);

      toast.success("画像をクリップボードにコピーしました！", {
        description: "SNSやSlackに貼り付けて共有できます",
      });
    } catch (error) {
      console.error("Screenshot failed:", error);

      // Check if we're in fallback mode (download instead of copy)
      if (error instanceof Error && error.message.includes("clipboard")) {
        toast.info("画像をダウンロードしました", {
          description:
            "クリップボードがサポートされていないため、ファイルとして保存されました",
        });
      } else {
        toast.error("画像のキャプチャに失敗しました", {
          description: "もう一度お試しください",
        });
      }
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      disabled={disabled || isCapturing}
      title="スクリーンショットを共有"
    >
      <Share2 size={20} className={isCapturing ? "animate-pulse" : ""} />
    </Button>
  );
}
