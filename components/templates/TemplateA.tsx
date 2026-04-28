"use client";

import { Draggable } from "@/components/Draggable";
import { shadowCSS } from "@/lib/shadow";
import {
  ArrowGlyph,
  CategoryBadge,
  LogoBlock,
  MediaCover,
  getSafeInsets,
  headlineGradientStyle,
  useTemplateContext,
  useTextColors,
} from "./shared";
import { HalftoneBg } from "./HalftoneBg";
import type { ImagePanId } from "@/lib/types";
import type { Asset } from "@/lib/media";

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
  const safe = getSafeInsets(sz);

  const layout = imageBox.layout ?? "grid";
  const gridGap = pad * 0.44;
  const fullW = sz.w - pad * 2;
  const colWidth = layout === "grid" ? (fullW - gridGap) / 2 : fullW;
  const colHeight =
    layout === "grid"
      ? colWidth * 1.18 * imageBox.heightMul
      : fullW * 0.45 * imageBox.heightMul;

  const colors = useTextColors({
    headline: "#000000",
    subtext: "#808080",
    source: "#999999",
    stripe: "#000000",
  });

  return (
    <div
      data-template-root="A"
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
        paddingTop: safe.top,
        paddingBottom: safe.bottom,
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
          gridTemplateColumns:
            layout === "grid" ? `${colWidth}px ${colWidth}px` : `${colWidth}px`,
          gap: gridGap,
          padding: `${pad * 0.2}px ${pad}px`,
          marginTop: pad * 0.1,
          justifyContent: layout === "grid" ? "space-between" : "center",
        }}
      >
        <Draggable id="image1" block style={{ width: colWidth }}>
          <ImageCard
            asset={image1}
            index={1}
            panId="image1"
            boxW={colWidth}
            boxH={colHeight}
          />
        </Draggable>
        <Draggable id="image2" block style={{ width: colWidth }}>
          <ImageCard
            asset={image2}
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
  asset,
  index,
  panId,
  boxW,
  boxH,
}: {
  asset: Asset | null;
  index: number;
  panId: ImagePanId;
  boxW: number;
  boxH: number;
}) {
  return (
    <div
      data-media-card={panId}
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
      {asset ? (
        <MediaCover asset={asset} panId={panId} boxW={boxW} boxH={boxH} />
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
            MEDIA {String(index).padStart(2, "0")}
          </span>
          <span style={{ fontSize: 11, letterSpacing: 1.2, color: "#bbb" }}>
            DROP IMAGE OR VIDEO
          </span>
        </div>
      )}
    </div>
  );
}
