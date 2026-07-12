// Vitest can't run the Next.js SWC font-loader plugin that backs `next/font/google`,
// so page/layout tests that import app/layout.tsx (and its next/font calls) need a stub.
// Each font loader is called with an options object and must return a shape compatible
// with what layout.tsx destructures (`.variable`, `.className`).
function mockFontLoader() {
  return {
    className: "",
    variable: "",
    style: { fontFamily: "" },
  };
}

export const Space_Grotesk = mockFontLoader;
export const IBM_Plex_Mono = mockFontLoader;
