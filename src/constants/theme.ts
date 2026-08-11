// src/constants/theme.ts
//
// Read from the live ranchrodeo.pro stylesheet rather than from the spine
// document. Where the two disagree the shipped site wins: a user opening
// the app straight off the website should not feel a colour change.

export const colors = {
  background: '#14100c',
  surface: '#1e1813',
  card: '#261f18',
  border: '#3f342a',
  text: '#e3d8c8',
  muted: '#ac9c86',
  accent: '#b3402f',
  accentAlt: '#d8a05c',
  cream: '#f1e6d4',
  success: '#4ba36b',
  warning: '#d99a2b',
  danger: '#c8503f',
} as const;

export const app = {
  name: "Ranch Rodeo",
  short: "RanchRodeo",
  domain: "ranchrodeo.pro",
  eventType: "ranchrodeo",
  eventLabel: "Ranch rodeo",
  tagline: "Placings become points before the dust settles.",
  associations: ["WRCA"] as readonly string[],
} as const;

// Spacing follows the house rule from the BarrelConnect cursor rules:
// screens px-5 py-6 gap-y-6, cards p-4 rounded-2xl gap-y-2.
export const spacing = { screenX: 20, screenY: 24, gap: 24, cardPad: 16 } as const;
export const radius = { card: 16, pill: 999, control: 12 } as const;
