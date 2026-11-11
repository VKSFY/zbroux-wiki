import { idx, type V } from "./cube.ts";

export type SlotName = "UF" | "UR" | "UB" | "UL" | "FR" | "BR" | "DR" | "DF" | "DB";
export interface Slot { piece: "E" | "DF" | "DB"; flip: boolean }
export type Slots = Record<SlotName, Slot>;

export const SLOT_POS: Record<SlotName, V> = {
  UF: [0, 1, 1], UR: [1, 1, 0], UB: [0, 1, -1], UL: [-1, 1, 0],
  FR: [1, 0, 1], BR: [1, 0, -1], DR: [1, -1, 0], DF: [0, -1, 1], DB: [0, -1, -1],
};
const refFace = (p: V): V => (p[1] !== 0 ? [0, p[1], 0] : [0, 0, p[2]]);
function otherFace(p: V, rn: V): V {
  for (let i = 0; i < 3; i++) if (p[i] !== 0) {
    const n: V = [0, 0, 0]; n[i] = p[i];
    if (n.join() !== rn.join()) return n;
  }
  throw new Error("bad slot");
}

export function slotsFromMasked(m: string): { slots: Slots; u: string; f: string } {
  const slots = {} as Slots;
  for (const [name, p] of Object.entries(SLOT_POS) as [SlotName, V][]) {
    const rn = refFace(p), on = otherFace(p, rn);
    const a = m[idx(p, rn)], b = m[idx(p, on)];
    const set = new Set([a, b]);
    if (set.has("D") && set.has("F")) slots[name] = { piece: "DF", flip: a !== "D" };
    else if (set.has("D") && set.has("B")) slots[name] = { piece: "DB", flip: a !== "D" };
    else slots[name] = { piece: "E", flip: a !== "o" };
  }
  return { slots, u: m[idx([0, 1, 0], [0, 1, 0])], f: m[idx([0, 0, 1], [0, 0, 1])] };
}

const COL: Record<string, string> = { U: "yel", D: "wht", F: "grn", B: "blu" };
function stickers(s: Slot): [string, string] {
  if (s.piece === "E") return s.flip ? ["bad", "bad"] : ["gry", "gry"];
  const side = s.piece === "DF" ? "grn" : "blu";
  return s.flip ? [side, "wht"] : ["wht", side];
}

export function eostripeSvg(slots: Slots, u: string, f: string, size = 150, label = ""): string {
  const g = 22, out: string[] = [];
  const r = (x: number, y: number, w: number, h: number, c: string) =>
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="var(--${c})" stroke="#0006" stroke-width="0.8"/>`);
  const st = (n: SlotName) => stickers(slots[n]);
  const ox = 9, oy = 9;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    if ((i + j) % 2 === 0 && !(i === 1 && j === 1)) r(ox + j * g, oy + i * g, g - 2, g - 2, "crn");
  }
  r(ox + g, oy + g, g - 2, g - 2, COL[u] ?? "yel");
  const ue: [SlotName, number, number, number, number, number, number][] = [
    ["UB", 0, 1, ox + g, 1, g - 2, 6], ["UL", 1, 0, 1, oy + g, 6, g - 2],
    ["UR", 1, 2, ox + 3 * g, oy + g, 6, g - 2], ["UF", 2, 1, ox + g, oy + 3 * g, g - 2, 6],
  ];
  for (const [n, i, j, sx, sy, sw, sh] of ue) { const [a, b] = st(n); r(ox + j * g, oy + i * g, g - 2, g - 2, a); r(sx, sy, sw, sh, b); }
  const rx = 110, ry = 9;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2 === 0 && !(i === 1 && j === 1)) r(rx + j * g, ry + i * g, g - 2, g - 2, "crn");
  out.push(`<rect x="${rx + g}" y="${ry + g}" width="${g - 2}" height="${g - 2}" rx="2" fill="var(--crn)" stroke="#0006" stroke-width="0.8"/><text x="${rx + g + 10}" y="${ry + g + 14}" font-size="9" text-anchor="middle" fill="currentColor" opacity=".55">R</text>`);
  r(rx + g, ry, g - 2, g - 2, st("UR")[1]);
  r(rx, ry + g, g - 2, g - 2, st("FR")[1]);
  r(rx + 2 * g, ry + g, g - 2, g - 2, st("BR")[1]);
  r(rx + g, ry + 2 * g, g - 2, g - 2, st("DR")[1]);
  r(rx - 7, ry + g, 5, g - 2, st("FR")[0]);
  r(rx + 3 * g, ry + g, 5, g - 2, st("BR")[0]);
  r(rx + g, ry + 3 * g, g - 2, 5, st("DR")[0]);
  const chip = (n: SlotName, x: number) => {
    const [a, b] = st(n);
    out.push(`<text x="${x + 11}" y="103" font-size="8" text-anchor="middle" fill="currentColor" opacity=".65">${n}</text>`);
    r(x, 106, 11, 11, a); r(x + 12, 106, 11, 11, b);
  };
  chip("DF", 118); chip("DB", 150);
  out.push(`<line x1="96" y1="6" x2="96" y2="92" stroke="currentColor" stroke-opacity=".18" stroke-dasharray="2 3"/>`);
  return `<svg viewBox="0 0 182 122" width="${size}" height="${Math.round(size * 122 / 182)}" role="img" aria-label="${label}">${out.join("")}</svg>`;
}
