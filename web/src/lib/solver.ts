import { STICKERS, SOLVED, MOVES, apply, parse, normalizeByCenters, type V } from "./cube.ts";
import { lookupEodfdb, lookupZbll, withPre } from "./case-lookup.ts";
import { breakdown, aufToSolve, fbDone, stm, type EodCase, type ZbCase } from "./breakdown.ts";

const nz = (p: V) => p.filter((c) => c !== 0).length;
const EDGE_LOCS = STICKERS.flatMap((s, i) => (nz(s.p) === 2 ? [i] : []));
const CORNER_LOCS = STICKERS.flatMap((s, i) => (nz(s.p) === 3 ? [i] : []));
const EDGE_ORD = new Map(EDGE_LOCS.map((s, k) => [s, k]));
const CORNER_ORD = new Map(CORNER_LOCS.map((s, k) => [s, k]));
const CUBIE = STICKERS.map((s) => STICKERS.flatMap((t, j) => (t.p.join() === s.p.join() ? [j] : [])));
const at = (p: V, n: V) => STICKERS.findIndex((s) => s.p.join() === p.join() && s.n.join() === n.join());

function locTable(moves: string[], locs: number[], ord: Map<number, number>) {
  const t = new Uint8Array(moves.length * 24);
  moves.forEach((m, k) => {
    const P = MOVES[m];
    P.forEach((from, to) => { if (ord.has(from)) t[k * 24 + ord.get(from)!] = ord.get(to)!; });
  });
  return t;
}

const FACE_MOVES = "U D L R F B".split(" ").flatMap((f) => [f, f + "'", f + "2"]);
const SB_MOVES = "R r M U".split(" ").flatMap((f) => [f, f + "'", f + "2"]);

interface Block {
  name: string;
  moves: string[];
  refs: { sticker: number; edge: boolean }[];
  et: Uint8Array;
  ct: Uint8Array;
  table?: Uint8Array;
  maxDepth?: number;
  states?: number;
}

function block(name: string, moves: string[], edges: [V, V][], corners: [V, V][]): Block {
  return {
    name, moves,
    refs: [...edges.map(([p, n]) => ({ sticker: at(p, n), edge: true })), ...corners.map(([p, n]) => ({ sticker: at(p, n), edge: false }))],
    et: locTable(moves, EDGE_LOCS, EDGE_ORD),
    ct: locTable(moves, CORNER_LOCS, CORNER_ORD),
  };
}

const FB = block("First block", FACE_MOVES,
  [[[-1, -1, 0], [0, -1, 0]], [[-1, 0, 1], [-1, 0, 0]], [[-1, 0, -1], [-1, 0, 0]]],
  [[[-1, -1, 1], [0, -1, 0]], [[-1, -1, -1], [0, -1, 0]]]);
const SB = block("Second block", SB_MOVES,
  [[[1, -1, 0], [0, -1, 0]], [[1, 0, 1], [1, 0, 0]], [[1, 0, -1], [1, 0, 0]]],
  [[[1, -1, 1], [0, -1, 0]], [[1, -1, -1], [0, -1, 0]]]);

const SIZE = 24 ** 5;
const encode = (l: number[]) => (((l[0] * 24 + l[1]) * 24 + l[2]) * 24 + l[3]) * 24 + l[4];
function decode(i: number, out: number[]) {
  for (let k = 4; k >= 0; k--) { out[k] = i % 24; i = (i - out[k]) / 24; }
  return out;
}
function step(b: Block, i: number, k: number, buf: number[]) {
  decode(i, buf);
  for (let j = 0; j < 5; j++) buf[j] = (j < 3 ? b.et : b.ct)[k * 24 + buf[j]];
  return encode(buf);
}
function partTables(b: Block) {
  const n = b.moves.length, buf = [0, 0, 0, 0, 0];
  const em = new Uint16Array(13824 * n), cm = new Uint16Array(576 * n);
  for (let e = 0; e < 13824; e++) for (let k = 0; k < n; k++) em[e * n + k] = Math.floor(step(b, e * 576, k, buf) / 576);
  for (let c = 0; c < 576; c++) for (let k = 0; k < n; k++) cm[c * n + k] = step(b, c, k, buf) % 576;
  return { em, cm };
}

