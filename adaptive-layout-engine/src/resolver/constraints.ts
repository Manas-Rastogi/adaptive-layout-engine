import type {
  AdElement,
  ResolvedElement,
  SurfaceProfile
} from "../types/layout";

export function getAvailableArea(
  surface: SurfaceProfile
) {
  return {
    width:
      surface.width -
      surface.safeArea.left -
      surface.safeArea.right,

    height:
      surface.height -
      surface.safeArea.top -
      surface.safeArea.bottom
  };
}

export function getMinimumFontSize(
  element: AdElement,
  surface: SurfaceProfile
): number {
  if (element.type !== "text") {
    return 0;
  }

  return Math.max(
    surface.minTextSize,
    element.preferredFontSize ?? 0
  );
}

export function respectsMinimumSize(
  element: AdElement,
  width: number,
  height: number,
  surface: SurfaceProfile
): boolean {
  if (
    width < element.minWidth ||
    height < element.minHeight
  ) {
    return false;
  }

  if (
    element.type === "button" &&
    surface.touchOnly &&
    (
      width < surface.minTapTarget ||
      height < surface.minTapTarget
    )
  ) {
    return false;
  }

  return true;
}

export function fitsInsideSurface(
  element: ResolvedElement,
  surface: SurfaceProfile
): boolean {
  const safeRight =
    surface.width -
    surface.safeArea.right;

  const safeBottom =
    surface.height -
    surface.safeArea.bottom;

  return (
    element.x >= surface.safeArea.left &&
    element.y >= surface.safeArea.top &&
    element.x + element.width <= safeRight &&
    element.y + element.height <= safeBottom
  );
}