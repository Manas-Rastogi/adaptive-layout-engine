import type { AdSpec } from "../types/layout";

export const adSpec: AdSpec = {
  elements: [
    {
      id: "headline",
      type: "text",
      role: "primary",
      priority: 1,

      preferredWidth: 280,
      preferredHeight: 60,

      minWidth: 180,
      minHeight: 40,

      content: "Summer Sale",

      preferredFontSize: 28,
      minFontSize: 18
    },

    {
      id: "product",
      type: "image",
      role: "hero",
      priority: 2,

      preferredWidth: 180,
      preferredHeight: 180,

      minWidth: 100,
      minHeight: 100,

      content: "PRODUCT"
    },

    {
      id: "cta",
      type: "button",
      role: "action",
      priority: 3,

      preferredWidth: 140,
      preferredHeight: 48,

      minWidth: 100,
      minHeight: 44,

      content: "BUY NOW"
    },

    {
      id: "price",
      type: "text",
      role: "secondary",
      priority: 4,

      preferredWidth: 100,
      preferredHeight: 40,

      minWidth: 70,
      minHeight: 30,

      content: "₹999",

      preferredFontSize: 22,
      minFontSize: 16
    },

    {
      id: "brand",
      type: "text",
      role: "branding",
      priority: 5,

      preferredWidth: 90,
      preferredHeight: 40,

      minWidth: 60,
      minHeight: 30,

      content: "BRAND",

      preferredFontSize: 18,
      minFontSize: 14
    }
  ]
};