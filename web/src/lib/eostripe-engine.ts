import { STICKERS, MOVES, SOLVED, apply, idx, parse, normalizeByLeftBlock, type V } from "./cube.ts";

export const GEN = ["U", "U'", "U2", "R", "R'", "R2", "M", "M'", "M2", "r", "r'", "r2"];
const nz = (p: V) => p.filter((c) => c !== 0).length;
const inLeftBlock = (p: V) => p[0] === -1 && p[1] <= 0;

function refFace(p: V): V { return p[1] !== 0 ? [0, p[1], 0] : [0, 0, p[2]]; }
function refColor(cols: string[]): string | null {
  for (const c of "UDFB") if (cols.includes(c)) return c;
  return null;
}

export function mask(state: string[]): string {
  const out = state.slice();
  const pieces = new Map<string, number[]>();
  STICKERS.forEach((s, i) => {
    if (nz(s.p) === 2) {
      const k = s.p.join(",");
      if (!pieces.has(k)) pieces.set(k, []);
      pieces.get(k)!.push(i);
    }
    if (nz(s.p) === 3 && !inLeftBlock(s.p)) out[i] = ".";
  });
  for (const [k, ids] of pieces) {
    const p = k.split(",").map(Number) as V;
    if (inLeftBlock(p)) continue;
    const cols = ids.map((i) => state[i]);
    const set = new Set(cols);
    if (set.has("D") && (set.has("F") || set.has("B"))) continue;
    const r = refColor(cols);
    for (const i of ids) out[i] = state[i] === r ? "o" : "x";
  }
  return out.join("");
}

export const GOAL = mask(SOLVED);
const PERMS = GEN.map((m) => MOVES[m]);
const mv = (s: string, k: number) => { const p = PERMS[k]; let o = ""; for (let i = 0; i < 54; i++) o += s[p[i]]; return o; };

let DIST: Map<string, number> | null = null;
export function table(): Map<string, number> {
  if (DIST) return DIST;
  const dist = new Map<string, number>([[GOAL, 0]]);
  let frontier = [GOAL];
  let d = 0;
  while (frontier.length) {
    d++;
    const next: string[] = [];
    for (const s of frontier) for (let k = 0; k < PERMS.length; k++) {
      const t = mv(s, k);
      if (!dist.has(t)) { dist.set(t, d); next.push(t); }
    }
    frontier = next;
  }
  return (DIST = dist);
}

function score(a: string[]) {
  return [a.length, a.filter((m) => m[0] === "M").length, a.filter((m) => m[0] === "r").length, a.filter((m) => m.endsWith("2")).length];
}
const lex = (a: number[], b: number[]) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };
const AX = "RrM";

export function solveMasked(start: string, limit = 400): string[][] {
  const dist = table();
  if (!dist.has(start)) throw new Error("Not a valid EOStripe state");
  const sols: string[][] = [];
  const path: string[] = [];
  const dfs = (s: string) => {
    if (sols.length >= limit) return;
    const d = dist.get(s)!;
    if (d === 0) { sols.push(path.slice()); return; }
    for (let k = 0; k < GEN.length; k++) {
      const m = GEN[k];
      const prev = path[path.length - 1];
      if (prev) {
        if (prev[0] === m[0]) continue;
        if (AX.includes(prev[0]) && AX.includes(m[0]) && AX.indexOf(m[0]) < AX.indexOf(prev[0])) continue;
      }
      const t = mv(s, k);
      if (dist.get(t) === d - 1) { path.push(m); dfs(t); path.pop(); }
    }
  };
  dfs(start);
  return sols.sort((a, b) => lex(score(a), score(b)));
}

export interface Analysis {
  ok: boolean;
  error?: string;
  state?: string[];
  masked?: string;
  optimal?: number;
  solutions?: string[][];
  badEdges?: number;
}

export function analyze(scramble: string, leftBlock: string): Analysis {
  let s: string[];
  try { s = apply(SOLVED, parse(scramble).concat(parse(leftBlock))); }
  catch (e) { return { ok: false, error: (e as Error).message }; }
  const norm = normalizeByLeftBlock(s);
  if (!norm) return { ok: false, state: s, error: "The left block isn't solved after these moves. It should be a 1x2x3 on the left (L) side, at the bottom." };
  s = norm;
  const bad = STICKERS.some((st, i) => inLeftBlock(st.p) && s[i] !== SOLVED[i]);
  if (bad) return { ok: false, state: s, error: "The left block isn't solved after these moves. It should be a 1x2x3 on the left (L) side, at the bottom." };
  const m = mask(s);
  const dist = table();
  if (!dist.has(m)) return { ok: false, state: s, error: "This state can't be reached with R, r, M and U. Check that only the left block is solved and the rest is scrambled normally." };
  const sols = solveMasked(m);
  const badEdges = STICKERS.reduce((a, st, i) => a + (nz(st.p) === 2 && !inLeftBlock(st.p) && (m[i] === "o" || m[i] === "D") && st.n.join() !== refFace(st.p).join() ? 1 : 0), 0);
  return { ok: true, state: s, masked: m, optimal: dist.get(m)!, solutions: sols, badEdges };
}

export { idx };
