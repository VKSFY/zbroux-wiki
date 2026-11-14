import { STICKERS, SOLVED, apply, parse, normalizeByLeftBlock } from "./cube.ts";
import { lookupEodfdb, lookupZbll, withPre, type Found } from "./case-lookup.ts";
import { AUF } from "./eodfdb-engine.ts";

export const STAGES = ["First block", "Second block", "EODFDB", "ZBLL"] as const;
export type EodCase = { i: string; k: string; n: number; g: string; m: number; a: string[]; f: boolean };
export type ZbCase = { i: string; k: string; sh: string; st: string; n?: string; a: [string, number][] };

const isRotation = (m: string) => /^[xyz]/.test(m);
export const stm = (moves: string[]) => moves.filter((m) => !isRotation(m)).length;

const ids = (f: (p: number[]) => boolean) => STICKERS.flatMap((s, i) => (f(s.p) ? [i] : []));
const FB = ids((p) => p[0] === -1 && p[1] <= 0);
const SB = ids((p) => p[0] === 1 && p[1] <= 0);
const LOW = ids((p) => p[1] <= 0);
const TOP_EDGES = STICKERS.flatMap((s, i) => (s.p[1] === 1 && s.p.filter((c) => c !== 0).length === 2 && s.n[1] === 1 ? [i] : []));
const U_CENTER = STICKERS.findIndex((s) => s.p.join() === "0,1,0");
const SOLVED_S = SOLVED.join("");

const solvedIn = (n: string[], list: number[]) => list.every((i) => n[i] === SOLVED[i]);
const norm = (s: string[]) => normalizeByLeftBlock(s);
export const fbDone = (s: string[]) => { const n = norm(s); return !!n && solvedIn(n, FB); };
export const sbDone = (s: string[]) => { const n = norm(s); return !!n && solvedIn(n, FB) && solvedIn(n, SB); };
export const eodfdbDone = (s: string[]) => {
  const n = norm(s);
  return !!n && solvedIn(n, LOW) && TOP_EDGES.every((i) => n[i] === "U") && n[U_CENTER] === "U";
};
export function aufToSolve(s: string[]): string | null {
  const n = norm(s);
  if (!n) return null;
  let a = n;
  for (let k = 0; k < 4; k++) {
    if (a.join("") === SOLVED_S) return AUF[k];
    a = apply(a, "U");
  }
  return null;
}
const solvedUpToAuf = (s: string[]) => aufToSolve(s) !== null;
const fbOnRight = (s: string[]) => fbDone(apply(s, "y2"));
const PREDICATES = [fbDone, sbDone, eodfdbDone, solvedUpToAuf];

export interface Stage { name: string; moves: string[]; stm: number; done: boolean; forced: boolean; note?: string }
export interface EodInfo { found: Found<EodCase>; userStm: number; listedStm?: number }
export interface ZbInfo { found: Found<ZbCase>; userStm: number; listed?: { alg: string; stm: number; finalAuf: string }[]; shortest?: number }
export interface Breakdown {
  ok: boolean;
  error?: string;
  stages: Stage[];
  rest: string[];
  restNote?: string;
  total: number;
  endAuf: string | null;
  eod?: EodInfo;
  zb?: ZbInfo;
}

const fail = (error: string): Breakdown => ({ ok: false, error, stages: [], rest: [], total: 0, endAuf: null });

