import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "246Labs — Cloud infrastructure, built in the Caribbean.";

async function asset(rel: string) {
  return readFile(path.join(process.cwd(), rel));
}

export default async function OgImage() {
  const [trident, island, grotesk, mono] = await Promise.all([
    asset("public/brand/trident-gold.png"),
    asset("public/brand/map-gold.png"),
    asset("assets/fonts/SpaceGrotesk-Bold.ttf"),
    asset("assets/fonts/IBMPlexMono-Medium.ttf"),
  ]);
  const tridentSrc = `data:image/png;base64,${trident.toString("base64")}`;
  const islandSrc = `data:image/png;base64,${island.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
          background: "#001042",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          {/* terminal tile */}
          <div
            style={{
              width: 160,
              height: 160,
              display: "flex",
              flexDirection: "column",
              background: "#001042",
              border: "3px solid #0A2E7A",
              borderRadius: 37,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 40,
                display: "flex",
                alignItems: "center",
                gap: 7,
                paddingLeft: 14,
                background: "#0A2E7A",
              }}
            >
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#FF5F56" }} />
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#FFBD2E" }} />
              <div style={{ width: 11, height: 11, borderRadius: 6, background: "#27C93F" }} />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <img src={tridentSrc} width={58} height={62} />
              <div style={{ width: 9, height: 62, background: "#FFC726" }} />
            </div>
          </div>
          {/* wordmark: 246La [island] s */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              fontFamily: "Space Grotesk",
              fontSize: 120,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            <span>246La</span>
            <img
              src={islandSrc}
              width={84}
              height={90}
              style={{ marginLeft: 4, marginRight: 4, transform: "translateY(8px)" }}
            />
            <span style={{ color: "#FFC726" }}>s</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 30,
            letterSpacing: "0.18em",
            color: "#FFC726",
          }}
        >
          CLOUD INFRASTRUCTURE, BUILT IN THE CARIBBEAN.
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "IBM Plex Mono",
            fontSize: 24,
            letterSpacing: "0.1em",
            color: "#9199A8",
          }}
        >
          246labs.cloud
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: grotesk, weight: 700, style: "normal" },
        { name: "IBM Plex Mono", data: mono, weight: 500, style: "normal" },
      ],
    },
  );
}
