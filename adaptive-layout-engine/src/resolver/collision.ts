import type { ResolvedElement } from "../types/layout";

export function overlaps(
  a: ResolvedElement,
  b: ResolvedElement
): boolean {
  if (!a.visible || !b.visible) {
    return false;
  }

  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function hasCollision(
  element: ResolvedElement,
  placed: ResolvedElement[]
): boolean {
  return placed.some((other) =>
    overlaps(element, other)
  );
}