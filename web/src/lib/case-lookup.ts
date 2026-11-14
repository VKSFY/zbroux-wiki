import { findEodfdb, AUF } from "./eodfdb-engine.ts";
import { findZbll, preAufFor } from "./zbll-engine.ts";
import { parse } from "./cube.ts";

export type Found<T> = { ok: true; c: T; pre: string } | { ok: false; error: string; solved?: boolean };

export function lookupEodfdb<T extends { n: number }>(byKey: Map<string, T>, scramble: string, moves: string): Found<T> {
  const r = findEodfdb(scramble, moves);
  if (!r.ok) return { ok: false, error: r.error ?? "Couldn't read that." };
  const c = byKey.get(r.key!);
  if (!c) return { ok: false, error: "That isn't an EODFDB position. Check the moves." };
  return { ok: true, c, pre: AUF[(r.turns! + c.n) % 4] };
}

export function lookupZbll<T extends { st: string }>(byKey: Map<string, T>, scramble: string, moves: string): Found<T> {
  const r = findZbll(scramble, moves);
  if (!r.ok) return { ok: false, error: r.error ?? "Couldn't read that." };
  if (r.solved) return { ok: false, solved: true, error: "The last layer is already solved, apart from maybe one U turn." };
  const c = byKey.get(r.key!);
  if (!c) return { ok: false, error: "Couldn't match that to a ZBLL case." };
  return { ok: true, c, pre: preAufFor(r.state!, c.st) ?? "" };
}

export function withPre(pre: string, alg: string) {
  if (!pre) return alg;
  const q: Record<string, number> = { U: 1, U2: 2, "U'": 3 };
  const m = parse(alg);
  let t = q[pre];
  while (m.length && m[0][0] === "U") t += q[m.shift()!];
  t %= 4;
  return [t ? AUF[t] : "", ...m].filter(Boolean).join(" ");
}
