import type {
  AdElement,
  AdSpec,
  ResolvedElement,
  ResolveResult,
  SurfaceProfile
} from "../types/layout";

const WIDE_GAP = 32;
const DEFAULT_GAP = 16;

function getMode(surface: SurfaceProfile) {
  const width = surface.width - surface.safeArea.left - surface.safeArea.right;
  const height = surface.height - surface.safeArea.top - surface.safeArea.bottom;
  const ratio = width / height;

  if (ratio >= 2.0 && height <= 300) return "wide";
  if (ratio <= 0.85) return "portrait";
  return "balanced";
}

function overlaps(a: ResolvedElement, b: ResolvedElement, gap: number = 0): boolean {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

function fitsSurface(element: ResolvedElement, surface: SurfaceProfile): boolean {
  const right = surface.width - surface.safeArea.right;
  const bottom = surface.height - surface.safeArea.bottom;

  return (
    element.x >= surface.safeArea.left &&
    element.y >= surface.safeArea.top &&
    element.x + element.width <= right &&
    element.y + element.height <= bottom
  );
}

function fitsWithoutOverlap(
  candidate: ResolvedElement,
  placed: ResolvedElement[],
  surface: SurfaceProfile,
  currentGap: number
): boolean {
  if (!fitsSurface(candidate, surface)) return false;
  return !placed.some((item) => item.visible && overlaps(candidate, item, currentGap));
}

function getFontSize(element: AdElement, surface: SurfaceProfile, scale: number) {
  if (element.type !== "text") return undefined;
  const preferred = element.preferredFontSize ?? surface.minTextSize;
  const minimum = Math.max(element.minFontSize ?? 0, surface.minTextSize);
  return Math.max(Math.round(preferred * scale), minimum);
}

function getSize(element: AdElement, surface: SurfaceProfile, scale: number) {
  let width = element.preferredWidth * scale;
  let height = element.preferredHeight * scale;

  if (element.type === "text") {
    const fontSize = getFontSize(element, surface, scale) || surface.minTextSize;
    const minTextWidth = fontSize * 5;
    width = Math.max(width, minTextWidth);
  }

  width = Math.max(width, element.minWidth);
  height = Math.max(height, element.minHeight);

  if (element.type === "button" && surface.touchOnly) {
    width = Math.max(width, surface.minTapTarget);
    height = Math.max(height, surface.minTapTarget);
  }

  const maxWidth = surface.width - surface.safeArea.left - surface.safeArea.right;
  const maxHeight = surface.height - surface.safeArea.top - surface.safeArea.bottom;

  return {
    width: Math.round(Math.min(width, maxWidth)),
    height: Math.round(Math.min(height, maxHeight))
  };
}

function generatePositions(
  mode: string,
  surface: SurfaceProfile,
  width: number,
  height: number,
  placed: ResolvedElement[] = []
) {
  const left = surface.safeArea.left;
  const top = surface.safeArea.top;
  const right = surface.width - surface.safeArea.right;
  const bottom = surface.height - surface.safeArea.bottom;

  const centerY = top + (bottom - top - height) / 2;
  const positions: { x: number; y: number }[] = [];
  const visiblePlaced = placed.filter((p) => p.visible);

  if (mode === "wide") {
    let nextX = left;
    if (visiblePlaced.length > 0) {
      const last = visiblePlaced[visiblePlaced.length - 1];
      nextX = last.x + last.width + WIDE_GAP;
    }
    positions.push({ x: nextX, y: centerY });
  } else {
    if (visiblePlaced.length === 0) {
      positions.push({ x: left, y: top });
    } else {
      const last = visiblePlaced[visiblePlaced.length - 1];
      const currentRowY = last.y;
      const currentRowElements = visiblePlaced.filter((p) => p.y === currentRowY);
      
      const MAX_ITEMS_PER_ROW = mode === "balanced" ? 3 : 2;
      let nextX = last.x + last.width + DEFAULT_GAP;
      let nextY = last.y;

      if (nextX + width > right || currentRowElements.length >= MAX_ITEMS_PER_ROW) {
        nextX = left;
        const maxRowHeight = Math.max(...currentRowElements.map((p) => p.height));
        nextY = currentRowY + maxRowHeight + DEFAULT_GAP;
      }
      positions.push({ x: nextX, y: nextY });
    }
  }

  return positions;
}

function tryPlace(
  element: AdElement,
  surface: SurfaceProfile,
  placed: ResolvedElement[],
  mode: string
): ResolvedElement | null {
  const scales = [1, 0.95, 0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.5, 0.4];
  const activeGap = mode === "wide" ? WIDE_GAP : DEFAULT_GAP;

  for (const scale of scales) {
    const { width, height } = getSize(element, surface, scale);
    const positions = generatePositions(mode, surface, width, height, placed);

    for (const position of positions) {
      const candidate: ResolvedElement = {
        id: element.id,
        x: Math.round(position.x),
        y: Math.round(position.y),
        width,
        height,
        visible: true,
        fontSize: getFontSize(element, surface, scale)
      };

      if (fitsWithoutOverlap(candidate, placed, surface, activeGap)) {
        return candidate;
      }
    }
  }

  return null;
}

export function resolve(ad: AdSpec, surface: SurfaceProfile): ResolveResult {
  if (surface.width <= 0 || surface.height <= 0) {
    return {
      success: false,
      layout: [],
      errors: [{ message: "Surface dimensions must be positive." }]
    };
  }

  const mode = getMode(surface);
  const sorted = mode === "wide" 
    ? [...ad.elements] 
    : [...ad.elements].sort((a, b) => a.priority - b.priority);

  const placed: ResolvedElement[] = [];
  const warnings: string[] = [];
  const errors: { elementId?: string; message: string }[] = [];

  for (const element of sorted) {
    const result = tryPlace(element, surface, placed, mode);

    if (result) {
      placed.push(result);
      continue;
    }

    if (element.priority <= 2) {
      errors.push({
        elementId: element.id,
        message: "Could not place this high-priority element without violating hard constraints."
      });
      continue;
    }

    warnings.push(`${element.id} was dropped because available space was insufficient.`);
    placed.push({
      id: element.id,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      visible: false
    });
  }

  if (errors.length > 0) {
    return { success: false, layout: placed, errors };
  }

  return { success: true, layout: placed, warnings };
}