function locsOf(b: Block, s: string[]) {
  return b.refs.map(({ sticker, edge }) => {
    const want = SOLVED[sticker], set = CUBIE[sticker].map((j) => SOLVED[j]).sort().join("");
    const pool = edge ? EDGE_LOCS : CORNER_LOCS;
    const loc = pool.find((j) => s[j] === want && CUBIE[j].map((x) => s[x]).sort().join("") === set);
    if (loc === undefined) throw new Error("Couldn't read the cube. Check the scramble.");
    return (edge ? EDGE_ORD : CORNER_ORD).get(loc)!;
  });
}

export function buildTable(b: Block) {
  if (b.table) return b.table;
  const t = new Uint8Array(SIZE).fill(255);
  const goal = encode(locsOf(b, SOLVED));
  t[goal] = 0;
  const { em, cm } = partTables(b), n = b.moves.length;
  let d = 0, count = 1, frontier = 1;
  while (frontier) {
    frontier = 0;
    for (let i = 0; i < SIZE; i++) {
      if (t[i] !== d) continue;
      const e = (i / 576) | 0, c = i - e * 576;
      for (let k = 0; k < n; k++) {
        const j = em[e * n + k] * 576 + cm[c * n + k];
        if (t[j] === 255) { t[j] = d + 1; frontier++; }
      }
    }
    count += frontier;
    if (frontier) d++;
  }
  b.table = t; b.maxDepth = d; b.states = count;
  return t;
}

const AXIS: Record<string, number> = { U: 1, D: 1, R: 0, L: 0, r: 0, M: 0, F: 2, B: 2 };
const ORDER = "URrMLFDB";
function allowed(prev: string | undefined, m: string) {
  if (!prev) return true;
  if (prev[0] === m[0]) return false;
  if (AXIS[prev[0]] === AXIS[m[0]]) return ORDER.indexOf(prev[0]) < ORDER.indexOf(m[0]);
  return true;
}

export function solveBlock(b: Block, s: string[], cap = 4): string[][] {
  const t = buildTable(b);
  const start = encode(locsOf(b, s));
  const d0 = t[start];
  if (d0 === 255) throw new Error(`${b.name}: this position can't be reached with the allowed moves.`);
  const out: string[][] = [], path: string[] = [], buf = [0, 0, 0, 0, 0];
  const dfs = (i: number) => {
    if (out.length >= cap) return;
    const d = t[i];
    if (d === 0) { out.push(path.slice()); return; }
    for (let k = 0; k < b.moves.length; k++) {
      const m = b.moves[k];
      if (!allowed(path[path.length - 1], m)) continue;
      const j = step(b, i, k, buf);
      if (t[j] !== d - 1) continue;
      path.push(m); dfs(j); path.pop();
      if (out.length >= cap) return;
    }
  };
  dfs(start);
  return out;
}

export const BLOCKS = { FB, SB };
export function tableInfo() {
  return [FB, SB].map((b) => ({ name: b.name, bytes: SIZE, states: b.states ?? 0, maxDepth: b.maxDepth ?? 0 }));
}

export interface StagePlan { name: string; moves: string[]; stm: number; alts?: string[][] }
export interface Solve {
  ok: boolean;
  error?: string;
  rotation: string;
  stages: StagePlan[];
  total: number;
  eod?: { id: string; pre: string; alts: string[] };
  zb?: { id: string; name?: string; pre: string; alts: { alg: string; stm: number }[] };
  ms: Record<string, number>;
}

