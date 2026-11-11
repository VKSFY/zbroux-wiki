import raw from "../../../data/zbll.json";

export interface ZbllAlg { alg: string; moves: number; set: string }
export interface ZbllCase { id: string; key: string; shape: string; group: number; state: string; algs: ZbllAlg[]; best_moves: number; candidates: number }
const data = raw as any;
export const meta = data.meta;
export const zbll = data.cases as ZbllCase[];

export const SHAPES = [
  { key: "T", name: "T", blurb: "Two adjacent corners oriented, the other two facing left and right." },
  { key: "U", name: "U", blurb: "Two adjacent corners oriented, the other two facing the same way (headlights on top)." },
  { key: "L", name: "L", blurb: "Two diagonal corners oriented." },
  { key: "H", name: "H", blurb: "No corners oriented, U stickers on two opposite sides." },
  { key: "Pi", name: "Pi", blurb: "No corners oriented, U stickers on three sides." },
  { key: "S", name: "S (Sune)", blurb: "One corner oriented, the other three twisted like Sune." },
  { key: "AS", name: "AS (Antisune)", blurb: "One corner oriented, the other three twisted like Antisune." },
  { key: "PLL", name: "PLL", blurb: "All corners already oriented: the 21 PLLs." },
] as const;

export const slug = (shape: string) => shape.toLowerCase();
export function stats(list: ZbllCase[]) {
  const n = list.length;
  return { n, avg: n ? list.reduce((a, c) => a + c.best_moves, 0) / n : 0, max: Math.max(...list.map((c) => c.best_moves)) };
}
