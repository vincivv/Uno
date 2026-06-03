import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, "..", "public", "images", "cards");

const colors = {
  red: { fill: "#dc2626", text: "#fff7ed", accent: "#7f1d1d", label: "#7f1d1d", oval: "#fff5f5" },
  blue: {
    fill: "#2563eb",
    text: "#eff6ff",
    accent: "#1e3a8a",
    label: "#1e3a8a",
    oval: "#f6f9ff",
  },
  green: {
    fill: "#16a34a",
    text: "#f0fdf4",
    accent: "#166534",
    label: "#166534",
    oval: "#f4fff7",
  },
  yellow: {
    fill: "#facc15",
    text: "#1f2937",
    accent: "#a16207",
    label: "#111827",
    oval: "#fffdf2",
  },
  wild: { fill: "#111827", text: "#ffffff", accent: "#0f172a", label: "#111827", oval: "#ffffff" },
};

const numberValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const actionValues = ["skip", "reverse", "draw_two"];
const wildValues = ["wild", "wild_draw_four"];
const cardColors = ["red", "blue", "green", "yellow"];

function escapeXml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function filenameForCard(color, value) {
  return `${color}-${value.replaceAll("_", "-")}.svg`;
}

function labelForValue(value) {
  switch (value) {
    case "draw_two":
      return "+2";
    case "wild_draw_four":
      return "+4";
    case "reverse":
      return "↺";
    case "skip":
      return "⊘";
    case "wild":
      return "W";
    default:
      return value;
  }
}

function subtitleForValue(value) {
  switch (value) {
    case "draw_two":
      return "DRAW TWO";
    case "wild_draw_four":
      return "WILD +4";
    case "reverse":
      return "REVERSE";
    case "skip":
      return "SKIP";
    case "wild":
      return "WILD";
    default:
      return "";
  }
}

function wildBands() {
  return `
    <path d="M36 10 L72 10 L36 77 Z" fill="#ef4444" opacity="0.95"/>
    <path d="M72 10 L108 10 L108 77 Z" fill="#3b82f6" opacity="0.95"/>
    <path d="M36 77 L108 77 L72 144 Z" fill="#22c55e" opacity="0.95"/>
    <path d="M36 10 L36 144 L72 144 Z" fill="#facc15" opacity="0.95"/>
  `;
}

function cardSvg(color, value) {
  const palette = colors[color];
  const label = escapeXml(labelForValue(value));
  const subtitle = escapeXml(subtitleForValue(value));
  const mainFontSize = value.length === 1 ? 62 : 52;
  const cornerFontSize = value.length === 1 ? 22 : 16;
  const darkText = color === "yellow";
  const background = color === "wild" ? "#0f172a" : palette.fill;
  const ellipseFill = color === "wild" ? "#ffffff" : palette.oval;
  const ellipseStroke = color === "wild" ? "#111827" : "rgba(255,255,255,0.88)";
  const labelColor = color === "wild" ? "#111827" : palette.label;
  const subtitleColor = color === "wild" ? "#111827" : palette.label;
  const outlineColor = darkText ? "#ffffff" : "rgba(255,255,255,0.72)";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 216" role="img" aria-label="${escapeXml(
    `${color} ${value}`,
  )}">
  <defs>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
  </defs>

  <rect x="6" y="6" width="132" height="204" rx="18" fill="#f8fafc"/>
  <rect x="12" y="12" width="120" height="192" rx="16" fill="${background}" filter="url(#shadow)"/>
  <rect x="12" y="12" width="120" height="192" rx="16" fill="url(#shine)"/>
  <ellipse cx="72" cy="108" rx="44" ry="66" fill="${ellipseFill}" stroke="${ellipseStroke}" stroke-width="6" transform="rotate(-18 72 108)"/>
  ${color === "wild" ? wildBands() : ""}
  <text x="72" y="126" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${mainFontSize}" fill="${labelColor}" stroke="${outlineColor}" stroke-width="1.6" paint-order="stroke fill" dominant-baseline="middle">${label}</text>
  ${
    subtitle
      ? `<text x="72" y="166" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="700" letter-spacing="1.6" fill="${subtitleColor}" opacity="0.96">${subtitle}</text>`
      : ""
  }
  <text x="26" y="34" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${cornerFontSize}" fill="${palette.text}">${label}</text>
  <text x="118" y="190" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${cornerFontSize}" fill="${palette.text}" transform="rotate(180 118 190)">${label}</text>
  <path d="M24 24 C42 16, 102 16, 120 24" fill="none" stroke="${palette.accent}" stroke-opacity="0.35" stroke-width="4"/>
</svg>
`;
}

function backSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 216" role="img" aria-label="card back">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="132" height="204" rx="18" fill="#f8fafc"/>
  <rect x="12" y="12" width="120" height="192" rx="16" fill="url(#bg)"/>
  <rect x="28" y="34" width="88" height="148" rx="16" fill="url(#panel)" stroke="#facc15" stroke-width="4"/>
  <ellipse cx="72" cy="108" rx="34" ry="54" fill="#111827" stroke="#fef3c7" stroke-width="3" transform="rotate(-18 72 108)"/>
  <text x="72" y="112" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-style="italic" font-size="26" fill="#facc15" dominant-baseline="middle">UNO</text>
  <path d="M26 24 C44 16, 100 16, 118 24" fill="none" stroke="#60a5fa" stroke-opacity="0.25" stroke-width="4"/>
</svg>
`;
}

await mkdir(outputDir, { recursive: true });

for (const color of cardColors) {
  for (const value of [...numberValues, ...actionValues]) {
    await writeFile(path.join(outputDir, filenameForCard(color, value)), cardSvg(color, value));
  }
}

for (const value of wildValues) {
  await writeFile(path.join(outputDir, filenameForCard("wild", value)), cardSvg("wild", value));
}

await writeFile(path.join(outputDir, "back.svg"), backSvg());
