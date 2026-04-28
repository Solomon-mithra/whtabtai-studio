"use client";

import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import type { ImagePanId, SlideState } from "./types";
import type { VideoAsset } from "./media";
import { isVideoAsset } from "./media";
import { nodeToOverlayBlobWithHoles, type OverlayHole } from "./export";

/**
 * Border radius for the rounded video card in canvas pixels. Templates A and B
 * both use `borderRadius: 24` on the card div at canvas-native scale, so the
 * punched hole matches the visible shape exactly.
 */
const CARD_RADIUS = 24;

// All ffmpeg runtime files are self-hosted under /public/ffmpeg/ — staged by
// scripts/copy-ffmpeg-worker.mjs (postinstall). The wasm core is ~31MB; serving
// it from this origin instead of unpkg makes "Loading encoder" finish in
// hundreds of ms instead of tens of seconds. Self-hosting the worker also
// dodges Turbopack's "expression too dynamic" failure on the worker's runtime
// `await import(coreURL)` — the worker isn't part of the bundle graph.
//
// classWorkerURL must be ABSOLUTE: under Turbopack, the bundled @ffmpeg/ffmpeg
// module gets a `file://` import.meta.url, so a relative URL like
// "/ffmpeg/worker.js" resolves to `file:///ffmpeg/worker.js` and the Worker
// constructor refuses cross-origin loads. We resolve against the page origin
// at call time instead.
const FFMPEG_PATHS = {
  worker: "/ffmpeg/worker.js",
  core: "/ffmpeg/ffmpeg-core.js",
  wasm: "/ffmpeg/ffmpeg-core.wasm",
} as const;

function absoluteUrl(path: string): string {
  return new URL(path, window.location.origin).toString();
}

let ffmpegPromise: Promise<FFmpeg> | null = null;

/** Lazy-load + cache a single ffmpeg.wasm instance for the session. */
async function getFFmpeg(onLog?: (msg: string) => void): Promise<FFmpeg> {
  if (ffmpegPromise) {
    const ff = await ffmpegPromise;
    if (onLog) ff.on("log", ({ message }) => onLog(message));
    return ff;
  }
  ffmpegPromise = (async () => {
    const ff = new FFmpeg();
    if (onLog) ff.on("log", ({ message }) => onLog(message));
    const workerURL = absoluteUrl(FFMPEG_PATHS.worker);
    console.log("[ffmpeg-load] worker:", workerURL);
    await ff.load({
      classWorkerURL: workerURL,
      coreURL: await toBlobURL(absoluteUrl(FFMPEG_PATHS.core), "text/javascript"),
      wasmURL: await toBlobURL(absoluteUrl(FFMPEG_PATHS.wasm), "application/wasm"),
    });
    return ff;
  })();
  return ffmpegPromise;
}

export function slideHasVideo(slide: SlideState): boolean {
  return isVideoAsset(slide.image1) || isVideoAsset(slide.image2);
}

/** Geometry for one video slot in canvas coordinates, plus its pan offset. */
type VideoSlotGeom = {
  slotId: ImagePanId;
  asset: VideoAsset;
  x: number;
  y: number;
  w: number;
  h: number;
  panX: number;
  panY: number;
};

/**
 * Locate every video slot inside a rendered slide and convert its bounding rect
 * into canvas (unscaled) coordinates. Works whether the slide is drawn at full
 * size or scaled in the preview, by ratio-mapping against the slide root.
 */
function findVideoSlots(
  slideRoot: HTMLElement,
  slide: SlideState,
  canvasW: number,
  canvasH: number,
): VideoSlotGeom[] {
  const rootRect = slideRoot.getBoundingClientRect();
  if (rootRect.width === 0 || rootRect.height === 0) return [];
  const scaleX = canvasW / rootRect.width;
  const scaleY = canvasH / rootRect.height;

  const result: VideoSlotGeom[] = [];
  const cards = slideRoot.querySelectorAll<HTMLElement>("[data-media-card]");
  cards.forEach((card) => {
    const slotId = card.getAttribute("data-media-card") as ImagePanId | null;
    if (slotId !== "image1" && slotId !== "image2") return;
    const asset = slide[slotId];
    if (!isVideoAsset(asset)) return;
    const r = card.getBoundingClientRect();
    const pan = slide.imagePan[slotId] ?? { x: 0, y: 0 };
    result.push({
      slotId,
      asset,
      x: Math.round((r.left - rootRect.left) * scaleX),
      y: Math.round((r.top - rootRect.top) * scaleY),
      w: Math.round(r.width * scaleX),
      h: Math.round(r.height * scaleY),
      panX: Math.round(pan.x * scaleX),
      panY: Math.round(pan.y * scaleY),
    });
  });
  return result;
}

async function blobFromUrl(url: string): Promise<Uint8Array> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new Uint8Array(buf);
}

/**
 * Build the ffmpeg filter chain that scales/crops/positions each video, then
 * lays the transparent overlay PNG on top. The overlay PNG is the last input.
 *
 * For object-fit:cover, scale-by-largest then crop from center; pan offsets
 * shift the crop origin. Audio from each video is mixed when more than one
 * has audio; -map flags are added by the caller.
 */
