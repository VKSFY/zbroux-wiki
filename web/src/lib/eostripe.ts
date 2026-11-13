import raw from "../../../data/eostripe.json";
import type { Slots } from "./eostripe-diagram.ts";

export interface EsCase {
  id: string; slots: Slots; u_center: string; f_center: string;
  centers: "solved" | "off-M" | "off-M'" | "off-M2";
  bad_edges: number; stripe_in: string[]; optimal_moves: number; n_optimal: number; algs: string[];
}
const data = raw as any;
export const meta = data.meta;
export const depthTable = data.depth_table as { depth: number; states: number }[];
export const totalStates = data.total_states as number;
export const average = data.average as number;
export const eoCases = data.sets.eo as EsCase[];
export const stripeCases = data.sets.stripe as EsCase[];

export const STRIPE_VARIANTS = [
  { slug: undefined, centers: "solved", label: "Centers solved" },
  { slug: "centers-m", centers: "off-M", label: "Centers off by M" },
  { slug: "centers-m-prime", centers: "off-M'", label: "Centers off by M'" },
  { slug: "centers-m2", centers: "off-M2", label: "Centers off by M2" },
] as const;

const zone = (slot: string) => (slot[0] === "U" ? "U" : slot === "DF" || slot === "DB" ? "D" : "R");
export const STRIPE_GROUPS = [
  { key: "D+D", label: "Both at the bottom", blurb: "Both edges are in the bottom slots, swapped or flipped." },
  { key: "D+U", label: "One at the bottom, one on top", blurb: "One edge is in a bottom slot, the other is in the top layer." },
  { key: "D+R", label: "One at the bottom, one on the right", blurb: "One edge is in a bottom slot, the other is in the right layer (FR, BR or DR)." },
  { key: "U+U", label: "Both on top", blurb: "Both edges are in the top layer." },
  { key: "R+U", label: "One on top, one on the right", blurb: "One edge is in the top layer, the other is in the right layer (FR, BR or DR)." },
  { key: "R+R", label: "Both on the right", blurb: "Both edges are in the right layer (FR, BR or DR)." },
];
export const stripeGroup = (c: EsCase) => c.stripe_in.map(zone).sort().join("+");

export function stats(list: EsCase[]) {
  const n = list.length;
  return { n, avg: n ? list.reduce((a, c) => a + c.optimal_moves, 0) / n : 0, max: Math.max(...list.map((c) => c.optimal_moves)) };
}
