"use client";

import { toPng } from "html-to-image";

/**
 * WebKit rasterizes html-to-image's foreignObject SVG before the images
 * embedded in it finish decoding, so image slots come out blank on the first
 * render. Extra warm-up passes leave the decoded images in cache for the pass
 * we keep. Chromium doesn't have the race — skip the cost there.
 */
function renderPassCount(): number {
  const isWebKit =
    typeof navigator !== "undefined" &&
    /^((?!chrome|chromium|crios|android).)*safari/i.test(navigator.userAgent);
  return isWebKit ? 3 : 1;
}

async function renderNodeToPngDataUrl(
  node: HTMLElement,
  width: number,
  height: number,
  options: { transparent?: boolean } = {},
): Promise<string> {
  const extraClass = options.transparent ? "exporting-overlay" : null;
  node.classList.add("exporting");
  if (extraClass) node.classList.add(extraClass);
  try {
    const toPngOptions = {
      width,
      height,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: options.transparent ? undefined : "#ffffff",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: `${width}px`,
        height: `${height}px`,
      },
    };
    let dataUrl = "";
    for (let pass = renderPassCount(); pass > 0; pass--) {
      dataUrl = await toPng(node, toPngOptions);
    }
    return dataUrl;
  } finally {
    node.classList.remove("exporting");
    if (extraClass) node.classList.remove(extraClass);
  }
}

export async function exportNodeToPng(
  node: HTMLElement,
  width: number,
  height: number,
  fileName: string,
) {
  const dataUrl = await renderNodeToPngDataUrl(node, width, height);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

export async function nodeToPngBlob(
  node: HTMLElement,
  width: number,
  height: number,
): Promise<Blob> {
  const dataUrl = await renderNodeToPngDataUrl(node, width, height);
  const res = await fetch(dataUrl);
  return await res.blob();
}

/**
 * Render the slide with the `exporting-overlay` class set — clears solid
 * backgrounds and hides video elements so the resulting PNG has transparent
 * holes where each video card sits. Used by the video export pipeline as the
 * top layer composited over the underlying video frames.
 */
export async function nodeToTransparentOverlayBlob(
  node: HTMLElement,
  width: number,
  height: number,
): Promise<Blob> {
  const dataUrl = await renderNodeToPngDataUrl(node, width, height, {
    transparent: true,
  });
  const res = await fetch(dataUrl);
  return await res.blob();
}

export type OverlayHole = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Border radius for the punched corner; matches the visible card. */
  radius?: number;
};

/**
 * Render the slide overlay, then punch transparent rounded-rect holes wherever
 * a video slot sits. The hole is the canonical signal to the compositor —
 * regardless of whether the `.exporting-overlay` CSS made the card background
 * transparent, the punched alpha=0 region guarantees ffmpeg's overlayed video
 * shows through cleanly.
 */
export async function nodeToOverlayBlobWithHoles(
  node: HTMLElement,
  width: number,
  height: number,
  holes: OverlayHole[],
): Promise<Blob> {
  const dataUrl = await renderNodeToPngDataUrl(node, width, height, {
    transparent: true,
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new window.Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get 2d canvas context");
  ctx.drawImage(img, 0, 0, width, height);

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000";
  for (const hole of holes) {
    const r = hole.radius ?? 0;
    ctx.beginPath();
    if (r > 0 && typeof ctx.roundRect === "function") {
      ctx.roundRect(hole.x, hole.y, hole.w, hole.h, r);
    } else {
      ctx.rect(hole.x, hole.y, hole.w, hole.h);
    }
    ctx.fill();
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("canvas.toBlob returned null"));
    }, "image/png");
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function slugify(s: string, max = 36): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, max) || "post"
  );
}
