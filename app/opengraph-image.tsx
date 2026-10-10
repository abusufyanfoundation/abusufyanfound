import { ImageResponse } from "next/og";

export const alt = "Abu Sufyan Al-Alma'iyy Foundation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "#022569",
        padding: "80px",
        color: "#ffffff",
      }}
    >
      <div
        style={{
          width: 96,
          height: 4,
          background: "#cca957",
          marginBottom: 40,
        }}
      />
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>
        Abu Sufyan Al-Alma&apos;iyy Foundation
      </div>
      <div
        style={{
          fontSize: 32,
          marginTop: 32,
          color: "#e6d7a3",
          lineHeight: 1.35,
        }}
      >
        Giving the noble Qur&apos;an and beneficial books to students of
        knowledge, Islamic schools and mosques.
      </div>
    </div>,
    { ...size },
  );
}
