import { toPng } from "html-to-image";

/**
 * Capture an HTML element as PNG with watermark
 */
export async function captureWithWatermark(
  element: HTMLElement
): Promise<Blob> {
  // Capture the element at 2x resolution
  const dataUrl = await toPng(element, {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
  });

  // Create canvas to add watermark
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }

  // Load the captured image
  const img = new Image();
  img.src = dataUrl;

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
  });

  // Set canvas size to match image
  canvas.width = img.width;
  canvas.height = img.height;

  // Draw the captured image
  ctx.drawImage(img, 0, 0);

  // Add watermark
  const watermarkText = "Created with oklch-theme-generator";
  const fontSize = 24;
  const padding = 20;

  ctx.font = `${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";

  ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob"));
        }
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Copy image blob to clipboard
 */
export async function copyImageToClipboard(blob: Blob): Promise<void> {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
  } catch (error) {
    // Fallback: Download the image if clipboard is not supported
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `oklch-palette-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    throw error; // Re-throw to show appropriate message
  }
}
