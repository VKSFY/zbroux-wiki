export type Piece = "LL" | "DF" | "DB";
export interface Slot { piece: Piece; flip: boolean }
export type LseSlots = Record<"UF" | "UR" | "UB" | "UL" | "DF" | "DB", Slot>;

const COL: Record<string, string> = { U: "yel", D: "wht", F: "grn", B: "blu", x: "gry" };
function stickers(s: Slot): [string, string] {
  const [a, b] = s.piece === "LL" ? ["U", "x"] : s.piece === "DF" ? ["D", "F"] : ["D", "B"];
  return s.flip ? [b, a] : [a, b];
}

export function lseSvg(slots: LseSlots, uCentre: string, size = 96, label = ""): string {
  const g = 26, o = 10, out: string[] = [];
  const r = (x: number, y: number, w: number, h: number, c: string) =>
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="var(--${c})" stroke="#0006" stroke-width="0.8"/>`);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) r(o + g, o + g, g - 2, g - 2, COL[uCentre] ?? "yel");
    else if ((i + j) % 2 === 0) r(o + j * g, o + i * g, g - 2, g - 2, "crn");
  }
  const put = (n: keyof LseSlots, i: number, j: number, sx: number, sy: number, sw: number, sh: number) => {
    const [p, q] = stickers(slots[n]);
    r(o + j * g, o + i * g, g - 2, g - 2, COL[p]); r(sx, sy, sw, sh, COL[q]);
  };
  put("UB", 0, 1, o + g, 1, g - 2, 7);
  put("UL", 1, 0, 1, o + g, 7, g - 2);
  put("UR", 1, 2, o + 3 * g + 1, o + g, 7, g - 2);
  put("UF", 2, 1, o + g, o + 3 * g + 1, g - 2, 7);
  (["DF", "DB"] as const).forEach((n, k) => {
    const [p, q] = stickers(slots[n]); const x = 14 + k * 44;
    out.push(`<text x="${x + 11.5}" y="104" font-size="8" text-anchor="middle" fill="currentColor" opacity=".65">${n}</text>`);
    r(x, 107, 11, 11, COL[p]); r(x + 12, 107, 11, 11, COL[q]);
  });
  return `<svg viewBox="0 0 96 122" width="${size}" height="${Math.round(size * 122 / 96)}" role="img" aria-label="${label}">${out.join("")}</svg>`;
}
