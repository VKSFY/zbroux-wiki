import { idx, type V } from "./cube.ts";

const COL: Record<string, string> = { U: "yel", D: "wht", F: "grn", B: "blu", R: "rgt", L: "lft" };
export type LlMode = "full" | "oll" | "corners";

export function llSvg(state: string, size = 104, label = "", mode: LlMode = "full"): string {
  const g = 24, o = 10, out: string[] = [];
  const colour = (p: V, n: V) => {
    const c = state[idx(p, n)];
    const isEdge = p.filter((x) => x !== 0).length === 2;
    if (mode === "oll") return c === "U" ? "yel" : "crn";
    if (mode === "corners" && isEdge) return c === "U" && n[1] === 1 ? "yel" : "crn";
    return COL[c] ?? "crn";
  };
  const r = (x: number, y: number, w: number, h: number, p: V, n: V) =>
    out.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="var(--${colour(p, n)})" stroke="#0006" stroke-width="0.8"/>`);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    const p: V = [j - 1, 1, i - 1];
    r(o + j * g, o + i * g, g - 2, g - 2, p, [0, 1, 0]);
  }
  for (let j = 0; j < 3; j++) {
    r(o + j * g, 1, g - 2, 7, [j - 1, 1, -1], [0, 0, -1]);
    r(o + j * g, o + 3 * g, g - 2, 7, [j - 1, 1, 1], [0, 0, 1]);
  }
  for (let i = 0; i < 3; i++) {
    r(1, o + i * g, 7, g - 2, [-1, 1, i - 1], [-1, 0, 0]);
    r(o + 3 * g, o + i * g, 7, g - 2, [1, 1, i - 1], [1, 0, 0]);
  }
  const W = 2 * o + 3 * g - 1;
  return `<svg viewBox="0 0 ${W} ${W}" width="${size}" height="${size}" role="img" aria-label="${label}">${out.join("")}</svg>`;
}
