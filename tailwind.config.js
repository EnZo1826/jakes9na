/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#05070A',
        panel: '#11161D',
        line: '#1F2A36',
        text: '#A9B7C6',
        'text-strong': '#E6EDF3',
        crimson: '#DA3633',
        teal: '#49D7B1',
        // crimson-text: `crimson` (#DA3633) measures ~4.4:1 on `bg` and
        // ~3.9:1 on `panel` — enough for large text/icons/status LEDs
        // (WCAG 2.2 non-text contrast, 3:1) but short of the 4.5:1 AA
        // threshold for small body/label text. Use this lighter tint
        // (#E8534A, ~5.5:1 on bg / ~5.0:1 on panel) anywhere crimson is
        // read as small text (e.g. a status word inside a badge). `crimson`
        // itself stays the source of truth for large/accent/graphical use.
        'crimson-text': '#E8534A',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