function buildFilterGraph(
  slots: VideoSlotGeom[],
  canvasW: number,
  canvasH: number,
  duration: number,
  overlayInputIdx: number,
): string {
  const parts: string[] = [];
  parts.push(`color=c=white:s=${canvasW}x${canvasH}:d=${duration}[bg]`);

  let lastBase = "[bg]";
  slots.forEach((s, i) => {
    const cropX = `(in_w-${s.w})/2-(${s.panX})`;
    const cropY = `(in_h-${s.h})/2-(${s.panY})`;
    parts.push(
      `[${i}:v]scale=${s.w}:${s.h}:force_original_aspect_ratio=increase,` +
        `crop=${s.w}:${s.h}:${cropX}:${cropY},setsar=1[v${i}]`,
    );
    const next = i === slots.length - 1 ? "[base]" : `[base${i}]`;
    parts.push(`${lastBase}[v${i}]overlay=${s.x}:${s.y}${next}`);
    lastBase = next;
  });

  parts.push(`[${overlayInputIdx}:v]format=rgba[over]`);
  parts.push(`[base][over]overlay=0:0:format=auto[outv]`);

  return parts.join(";");
}

/**
 * Render a slide that contains at least one video asset to an MP4 blob.
 *
 * - Two videos of different lengths: target duration = the longer; the shorter
 *   loops (-stream_loop -1) and is trimmed at -t.
 * - Audio from every video input is preserved; multiple tracks get mixed.
 * - Single video: just trimmed to its own duration.
 */
/**
 * Progress phases reported back to the caller. `ratio` is 0..1 when known;
 * undefined for indeterminate phases like "loading encoder" or "reading inputs".
 */
export type ExportProgress = {
  phase: "loading" | "reading" | "overlay" | "encoding" | "finalizing";
  label: string;
  ratio?: number;
};

export async function exportSlideAsMp4(opts: {
  node: HTMLElement;
  size: { w: number; h: number };
  slide: SlideState;
  onLog?: (msg: string) => void;
  onProgress?: (p: ExportProgress) => void;
}): Promise<Blob> {
  const { node, size, slide, onLog, onProgress } = opts;
  const slots = findVideoSlots(node, slide, size.w, size.h);
  if (slots.length === 0) {
    throw new Error("exportSlideAsMp4 called with no video slots");
  }

  const duration = Math.max(...slots.map((s) => s.asset.durationSec || 1));

  onProgress?.({ phase: "loading", label: "Loading encoder" });
  const ff = await getFFmpeg(onLog);

  // ffmpeg's progress event fires during exec with { progress: 0..1, time }.
  // Subscribe once per export — store the listener so we can detach after.
  const progressListener = ({ progress }: { progress: number; time: number }) => {
    if (!onProgress) return;
    const ratio = Math.min(1, Math.max(0, progress));
    onProgress({ phase: "encoding", label: "Encoding", ratio });
  };
  ff.on("progress", progressListener);

  try {
    onProgress?.({ phase: "reading", label: "Reading clips" });
    const inputNames: string[] = [];
    for (let i = 0; i < slots.length; i++) {
      const name = `in${i}.${slots[i].asset.mime.includes("webm") ? "webm" : "mp4"}`;
      inputNames.push(name);
      const data = await blobFromUrl(slots[i].asset.url);
      await ff.writeFile(name, data);
    }

    onProgress?.({ phase: "overlay", label: "Rendering overlay" });
    const holes: OverlayHole[] = slots.map((s) => ({
      x: s.x,
      y: s.y,
      w: s.w,
      h: s.h,
      radius: CARD_RADIUS,
    }));
    const overlayBlob = await nodeToOverlayBlobWithHoles(
      node,
      size.w,
      size.h,
      holes,
    );
    const overlayBytes = new Uint8Array(await overlayBlob.arrayBuffer());
    await ff.writeFile("overlay.png", overlayBytes);

    const filter = buildFilterGraph(
      slots,
      size.w,
      size.h,
      duration,
      slots.length,
    );
    const audioMaps: string[] = [];
    for (let i = 0; i < slots.length; i++) audioMaps.push("-map", `${i}:a?`);

    const args: string[] = [];
    for (let i = 0; i < slots.length; i++) {
      args.push(
        "-stream_loop",
        "-1",
        "-t",
        String(duration),
        "-i",
        inputNames[i],
      );
    }
    args.push("-i", "overlay.png");
    args.push(
      "-filter_complex",
      filter,
      "-map",
      "[outv]",
      ...audioMaps,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-pix_fmt",
      "yuv420p",
      "-r",
      "30",
      "-c:a",
      "aac",
      "-t",
      String(duration),
      "-movflags",
      "+faststart",
      "out.mp4",
    );

    onProgress?.({ phase: "encoding", label: "Encoding", ratio: 0 });
    // ffmpeg-core sometimes prints "Aborted()" after libx264's final stats
    // line — emscripten's shutdown hooks fire after the MP4 trailer is already
    // on disk. Catch and try to read the output anyway; if the bytes are
    // there, the export succeeded despite the noisy exit.
    let execError: unknown = null;
    try {
      await ff.exec(args);
    } catch (err) {
      execError = err;
      console.warn("[ffmpeg] exec threw, will check for output file:", err);
    }

    onProgress?.({ phase: "finalizing", label: "Finalizing" });
    let out: Uint8Array | string;
    try {
      out = await ff.readFile("out.mp4");
    } catch (readErr) {
      if (execError) throw execError;
      throw readErr;
    }
    for (const name of inputNames) {
      try {
        await ff.deleteFile(name);
      } catch {}
    }
    try {
      await ff.deleteFile("overlay.png");
    } catch {}
    try {
      await ff.deleteFile("out.mp4");
    } catch {}

    if (typeof out === "string") {
      throw new Error("ffmpeg returned text instead of mp4 bytes");
    }
    return new Blob([out.slice().buffer], { type: "video/mp4" });
  } finally {
    ff.off("progress", progressListener);
  }
}
