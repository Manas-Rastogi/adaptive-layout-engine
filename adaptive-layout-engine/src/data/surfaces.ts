import type { SurfaceProfile } from "../types/layout";

export const surfaces = {
  mobilePortrait: {
    width: 320,
    height: 480,

    minTextSize: 16,
    minTapTarget: 44,

    viewingDistance: 0.4,
    touchOnly: true,

    safeArea: {
      top: 20,
      right: 16,
      bottom: 20,
      left: 16
    }
  },

  mobileLandscape: {
    width: 480,
    height: 320,

    minTextSize: 16,
    minTapTarget: 44,

    viewingDistance: 0.5,
    touchOnly: true,

    safeArea: {
      top: 16,
      right: 16,
      bottom: 16,
      left: 16
    }
  },

  broadcast: {
    width: 1920,
    height: 250,

    minTextSize: 32,
    minTapTarget: 0,

    viewingDistance: 5,
    touchOnly: false,

    safeArea: {
      top: 20,
      right: 40,
      bottom: 20,
      left: 40
    }
  },

  squareKiosk: {
    width: 1080,
    height: 1080,

    minTextSize: 20,
    minTapTarget: 60,

    viewingDistance: 1.5,
    touchOnly: true,

    safeArea: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40
    }
  }
} satisfies Record<string, SurfaceProfile>;