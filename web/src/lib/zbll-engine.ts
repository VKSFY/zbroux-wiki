import { STICKERS, SOLVED, MOVES, apply, parse, normalizeByCenters } from "./cube.ts";

const U = MOVES["U"];
const turnU = (s: string) => { let o = ""; for (let i = 0; i < 54; i++) o += s[U[i]]; return o; };

const PIECE = new Map<string, number[]>();
STICKERS.forEach((st, i) => { const k = st.p.join(); PIECE.set(k, [...(PIECE.get(k) ?? []), i]); });
const pieceOf = STICKERS.map((st) => PIECE.get(st.p.join())!);
const ORIGIN = new Map<string, number>();
STICKERS.forEach((st, i) => {
  const cols = pieceOf[i].map((j) => SOLVED[j]).sort().join("");
  ORIGIN.set(cols + "|" + SOLVED[i], i);
});
const UTURNED = apply(SOLVED, "U").join("");

export function relabelU(s: string): string {
  let o = "";
  for (let i = 0; i < 54; i++) {
    const cols = pieceOf[i].map((j) => s[j]).sort().join("");
    o += UTURNED[ORIGIN.get(cols + "|" + s[i])!];
  }
  return o;
}

export function canon(s: string): string {
  let best = s, a = s;
  for (let i = 0; i < 4; i++) {
    let b = a;
    for (let j = 0; j < 4; j++) { if (b < best) best = b; b = relabelU(b); }
    a = turnU(a);
  }
  return best;
}

export function preAufFor(s: string, display: string): string | null {
  let a = s;
  for (let p = 0; p < 4; p++) {
    let b = a;
    for (let j = 0; j < 4; j++) { if (b === display) return ["", "U", "U2", "U'"][p]; b = relabelU(b); }
    a = turnU(a);
  }
  return null;
}

export interface ZbllLookup { ok: boolean; error?: string; key?: string; state?: string; solved?: boolean }

export function findZbll(scramble: string, moves: string): ZbllLookup {
  let s: string[];
  try { s = apply(SOLVED, parse(scramble).concat(parse(moves))); }
  catch (e) { return { ok: false, error: (e as Error).message }; }
  s = normalizeByCenters(s);
  const f2l = STICKERS.every((st, i) => st.p[1] === 1 || s[i] === SOLVED[i]);
  if (!f2l) return { ok: false, error: "The first two layers aren't solved after these moves. ZBLL starts once everything except the top layer is done." };
  const eo = STICKERS.every((st, i) => !(st.p[1] === 1 && st.n[1] === 1 && st.p.filter((c) => c !== 0).length === 2) || s[i] === "U");
  if (!eo) return { ok: false, error: "Some top-layer edges aren't oriented, so this isn't a ZBLL case. In ZBRoux, EODFDB orients them." };
  const str = s.join("");
  const key = canon(str);
  return { ok: true, key, state: str, solved: key === canon(SOLVED.join("")) };
}
