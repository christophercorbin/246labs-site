import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const trident = await readFile(
    path.join(process.cwd(), "public/brand/trident-gold.png"),
  );
  const src = `data:image/png;base64,${trident.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#001042",
          borderRadius: 7,
        }}
      >
        <div style={{ height: 8, background: "#0A2E7A" }} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          {/* trident PNG is 563×600 → width ≈ height × 0.94 */}
          <img src={src} width={12} height={13} />
          <div style={{ width: 2, height: 13, background: "#FFC726" }} />
        </div>
      </div>
    ),
    size,
  );
}
