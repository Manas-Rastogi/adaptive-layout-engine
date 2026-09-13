import type {
  AdElement,
  ResolvedElement,
  SurfaceProfile
} from "../types/layout";

import {
  fitsInsideSurface,
  respectsMinimumSize
} from "./constraints";

import { hasCollision } from "./collision";

export type LayoutMode =
  | "vertical"
  | "horizontal"
  | "balanced";

const GAP = 16;
const SEARCH_STEP = 8;

/*
 Creates the final resolved element.
 */
function createCandidate(
  element: AdElement,
  x: number,
  y: number,
  width: number,
  height: number,
  surface: SurfaceProfile
): ResolvedElement {
  let fontSize: number | undefined;

  if (element.type === "text") {
    const preferredFont =
      element.preferredFontSize ?? 16;

    const scale =
      element.preferredWidth > 0
        ? width / element.preferredWidth
        : 1;

    fontSize = Math.max(
      surface.minTextSize,
      preferredFont * scale
    );
  }

  return {
    id: element.id,

    x,
    y,

    width,
    height,

    visible: true,

    scale:
      element.preferredWidth > 0
        ? width / element.preferredWidth
        : 1,

    fontSize
  };
}

/*
 Checks every hard constraint.
 */
function isValidCandidate(
  candidate: ResolvedElement,
  surface: SurfaceProfile,
  placed: ResolvedElement[]
): boolean {
  if (
    !fitsInsideSurface(
      candidate,
      surface
    )
  ) {
    return false;
  }

  if (
    hasCollision(
      candidate,
      placed
    )
  ) {
    return false;
  }

  return true;
}

/*
 Generates possible sizes.
 
 We try preferred size first.
 If it does not fit, we progressively shrink.
 */
function getSizeCandidates(
  element: AdElement,
  surface: SurfaceProfile
) {
  const scales = [
    1,
    0.9,
    0.8,
    0.7,
    0.6
  ];

  const sizes: {
    width: number;
    height: number;
  }[] = [];

  const aspectRatio =
    element.preferredWidth /
    element.preferredHeight;

  for (const scale of scales) {
    let width =
      element.preferredWidth * scale;

    let height =
      element.preferredHeight * scale;

    /*
     Never go below the element's
     minimum dimensions.
     */
    width = Math.max(
      width,
      element.minWidth
    );

    height = Math.max(
      height,
      element.minHeight
    );

    /*
     * For buttons on touch surfaces,
     * minimum tap target is a hard constraint.
     */
    if (
      element.type === "button" &&
      surface.touchOnly
    ) {
      width = Math.max(
        width,
        surface.minTapTarget
      );

      height = Math.max(
        height,
        surface.minTapTarget
      );
    }

    /*
      Preserve preferred aspect ratio
      when possible.
     */
    if (
      element.type === "image"
    ) {
      if (
        width / height !==
        aspectRatio
      ) {
        height =
          width /
          aspectRatio;
      }

      if (
        height <
        element.minHeight
      ) {
        height =
          element.minHeight;

        width =
          height *
          aspectRatio;
      }
    }

    if (
      respectsMinimumSize(
        element,
        width,
        height,
        surface
      )
    ) {
      sizes.push({
        width,
        height
      });
    }
  }

  /*
    Remove duplicate sizes.
   */
  return sizes.filter(
    (size, index, array) =>
      index ===
      array.findIndex(
        (other) =>
          Math.abs(
            other.width -
              size.width
          ) < 0.1 &&
          Math.abs(
            other.height -
              size.height
          ) < 0.1
      )
  );
}

/*
  Generates candidate positions over
 the entire safe area.
 
 This is the important fix.
 
  We do NOT hardcode:
  mobile portrait
  mobile landscape
  broadcast
  kiosk
 
 Instead, the search space is derived
  from the surface dimensions.
 */
