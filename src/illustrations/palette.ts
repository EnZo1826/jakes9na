/**
 * Palette for the schematic illustration set. Values comes
 * from the design tokens (tailwind.config.js / tokens.json); the hex
 * values below are the same tokens, needed because SVG presentation
 * attributes cannot read Tailwind classes.
 */
export const C = {
  bg: '#05070A',
  panel: '#11161D',
  line: '#1F2A36',
  lineHi: '#2B3A4A',
  text: '#A9B7C6',
  strong: '#E6EDF3',
  crimson: '#DA3633',
  teal: '#49D7B1',
} as const;
