export type Rect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

export type Guide = {
  axis: "x" | "y"; // x = vertical line (snaps along x-coord), y = horizontal line
  coord: number; // canvas-coord position of the line
  kind: "center" | "edge";
};

const SNAP_THRESHOLD = 14; // canvas pixels
const PAD_RATIO = 0.052; // matches templates' inner padding

export function snapDelta(
  initialRect: Rect,
  rawDeltaX: number,
  rawDeltaY: number,
  canvasW: number,
  canvasH: number,
): { dx: number; dy: number; guides: Guide[] } {
  const pad = canvasW * PAD_RATIO;

  const xCandidates: { coord: number; kind: Guide["kind"] }[] = [
    { coord: 0, kind: "edge" },
    { coord: pad, kind: "edge" },
    { coord: canvasW / 2, kind: "center" },
    { coord: canvasW - pad, kind: "edge" },
    { coord: canvasW, kind: "edge" },
  ];
  const yCandidates: { coord: number; kind: Guide["kind"] }[] = [
    { coord: 0, kind: "edge" },
    { coord: pad, kind: "edge" },
    { coord: canvasH / 2, kind: "center" },
    { coord: canvasH - pad, kind: "edge" },
    { coord: canvasH, kind: "edge" },
  ];

  const propLeft = initialRect.left + rawDeltaX;
  const propRight = initialRect.right + rawDeltaX;
  const propCx = initialRect.centerX + rawDeltaX;
  const propTop = initialRect.top + rawDeltaY;
  const propBottom = initialRect.bottom + rawDeltaY;
  const propCy = initialRect.centerY + rawDeltaY;

  let bestX: { dist: number; fix: number; guide: Guide | null } = {
    dist: SNAP_THRESHOLD,
    fix: 0,
    guide: null,
  };
  let bestY: { dist: number; fix: number; guide: Guide | null } = {
    dist: SNAP_THRESHOLD,
    fix: 0,
    guide: null,
  };

  for (const c of xCandidates) {
    const checks = [propLeft, propRight, propCx];
    for (const pos of checks) {
      const d = Math.abs(pos - c.coord);
      if (d < bestX.dist) {
        bestX = {
          dist: d,
          fix: c.coord - pos,
          guide: { axis: "x", coord: c.coord, kind: c.kind },
        };
      }
    }
  }

  for (const c of yCandidates) {
    const checks = [propTop, propBottom, propCy];
    for (const pos of checks) {
      const d = Math.abs(pos - c.coord);
      if (d < bestY.dist) {
        bestY = {
          dist: d,
          fix: c.coord - pos,
          guide: { axis: "y", coord: c.coord, kind: c.kind },
        };
      }
    }
  }

  const guides: Guide[] = [];
  if (bestX.guide) guides.push(bestX.guide);
  if (bestY.guide) guides.push(bestY.guide);

  return {
    dx: rawDeltaX + bestX.fix,
    dy: rawDeltaY + bestY.fix,
    guides,
  };
}

export function rectFromElement(
  el: HTMLElement,
  canvasEl: HTMLElement,
  scale: number,
): Rect {
  const elRect = el.getBoundingClientRect();
  const cRect = canvasEl.getBoundingClientRect();
  const left = (elRect.left - cRect.left) / scale;
  const top = (elRect.top - cRect.top) / scale;
  const width = elRect.width / scale;
  const height = elRect.height / scale;
  return {
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
    centerX: left + width / 2,
    centerY: top + height / 2,
  };
}
