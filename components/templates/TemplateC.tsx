"use client";

import { Draggable } from "@/components/Draggable";
import { shadowCSS } from "@/lib/shadow";
import {
  CategoryBadge,
  LogoBlock,
  getSafeInsets,
  headlineGradientStyle,
  useTemplateContext,
  useTextColors,
} from "./shared";
import { HalftoneBg } from "./HalftoneBg";

export function TemplateC() {
  const { sz, headline, subtext, accent, acc, fs, shadow, lineHeights, halftone } =
    useTemplateContext();

  const pad = Math.round(sz.w * 0.052);
  const quotePx = Math.round(sz.w * 0.115);
  const subtextPx = Math.round(sz.w * 0.025);
  const safe = getSafeInsets(sz);

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
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: `0 ${pad}px`,
          position: "relative",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -pad * 0.6,
            left: pad,
            fontSize: sz.w * 0.34,
            fontWeight: 900,
            lineHeight: 1,
            color: accent === "none" ? colors.headline : acc.value,
            opacity: 0.08,
            pointerEvents: "none",
            fontFamily: fs.display.var,
          }}
        >
          “
        </span>
        <Draggable id="headline" block>
          <h1
            style={{
              fontFamily: fs.display.var,
              fontWeight: fs.display.weight,
              letterSpacing: `${fs.display.tracking}em`,
              lineHeight: lineHeights.headline,
              fontSize: quotePx,
              margin: 0,
              maxWidth: sz.w * 0.92,
              position: "relative",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              hyphens: "auto",
              textShadow: shadowCSS(shadow, accent, quotePx),
              ...headlineGradientStyle(colors.headline),
            }}
          >
            {headline}
          </h1>
        </Draggable>
        <div
          style={{
            marginTop: pad * 0.7,
            display: "flex",
            alignItems: "center",
            gap: pad * 0.3,
          }}
        >
          <Draggable id="stripe">
            <span
              style={{
                display: "inline-block",
                width: pad * 1.4,
                height: 4,
                background: accent === "none" ? colors.stripe : acc.value,
              }}
            />
          </Draggable>
          <Draggable
            id="subtext"
            block
            style={{ flex: 1, maxWidth: sz.w * 0.78 }}
          >
            <span
              style={{
                display: "block",
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
            </span>
          </Draggable>
        </div>
      </div>

      <Draggable id="footer" block style={{ width: "100%" }}>
        <div
          style={{
            padding: `${pad * 0.55}px ${pad}px ${pad * 0.7}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #EAEAEA",
            fontFamily: "var(--font-inter)",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              fontSize: Math.round(sz.w * 0.018),
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#888",
            }}
          >
            Hot take · @whtabtai
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: Math.round(sz.w * 0.02),
              letterSpacing: 1.4,
              textTransform: "uppercase",
              color: "#000",
            }}
          >
            AI news without the noise
          </span>
        </div>
      </Draggable>
    </div>
  );
}
