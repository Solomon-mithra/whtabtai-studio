"use client";

import { Draggable } from "@/components/Draggable";
import { shadowCSS } from "@/lib/shadow";
import {
  CategoryBadge,
  LogoBlock,
  headlineGradientStyle,
  useTemplateContext,
  useTextColors,
} from "./shared";
import { HalftoneBg } from "./HalftoneBg";

export function TemplateD() {
  const { sz, headline, subtext, cta, accent, acc, fs, shadow, lineHeights, halftone } =
    useTemplateContext();

  const pad = Math.round(sz.w * 0.052);
  const titlePx = Math.round(sz.w * 0.13);
  const subtextPx = Math.round(sz.w * 0.024);
  const badgePx = Math.round(sz.w * 0.02);

  // Template D has a dark background — defaults are light text.
  const colors = useTextColors({
    headline: "#FFFFFF",
    subtext: "#CFCFCF",
    source: "#9C9C9C",
    stripe: "#FFFFFF",
  });

  return (
    <div
      style={{
        width: sz.w,
        height: sz.h,
        background: "#050505",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      <HalftoneBg
        width={sz.w}
        height={sz.h}
        state={halftone}
        defaultColor="#FFFFFF"
      />
      <div
        style={{
          padding: `${pad}px ${pad}px 0`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Draggable id="badge">
          <CategoryBadge fontPx={badgePx} invert />
        </Draggable>
        <Draggable id="footer">
          <span
            style={{
              fontSize: badgePx * 0.85,
              letterSpacing: 1.6,
              textTransform: "uppercase",
              color: "#888",
              fontWeight: 600,
              fontFamily: "var(--font-inter)",
            }}
          >
            Cover · 01
          </span>
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
        <Draggable id="headline" block>
          <h1
            style={{
              fontFamily: fs.display.var,
              fontWeight: fs.display.weight,
              letterSpacing: `${fs.display.tracking}em`,
              lineHeight: lineHeights.headline,
              fontSize: titlePx,
              margin: 0,
              maxWidth: sz.w * 0.92,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
              hyphens: "auto",
              textShadow: shadowCSS(shadow, accent, titlePx),
              ...headlineGradientStyle(colors.headline),
            }}
          >
            {headline}
          </h1>
        </Draggable>
        <div
          style={{
            marginTop: pad * 0.6,
            display: "flex",
            alignItems: "center",
            gap: pad * 0.3,
            maxWidth: sz.w * 0.85,
          }}
        >
          <Draggable id="stripe">
            <span
              style={{
                display: "inline-block",
                width: pad * 1.4,
                height: 3,
                background: accent === "none" ? colors.stripe : acc.value,
              }}
            />
          </Draggable>
          <Draggable id="subtext" block style={{ flex: 1 }}>
            <span
              style={{
                display: "block",
                fontFamily: fs.body.var,
                fontWeight: fs.body.weight,
                letterSpacing: -0.005,
                fontSize: subtextPx,
                color: colors.subtext,
                lineHeight: lineHeights.subtext,
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

      <div
        style={{
          padding: `${pad * 0.6}px ${pad}px ${pad}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Draggable id="logo">
          <LogoBlock
            fontPx={{
              name: Math.round(sz.w * 0.026),
              handle: Math.round(sz.w * 0.018),
            }}
            invert
          />
        </Draggable>
        <Draggable id="cta">
          <span
            style={{
              fontFamily: fs.display.var,
              fontWeight: fs.display.weight,
              fontSize: Math.round(sz.w * 0.028),
              color: accent === "none" ? "#fff" : acc.value,
              letterSpacing: -0.005,
            }}
          >
            {cta || "Swipe →"}
          </span>
        </Draggable>
      </div>
    </div>
  );
}