export function breakdown(scramble: string, solution: string, eodByKey: Map<string, EodCase>, zbByKey: Map<string, ZbCase>): Breakdown {
  if (!scramble.trim()) return fail("Paste a scramble.");
  if (!solution.replace(/\//g, "").trim()) return fail("Paste your solution.");
  let scr: string[];
  try { scr = parse(scramble); } catch (e) { return fail(`Scramble: ${(e as Error).message}.`); }
  const parts = solution.split("/");
  if (parts.length > STAGES.length) return fail(`Use at most ${STAGES.length - 1} "/" marks, one between each pair of stages.`);
  const moves: string[] = [], cuts: number[] = [];
  for (const [j, part] of parts.entries()) {
    try { moves.push(...parse(part)); } catch (e) { return fail(`Solution: ${(e as Error).message}.`); }
    if (j < parts.length - 1) cuts.push(moves.length);
  }
  const states = [apply(SOLVED, scr)];
  for (const m of moves) states.push(apply(states[states.length - 1], [m]));
  const N = moves.length;

  const stages: Stage[] = [];
  let start = 0, rest: string[] = [], restNote: string | undefined;
  for (let k = 0; k < STAGES.length; k++) {
    const forced = k < cuts.length;
    let end = -1;
    if (forced) { if (PREDICATES[k](states[cuts[k]])) end = cuts[k]; }
    else for (let j = start; j <= N; j++) if (PREDICATES[k](states[j])) { end = j; break; }
    if (k === 0) {
      const limit = end < 0 ? (forced ? cuts[0] : N) : end;
      for (let j = 0; j <= limit; j++) {
        if (fbOnRight(states[j]) && !fbDone(states[j])) {
          const stop = forced ? cuts[0] : N;
          stages.push({ name: STAGES[0], moves: moves.slice(0, stop), stm: stm(moves.slice(0, stop)), done: false, forced,
            note: "A block was finished on the right before one was finished on the left. This tool expects the first block on the left, with the bottom color on the bottom." });
          rest = moves.slice(stop);
          return finish(stages, rest, undefined, states, moves, scramble, eodByKey, zbByKey);
        }
      }
    }
    if (end < 0) {
      const stop = forced ? cuts[k] : N;
      stages.push({ name: STAGES[k], moves: moves.slice(start, stop), stm: stm(moves.slice(start, stop)), done: false, forced,
        note: forced ? `Not done at the "/".` : "Not done by the end of the solution." });
      rest = moves.slice(stop);
      if (rest.length) restNote = "Moves after this point were not checked.";
      break;
    }
    if (k === STAGES.length - 1) {
      while (end < N && moves[end][0] === "U") end++;
      if (end < N) { rest = moves.slice(end); restNote = "These moves come after the cube was already solved, apart from a final U turn."; }
    }
    stages.push({ name: STAGES[k], moves: moves.slice(start, end), stm: stm(moves.slice(start, end)), done: true, forced });
    start = end;
  }
  return finish(stages, rest, restNote, states, moves, scramble, eodByKey, zbByKey);
}

function finish(stages: Stage[], rest: string[], restNote: string | undefined, states: string[][], moves: string[], scramble: string,
  eodByKey: Map<string, EodCase>, zbByKey: Map<string, ZbCase>): Breakdown {
  const out: Breakdown = { ok: true, stages, rest, restNote, total: stm(moves), endAuf: null };
  const bound = (k: number) => stages.slice(0, k).reduce((a, s) => a + s.moves.length, 0);
  if (stages[1]?.done && stages[2]) {
    const found = lookupEodfdb(eodByKey, scramble, moves.slice(0, bound(2)).join(" "));
    out.eod = { found, userStm: stages[2].stm };
    if (found.ok) out.eod.listedStm = found.c.m + (found.pre ? 1 : 0);
  }
  if (stages[2]?.done && stages[3]) {
    const at = bound(3);
    const found = lookupZbll(zbByKey, scramble, moves.slice(0, at).join(" "));
    out.zb = { found, userStm: stages[3].stm };
    if (found.ok) {
      out.zb.listed = found.c.a.map(([alg]) => {
        const full = withPre(found.pre, alg);
        const finalAuf = aufToSolve(apply(states[at], full)) ?? "";
        return { alg: full, stm: stm(parse(full)) + (finalAuf ? 1 : 0), finalAuf };
      });
      out.zb.shortest = Math.min(...out.zb.listed.map((x) => x.stm));
    }
  }
  if (stages.length === STAGES.length && stages[3].done) out.endAuf = aufToSolve(states[bound(4)]);
  return out;
}

export function algCubingUrl(scramble: string, alg: string) {
  const enc = (a: string) => encodeURIComponent(a.replace(/'/g, "-").replace(/\s+/g, "_"));
  return `https://alg.cubing.net/?setup=${enc(scramble)}&alg=${enc(alg)}`;
}
