import raw from "../../../data/eodfdb.json";

export type Piece = "LL" | "DF" | "DB";
export interface Slot { piece: Piece; flip: boolean }
export type SlotName = "UF" | "UR" | "UB" | "UL" | "DF" | "DB";
export interface EodfdbCase {
  id: string;
  key: string;
  slots: Record<SlotName, Slot>;
  centres: "solved" | "off-M" | "off-M'" | "off-M2";
  u_centre: string;
  f_centre: string;
  group: "both-in-U-opposite" | "both-in-U-adjacent" | "one-in-U" | "none-in-U";
  bad_edges: number;
  optimal_moves: number;
  n_optimal: number;
  algs: string[];
  mirror_of: string;
  mirror_alg: string;
}

export const meta = (raw as any).meta;
export const cases = (raw as any).cases as EodfdbCase[];

export const GROUPS: { key: EodfdbCase["group"]; label: string; blurb: string }[] = [
  { key: "both-in-U-opposite", label: "Both in U, opposite", blurb: "DF and DB are both in the U layer, across from each other." },
  { key: "both-in-U-adjacent", label: "Both in U, adjacent", blurb: "DF and DB are both in the U layer, next to each other." },
  { key: "one-in-U", label: "One in U", blurb: "One of DF / DB is in the U layer, the other is in a D slot." },
  { key: "none-in-U", label: "Neither in U", blurb: "DF and DB both sit in the D slots (possibly swapped or flipped)." },
];

export function set46() {
  const chosen = cases.filter((c) => c.group === "both-in-U-opposite" && (c.centres === "solved" || c.centres === "off-M2"));
  const excluded = chosen.filter((c) => c.bad_edges === 0);
  const kept = chosen.filter((c) => c.bad_edges > 0)
    .sort((a, b) => Number(a.centres !== "solved") - Number(b.centres !== "solved") || a.optimal_moves - b.optimal_moves || a.id.localeCompare(b.id));
  const seen = new Set<string>();
  const list: EodfdbCase[] = [];
  for (const c of kept) {
    if (seen.has(c.id)) continue;
    seen.add(c.id); seen.add(c.mirror_of);
    list.push(c);
  }
  return { chosen, excluded, kept, list };
}

export function stats(list: EodfdbCase[]) {
  const n = list.length;
  const avg = n ? list.reduce((a, c) => a + c.optimal_moves, 0) / n : 0;
  const max = Math.max(...list.map((c) => c.optimal_moves));
  const dist: Record<number, number> = {};
  for (const c of list) dist[c.optimal_moves] = (dist[c.optimal_moves] ?? 0) + 1;
  return { n, avg, max, dist };
}