function generatePositions(
  mode: LayoutMode,
  width: number,
  height: number,
  surface: SurfaceProfile
) {
  const left =
    surface.safeArea.left;

  const top =
    surface.safeArea.top;

  const right =
    surface.width -
    surface.safeArea.right -
    width;

  const bottom =
    surface.height -
    surface.safeArea.bottom -
    height;

  if (
    right < left ||
    bottom < top
  ) {
    return [];
  }

  const positions: {
    x: number;
    y: number;
  }[] = [];

  /*
   * Generate the entire valid search area.
   */
  for (
    let y = top;
    y <= bottom;
    y += SEARCH_STEP
  ) {
    for (
      let x = left;
      x <= right;
      x += SEARCH_STEP
    ) {
      positions.push({
        x,
        y
      });
    }
  }

  /*
   * Change search ordering according
   * to the geometry of the surface.
   *
   * The resolver still does NOT know
   * surface names.
   */

  if (mode === "vertical") {
    /*
     * Prefer upper/central positions.
     */
    positions.sort(
      (a, b) => {
        const centerX =
          surface.width / 2;

        const distanceA =
          Math.abs(
            a.x + width / 2 -
              centerX
          );

        const distanceB =
          Math.abs(
            b.x + width / 2 -
              centerX
          );

        if (
          Math.abs(
            distanceA -
              distanceB
          ) > 1
        ) {
          return (
            distanceA -
            distanceB
          );
        }

        return a.y - b.y;
      }
    );
  }

  if (mode === "horizontal") {
    /*
     * Prefer left-to-right
     * wide composition.
     */
    positions.sort(
      (a, b) => {
        const centerY =
          surface.height / 2;

        const distanceA =
          Math.abs(
            a.y + height / 2 -
              centerY
          );

        const distanceB =
          Math.abs(
            b.y + height / 2 -
              centerY
          );

        if (
          Math.abs(
            distanceA -
              distanceB
          ) > 1
        ) {
          return (
            distanceA -
            distanceB
          );
        }

        return a.x - b.x;
      }
    );
  }

  if (mode === "balanced") {
    /*
     * Prefer positions close to
     * the center for square surfaces.
     */
    const centerX =
      surface.width / 2;

    const centerY =
      surface.height / 2;

    positions.sort(
      (a, b) => {
        const distanceA =
          Math.hypot(
            a.x +
              width / 2 -
              centerX,
            a.y +
              height / 2 -
              centerY
          );

        const distanceB =
          Math.hypot(
            b.x +
              width / 2 -
              centerX,
            b.y +
              height / 2 -
              centerY
          );

        return (
          distanceA -
          distanceB
        );
      }
    );
  }

  return positions;
}

/*
 * Determines the layout strategy
 * from surface geometry.
 */
export function getLayoutMode(
  surface: SurfaceProfile
): LayoutMode {
  const ratio =
    surface.width /
    surface.height;

  if (ratio < 0.8) {
    return "vertical";
  }

  if (ratio > 2) {
    return "horizontal";
  }

  return "balanced";
}

/*
 * Main placement function.
 *
 * Algorithm:
 *
 * 1. Try preferred size.
 * 2. Search valid positions.
 * 3. If impossible, shrink.
 * 4. Search again.
 * 5. Return null if no legal placement exists.
 */
export function findPlacement(
  element: AdElement,
  mode: LayoutMode,
  surface: SurfaceProfile,
  placed: ResolvedElement[]
): ResolvedElement | null {
  const sizes =
    getSizeCandidates(
      element,
      surface
    );

  for (const size of sizes) {
    const positions =
      generatePositions(
        mode,
        size.width,
        size.height,
        surface
      );

    for (const position of positions) {
      const candidate =
        createCandidate(
          element,

          position.x,
          position.y,

          size.width,
          size.height,

          surface
        );

      if (
        isValidCandidate(
          candidate,
          surface,
          placed
        )
      ) {
        return candidate;
      }
    }
  }

  return null;
}

export { GAP };