import { idx, SOLVED, STICKERS, type V } from "./cube.ts";

const COL: Record<string, string> = { U: "yel", D: "wht", F: "grn", B: "blu", R: "rgt", L: "lft" };
export type LlMode = "full" | "oll" | "corners";

const LL: { p: V; ids: number[] }[] = [];
for (const [i, st] of STICKERS.entries()) {
  if (st.p[1] !== 1 || st.p.filter((c) => c !== 0).length < 2) continue;
  const k = LL.find((x) => x.p.join() === st.p.join());
  if (k) k.ids.push(i); else LL.push({ p: st.p, ids: [i] });
}
const HOME = new Map(LL.map((x) => [x.ids.map((i) => SOLVED[i]).sort().join(""), x.p]));

function moves(state: string, corners: boolean) {
  const out: [V, V][] = [];
  for (const x of LL) {
    const isCorner = x.p.filter((c) => c !== 0).length === 3;
    if (corners && !isCorner) continue;
    const home = HOME.get(x.ids.map((i) => state[i]).sort().join(""));
    if (home && home.join() !== x.p.join()) out.push([x.p, home]);
  }
  return out;
}

export function llSvg(state: string, size = 104, label = "", mode: LlMode = "full", arrows = true): string {
  const g = 24, o = 10, out: string[] = [];
  const color = (p: V, n: V) => {
    const c = state[idx(p, n)];
    const isEdge = p.filter((x) => x !== 0).length === 2;
    if (mode === "oll") return c === "U" ? "yel" : "crn";
    if (mode === "corners" && isEdge) return c === "U" && n[1] === 1 ? "yel" : "crn";
    return COL[c] ?? "crn";
  };
  const r = (x: number, y: number, w: number, h: number, p: V, n: V) =>
    out.push(`<rect data-i="${idx(p, n)}" x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="var(--${color(p, n)})" stroke="#0006" stroke-width="0.8"/>`);
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
  if (arrows && mode !== "oll") {
    const c = (p: V): [number, number] => [o + (p[0] + 1) * g + (g - 2) / 2, o + (p[2] + 1) * g + (g - 2) / 2];
    const list = moves(state, mode === "corners");
    const key = (a: V, b: V) => a.join() + ">" + b.join();
    const pairs = new Set(list.map(([a, b]) => key(a, b)));
    const drawn = new Set<string>();
    for (const [a, b] of list) {
      const swap = pairs.has(key(b, a));
      if (swap && drawn.has(key(b, a))) continue;
      drawn.add(key(a, b));
      const [x1, y1] = c(a), [x2, y2] = c(b);
      const len = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / len, uy = (y2 - y1) / len, pad = 5;
      const sx = x1 + ux * pad, sy = y1 + uy * pad, ex = x2 - ux * pad, ey = y2 - uy * pad;
      const head = (hx: number, hy: number, dx: number, dy: number) =>
        `<path d="M${hx} ${hy} l${(-dx * 6 - dy * 3.5).toFixed(2)} ${(-dy * 6 + dx * 3.5).toFixed(2)} l${(dy * 7).toFixed(2)} ${(-dx * 7).toFixed(2)} z" fill="#111"/>`;
      out.push(`<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#fff" stroke-width="3.6" stroke-linecap="round" opacity=".85"/>`);
      out.push(`<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#111" stroke-width="1.6" stroke-linecap="round"/>`);
      out.push(head(ex, ey, ux, uy));
      if (swap) out.push(head(sx, sy, -ux, -uy));
    }
  }
  const W = 2 * o + 3 * g - 1;
  return `<svg viewBox="0 0 ${W} ${W}" width="${size}" height="${size}" role="img" aria-label="${label}">${out.join("")}</svg>`;
}
