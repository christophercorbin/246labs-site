import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
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
          borderRadius: 41,
        }}
      >
        <div
          style={{
            height: 45,
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 16,
            background: "#0A2E7A",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#FF5F56" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#FFBD2E" }} />
          <div style={{ width: 12, height: 12, borderRadius: 6, background: "#27C93F" }} />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 11,
          }}
        >
          <img src={src} width={66} height={70} />
          <div style={{ width: 10, height: 70, background: "#FFC726" }} />
        </div>
      </div>
    ),
    size,
  );
}
