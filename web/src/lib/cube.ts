
export type V = [number, number, number];
export interface Sticker { p: V; n: V }

const FACES: Record<string, V> = {
  U: [0, 1, 0], D: [0, -1, 0], R: [1, 0, 0], L: [-1, 0, 0], F: [0, 0, 1], B: [0, 0, -1],
};
const key = (p: V, n: V) => `${p.join(",")}|${n.join(",")}`;

function buildStickers(): Sticker[] {
  const out: Sticker[] = [];
  for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) {
    const p: V = [x, y, z];
    for (const n of Object.values(FACES)) {
      if ([0, 1, 2].every((i) => n[i] === 0 || p[i] === n[i])) out.push({ p, n });
    }
  }
  out.sort((a, b) => cmp(a.p, b.p) || cmp(a.n, b.n));
  return out;
}
function cmp(a: V, b: V) { for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] - b[i]; return 0; }

export const STICKERS = buildStickers();
export const INDEX = new Map(STICKERS.map((s, i) => [key(s.p, s.n), i]));
export const idx = (p: V, n: V) => INDEX.get(key(p, n))!;

function rot(v: V, axis: number, q: number): V {
  let [x, y, z] = v;
  for (let k = 0; k < ((q % 4) + 4) % 4; k++) {
    if (axis === 0) [y, z] = [-z, y];
    else if (axis === 1) [z, x] = [-x, z];
    else [x, y] = [-y, x];
  }
  return [x, y, z];
}

type Pred = (p: V) => boolean;
const BASE: Record<string, [number, Pred, number]> = {
  U: [1, (p) => p[1] === 1, -1], D: [1, (p) => p[1] === -1, 1], E: [1, (p) => p[1] === 0, 1],
  R: [0, (p) => p[0] === 1, -1], L: [0, (p) => p[0] === -1, 1], M: [0, (p) => p[0] === 0, 1],
  F: [2, (p) => p[2] === 1, -1], B: [2, (p) => p[2] === -1, 1], S: [2, (p) => p[2] === 0, -1],
  r: [0, (p) => p[0] >= 0, -1], l: [0, (p) => p[0] <= 0, 1], u: [1, (p) => p[1] >= 0, -1],
  d: [1, (p) => p[1] <= 0, 1], f: [2, (p) => p[2] >= 0, -1], b: [2, (p) => p[2] <= 0, 1],
  x: [0, () => true, -1], y: [1, () => true, -1], z: [2, () => true, -1],
};

function basePerm(name: string): number[] {
  const [axis, pred, q] = BASE[name];
  const perm = STICKERS.map((_, i) => i);
  STICKERS.forEach((s, i) => {
    if (pred(s.p)) perm[idx(rot(s.p, axis, q), rot(s.n, axis, q))] = i;
  });
  return perm;
}
const compose = (a: number[], b: number[]) => b.map((bi) => a[bi]);

export const MOVES: Record<string, number[]> = {};
for (const n of Object.keys(BASE)) {
  const p1 = basePerm(n), p2 = compose(p1, p1);
  MOVES[n] = p1; MOVES[n + "2"] = p2; MOVES[n + "'"] = compose(p2, p1);
}

export function parse(alg: string): string[] {
  const toks = alg.replace(/[()\[\]]/g, " ").replace(/[’`´]/g, "'").split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (let t of toks) {
    t = t.replace("2'", "2").replace("'2", "2");
    t = t.replace(/^([RLUDFB])w/, (_, f) => f.toLowerCase());
    if (!MOVES[t]) throw new Error(`Unknown move "${t}"`);
    out.push(t);
  }
  return out;
}

export const SOLVED: string[] = STICKERS.map((s) => Object.entries(FACES).find(([, v]) => v.every((c, i) => c === s.n[i]))![0]);

export function apply(state: string[], alg: string | string[]): string[] {
  const seq = typeof alg === "string" ? parse(alg) : alg;
  let s = state;
  for (const m of seq) { const p = MOVES[m]; s = p.map((j) => s[j]); }
  return s;
}

export function invert(seq: string[]): string[] {
  return seq.slice().reverse().map((m) => (m.endsWith("2") ? m : m.endsWith("'") ? m.slice(0, -1) : m + "'"));
}

export function normalizeByLeftBlock(s: string[]): string[] | null {
  const m: Record<string, string> = {};
  const set = (c: string, f: string) => { if (m[c] && m[c] !== f) return false; m[c] = f; return true; };
  const ok =
    set(s[idx([-1, 0, 0], [-1, 0, 0])], "L") &&
    set(s[idx([1, 0, 0], [1, 0, 0])], "R") &&
    set(s[idx([-1, -1, 0], [0, -1, 0])], "D") &&
    set(s[idx([-1, 0, 1], [0, 0, 1])], "F") &&
    set(s[idx([-1, 0, -1], [0, 0, -1])], "B");
  if (!ok || new Set(Object.values(m)).size !== 5) return null;
  const rest = [...new Set(s)].filter((c) => !(c in m));
  if (rest.length !== 1) return null;
  m[rest[0]] = "U";
  return s.map((c) => m[c]);
}

export function normalizeByCenters(s: string[]): string[] {
  const map: Record<string, string> = {};
  for (const [face, n] of Object.entries(FACES)) map[s[idx(n, n)]] = face;
  return s.map((c) => map[c] ?? c);
}
