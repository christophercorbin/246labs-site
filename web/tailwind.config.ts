import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#001042",
        "flag-blue": "#00267F",
        "panel-blue": "#0A2E7A",
        gold: "#FFC726",
        ink: "#14161A",
        muted: "#5A6273",
        faint: "#9199A8",
        hairline: "#E3E5EA",
        paper: "#F6F7FB",
        "page-bg": "#E7E8EC",
        "traffic-red": "#FF5F56",
        "traffic-amber": "#FFBD2E",
        "traffic-green": "#27C93F",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        tile: "24px",
        "tile-sm": "17px",
      },
      letterSpacing: {
        wordmark: "-0.03em",
        label: "0.18em",
      },
    },
  },
  plugins: [],
};
export default config;