const Q: Record<string, number> = { "": 1, "2": 2, "'": 3 };
function addTurn(moves: string[], turn: string) {
  const last = moves[moves.length - 1];
  if (!last || last[0] !== turn[0]) return [...moves, turn];
  const t = (Q[last.slice(1)] + Q[turn.slice(1)]) % 4;
  return [...moves.slice(0, -1), ...(t ? [turn[0] + ["", "", "2", "'"][t]] : [])];
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const toStr = (m: string[]) => m.join(" ");
export const slashed = (stages: { moves: string[] }[]) => stages.map((x) => toStr(x.moves)).join(" / ");

export function solve(scramble: string, eodByKey: Map<string, EodCase>, zbByKey: Map<string, ZbCase>, rotation = ""): Solve {
  const ms: Record<string, number> = {};
  const fail = (error: string): Solve => ({ ok: false, error, rotation, stages: [], total: 0, ms });
  if (!scramble.trim()) return fail("Paste a scramble.");
  let scr: string[];
  try { scr = parse(scramble); } catch (e) { return fail(`Scramble: ${(e as Error).message}.`); }
  const rot = rotation ? parse(rotation) : [];
  let s = normalizeByCenters(apply(SOLVED, [...scr, ...rot]));

  let t0 = now();
  const fbs = solveBlock(FB, s, 4);
  ms.fb = now() - t0;
  const fb = fbs[0];
  s = apply(s, fb);

  t0 = now();
  const sbs = solveBlock(SB, s, 4);
  ms.sb = now() - t0;
  const sb = sbs[0];
  let probe = s;
  for (const m of sb) { probe = apply(probe, [m]); if (!fbDone(probe)) return fail("Second block: a move broke the first block. Nothing is shown."); }
  s = probe;

  const before = toStr([...rot, ...fb, ...sb]);
  t0 = now();
  const e = lookupEodfdb(eodByKey, scramble, before);
  if (!e.ok) return fail(`EODFDB: ${e.error}`);
  const eodMoves = e.c.a.length ? [...(e.pre ? [e.pre] : []), ...parse(e.c.a[0])] : [];
  ms.eod = now() - t0;
  s = apply(s, eodMoves);

  t0 = now();
  const afterEod = toStr([...rot, ...fb, ...sb, ...eodMoves]);
  const z = lookupZbll(zbByKey, scramble, afterEod);
  let zbMoves: string[], zbInfo: Solve["zb"];
  if (z.ok) {
    const listed = z.c.a.map(([alg]) => {
      const full = parse(withPre(z.pre, alg));
      const fin = aufToSolve(apply(s, full)) ?? "?";
      const moves = fin ? addTurn(full, fin) : full;
      return { moves, alg: toStr(moves), stm: stm(moves), ok: fin !== "?" };
    }).filter((x) => x.ok);
    if (!listed.length) return fail("ZBLL: none of the listed algorithms solved this case.");
    const best = listed.reduce((a, b) => (b.stm < a.stm ? b : a));
    zbMoves = best.moves;
    zbInfo = { id: z.c.i, name: z.c.n, pre: z.pre, alts: listed.filter((x) => x !== best).map(({ alg, stm }) => ({ alg, stm })) };
  } else if (z.solved) {
    const fin = aufToSolve(s);
    zbMoves = fin ? [fin] : [];
  } else return fail(`ZBLL: ${z.error}`);
  ms.zbll = now() - t0;

  const stages: StagePlan[] = [
    { name: "First block", moves: [...rot, ...fb], stm: stm(fb), alts: fbs.slice(1) },
    { name: "Second block", moves: sb, stm: stm(sb), alts: sbs.slice(1) },
    { name: "EODFDB", moves: eodMoves, stm: stm(eodMoves) },
    { name: "ZBLL", moves: zbMoves, stm: stm(zbMoves) },
  ];
  const all = stages.flatMap((x) => x.moves);
  const end = normalizeByCenters(apply(SOLVED, [...scr, ...all]));
  if (end.join("") !== SOLVED.join("")) return fail("Self-check failed: the solution doesn't solve the cube. Nothing is shown.");
  const bd = breakdown(scramble, slashed(stages), eodByKey, zbByKey);
  const same = bd.ok && bd.stages.length === 4 && bd.stages.every((x, k) => x.done && toStr(x.moves) === toStr(stages[k].moves)) && bd.rest.length === 0;
  if (!same) return fail("Self-check failed: the solve breakdown splits this solution differently. Nothing is shown.");
  return {
    ok: true, rotation, stages, total: stm(all), ms,
    eod: e.c.a.length ? { id: e.c.i, pre: e.pre, alts: e.c.a.slice(1).map((a) => toStr([...(e.pre ? [e.pre] : []), ...parse(a)])) } : undefined,
    zb: zbInfo,
  };
}

export const ROTATIONS = (() => {
  const seen = new Map<string, string>();
  const base = ["", "y", "y2", "y'"];
  const tops = ["", "x", "x2", "x'", "z", "z'"];
  for (const t of tops) for (const b of base) {
    const r = [t, b].filter(Boolean).join(" ");
    const key = apply(SOLVED, r ? parse(r) : []).join("");
    if (!seen.has(key)) seen.set(key, r);
  }
  return [...seen.values()];
})();

export function fbLength(scramble: string, rotation: string) {
  const s = normalizeByCenters(apply(SOLVED, [...parse(scramble), ...(rotation ? parse(rotation) : [])]));
  return buildTable(FB)[encode(locsOf(FB, s))];
}
