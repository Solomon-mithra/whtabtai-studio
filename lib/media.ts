/**
 * Media assets — image or video — uploaded into a slide slot.
 *
 * Images persist as data URLs (small enough to localStorage).
 * Videos use object URLs and live only for the session — they're stripped
 * from persisted state on save and need to be re-uploaded after reload.
 */
export type ImageAsset = {
  kind: "image";
  url: string;
  mime: string;
  naturalW: number;
  naturalH: number;
};

export type VideoAsset = {
  kind: "video";
  url: string;
  mime: string;
  naturalW: number;
  naturalH: number;
  durationSec: number;
};

export type Asset = ImageAsset | VideoAsset;

export function isVideoAsset(a: Asset | null | undefined): a is VideoAsset {
  return !!a && a.kind === "video";
}

export function isImageAsset(a: Asset | null | undefined): a is ImageAsset {
  return !!a && a.kind === "image";
}

export function isVideoFile(file: File): boolean {
  return file.type.startsWith("video/");
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function readImageDimensions(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

function readVideoMetadata(
  url: string,
): Promise<{ w: number; h: number; durationSec: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      const durationSec = Number.isFinite(video.duration) ? video.duration : 0;
      resolve({
        w: video.videoWidth,
        h: video.videoHeight,
        durationSec,
      });
    };
    video.onerror = () => reject(new Error("Failed to read video metadata"));
    video.src = url;
  });
}

export async function fileToAsset(file: File): Promise<Asset> {
  if (isVideoFile(file)) {
    const url = URL.createObjectURL(file);
    const { w, h, durationSec } = await readVideoMetadata(url);
    return {
      kind: "video",
      url,
      mime: file.type,
      naturalW: w,
      naturalH: h,
      durationSec,
    };
  }
  if (isImageFile(file)) {
    const url = await fileToDataUrl(file);
    const { w, h } = await readImageDimensions(url);
    return {
      kind: "image",
      url,
      mime: file.type || "image/png",
      naturalW: w,
      naturalH: h,
    };
  }
  throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
}

/** Revoke an object URL when an asset is replaced/removed. Safe to call on data URLs. */
export function releaseAsset(asset: Asset | null | undefined) {
  if (!asset) return;
  if (asset.url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(asset.url);
    } catch {}
  }
}
