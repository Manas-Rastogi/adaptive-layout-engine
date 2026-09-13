export type ElementType = "text" | "image" | "button";

export type ElementRole =
  | "primary"
  | "hero"
  | "action"
  | "branding"
  | "secondary";

export interface AdElement {
  id: string;
  type: ElementType;
  role: ElementRole;
  priority: number;

  preferredWidth: number;
  preferredHeight: number;

  minWidth: number;
  minHeight: number;

  content: string;

  preferredFontSize?: number;
  minFontSize?: number;
}

export interface AdSpec {
  elements: AdElement[];
}

export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SurfaceProfile {
  width: number;
  height: number;

  minTextSize: number;
  minTapTarget: number;

  viewingDistance: number;
  touchOnly: boolean;

  safeArea: SafeArea;
}

export interface ResolvedElement {
  id: string;

  x: number;
  y: number;

  width: number;
  height: number;

  visible: boolean;

  fontSize?: number;
}

export interface ResolutionError {
  elementId?: string;
  message: string;
}

export type ResolveResult =
  | {
      success: true;
      layout: ResolvedElement[];
      warnings: string[];
    }
  | {
      success: false;
      layout: ResolvedElement[];
      errors: ResolutionError[];
    };