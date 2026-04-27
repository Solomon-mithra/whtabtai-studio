"use client";

import { toPng } from "html-to-image";

async function renderNodeToPngDataUrl(
  node: HTMLElement,
  width: number,
  height: number,
): Promise<string> {
  node.classList.add("exporting");
  try {
    return await toPng(node, {
      width,
      height,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: "#ffffff",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
        width: `${width}px`,
        height: `${height}px`,
      },
    });
  } finally {
    node.classList.remove("exporting");
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
