"use client";

import { useEffect, useState } from "react";
import { Draggable } from "@/components/Draggable";
import { shadowCSS } from "@/lib/shadow";
import {
  ArrowGlyph,
  CategoryBadge,
  LogoBlock,
  computePanBounds,
  headlineGradientStyle,
  useImagePan,
  useTemplateContext,
  useTextColors,
} from "./shared";
import { HalftoneBg } from "./HalftoneBg";
import type { ImagePanId } from "@/lib/types";

export function TemplateA() {
  const {
    sz,
    headline,
    subtext,
    source,
    image1,
    image2,
    accent,
    fs,
    shadow,
    lineHeights,
    imageBox,
    halftone,
  } = useTemplateContext();

  const pad = Math.round(sz.w * 0.052);
  const headlinePx = Math.round(sz.w * 0.082);
  const subtextPx = Math.round(sz.w * 0.026);
  const sourcePx = Math.round(sz.w * 0.018);
  const arrowSize = Math.round(sz.w * 0.062);

  const gridGap = pad * 0.44;
  const colWidth = (sz.w - pad * 2 - gridGap) / 2;
  const colHeight = colWidth * 1.18 * imageBox.heightMul;

  const colors = useTextColors({
    headline: "#000000",
    subtext: "#808080",
    source: "#999999",
    stripe: "#000000",
  });

  return (
    <div
      style={{
        width: sz.w,
        height: sz.h,
        background: "#FFFFFF",
        color: "#000000",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <HalftoneBg width={sz.w} height={sz.h} state={halftone} />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${pad * 0.55}px ${pad}px`,
        }}
      >
        <Draggable id="logo">
          <LogoBlock fontPx={{ name: 30, handle: 22 }} />
        </Draggable>
        <Draggable id="badge">
          <CategoryBadge fontPx={20} />
        </Draggable>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `${colWidth}px ${colWidth}px`,
          gap: gridGap,
          padding: `${pad * 0.2}px ${pad}px`,
          marginTop: pad * 0.1,
          justifyContent: "space-between",
        }}
      >
        <Draggable id="image1" block style={{ width: colWidth }}>
          <ImageCard
            src={image1}
            index={1}
            panId="image1"
            boxW={colWidth}
            boxH={colHeight}
          />
        </Draggable>
        <Draggable id="image2" block style={{ width: colWidth }}>
          <ImageCard
            src={image2}
            index={2}
            panId="image2"
            boxW={colWidth}
            boxH={colHeight}
          />
        </Draggable>
      </div>

      <div
        style={{
          marginTop: "auto",
          padding: `${pad * 0.4}px ${pad}px ${pad * 0.85}px`,
          display: "flex",
          flexDirection: "column",
          gap: pad * 0.35,
        }}
      >
        <Draggable id="headline" block>
          <h1
            style={{
              fontFamily: fs.display.var,
              fontWeight: fs.display.weight,
              letterSpacing: `${fs.display.tracking}em`,
              lineHeight: lineHeights.headline,
              fontSize: headlinePx,
              margin: 0,
              maxWidth: sz.w * 0.92,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              hyphens: "auto",
              textShadow: shadowCSS(shadow, accent, headlinePx),
              ...headlineGradientStyle(colors.headline),
            }}
          >
            {headline}
          </h1>
        </Draggable>
        <Draggable id="stripe" block>
          <div
            style={{
              height: 1,
              background: colors.stripe,
              opacity: 0.85,
              width: "100%",
            }}
          />
        </Draggable>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: pad * 0.6,
          }}
        >
          <Draggable
            id="subtext"
            block
            style={{ flex: 1, maxWidth: sz.w * 0.78 }}
          >
            <p
              style={{
                fontFamily: fs.body.var,
                fontWeight: fs.body.weight,
                letterSpacing: -0.005,
                lineHeight: lineHeights.subtext,
                fontSize: subtextPx,
                color: colors.subtext,
                margin: 0,
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                textShadow: shadowCSS(shadow, accent, subtextPx),
              }}
            >
              {subtext}
            </p>
            {source ? (
              <p
                style={{
                  fontFamily: fs.body.var,
                  fontWeight: 600,
                  fontSize: sourcePx,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                  color: colors.source,
                  marginTop: pad * 0.22,
                  marginBottom: 0,
                }}
              >
                {source}
              </p>
            ) : null}
          </Draggable>
          <Draggable id="arrow">
            <ArrowGlyph size={arrowSize} color={colors.headline} />
          </Draggable>
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  src,
  index,
  panId,
  boxW,
  boxH,
}: {
  src: string | null;
  index: number;
  panId: ImagePanId;
  boxW: number;
  boxH: number;
}) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) {
        setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      }
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  const bounds = src && natural
    ? computePanBounds(boxW, boxH, natural.w, natural.h)
    : null;

  const { pan, onPointerDown, onPointerMove, onPointerUp } = useImagePan(
    panId,
    bounds,
  );

  return (
    <div
      style={{
        width: boxW,
        height: boxH,
        borderRadius: 24,
        overflow: "hidden",
        background: "#F2F2F2",
        border: "1px solid #EAEAEA",
        position: "relative",
      }}
    >
      {src ? (
        <div
          data-no-drag
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url("${src}")`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: `calc(50% + ${pan.x}px) calc(50% + ${pan.y}px)`,
            cursor: "grab",
            touchAction: "none",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            background:
              "repeating-linear-gradient(135deg, #F7F7F7, #F7F7F7 14px, #EFEFEF 14px, #EFEFEF 28px)",
          }}
        >
          <span
            style={{
              fontSize: 14,
              letterSpacing: 2,
              color: "#999",
              fontWeight: 600,
            }}
          >
            IMAGE {String(index).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 11, letterSpacing: 1.2, color: "#bbb" }}>
            DROP A SCREENSHOT
          </span>
        </div>
      )}
    </div>
  );
}
