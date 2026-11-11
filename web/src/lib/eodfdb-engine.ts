import { STICKERS, SOLVED, MOVES, apply, parse, normalizeByLeftBlock } from "./cube.ts";

const nz = (p: number[]) => p.filter((c) => c !== 0).length;
const U = MOVES["U"];
const turnU = (s: string) => { let o = ""; for (let i = 0; i < 54; i++) o += s[U[i]]; return o; };

export interface Lookup { ok: boolean; error?: string; key?: string; preAuf?: string }

export function findEodfdb(scramble: string, blocks: string): Lookup {
  let s: string[];
  try { s = apply(SOLVED, parse(scramble).concat(parse(blocks))); }
  catch (e) { return { ok: false, error: (e as Error).message }; }
  const n = normalizeByLeftBlock(s);
  const blocksOk = n && STICKERS.every((st, i) => st.p[0] === 0 || st.p[1] === 1 || n[i] === SOLVED[i]);
  if (!n || !blocksOk) {
    return { ok: false, error: "Both blocks need to be solved after your moves: one 1x2x3 on the left and one on the right, both at the bottom." };
  }
  const out = n.slice();
  const pieces = new Map<string, number[]>();
  STICKERS.forEach((st, i) => {
    if (st.p[1] === 1 && nz(st.p) === 3) out[i] = ".";
    if (nz(st.p) === 2) { const k = st.p.join(); pieces.set(k, [...(pieces.get(k) ?? []), i]); }
  });
  for (const ids of pieces.values()) {
    if (ids.some((i) => n[i] === "U")) for (const i of ids) out[i] = n[i] === "U" ? "U" : "x";
  }
  let cur = out.join(""), best = cur, k = 0;
  for (let i = 1; i < 4; i++) { cur = turnU(cur); if (cur < best) { best = cur; k = i; } }
  return { ok: true, key: best, preAuf: ["", "U", "U2", "U'"][k] };
}
