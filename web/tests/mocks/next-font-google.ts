// Vitest can't run the Next.js SWC font-loader plugin that backs `next/font/google`,
// so page/layout tests that import app/layout.tsx (and its next/font calls) need a stub.
// Each font loader is called with an options object and must return a shape compatible
// with what layout.tsx destructures (`.variable`, `.className`). Each named export
// returns a distinct shape matching the real layout wiring.
export function Space_Grotesk() {
  return {
    className: "",
    variable: "--font-space-grotesk",
    style: { fontFamily: "Space Grotesk" },
  };
}

export function IBM_Plex_Mono() {
  return {
    className: "",
    variable: "--font-plex-mono",
    style: { fontFamily: "IBM Plex Mono" },
  };
}
