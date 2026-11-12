import type { APIRoute } from "astro";
import eodfdb from "../../../../data/eodfdb.json";
import zbll from "../../../../data/zbll.json";
import cmll from "../../../../data/cmll.json";
import eostripe from "../../../../data/eostripe.json";
import stats from "../../../../data/stats.json";

export const VERSION = "2026-11-12";

const csv = (header: string[], rows: (string | number)[][]) =>
  [header, ...rows].map((r) => r.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))).join(",")).join("\n") + "\n";
const algCols = (algs: string[]) => [0, 1, 2, 3].map((i) => algs[i] ?? "");

const e = eodfdb as any, z = zbll as any, c = cmll as any, s = eostripe as any;

const FILES: Record<string, { type: string; body: () => string }> = {
  "eodfdb.json": { type: "application/json", body: () => JSON.stringify(e) },
  "zbll.json": { type: "application/json", body: () => JSON.stringify(z) },
  "cmll.json": { type: "application/json", body: () => JSON.stringify(c) },
  "eostripe.json": { type: "application/json", body: () => JSON.stringify(s) },
  "stats.json": { type: "application/json", body: () => JSON.stringify(stats) },
  "eodfdb.csv": {
    type: "text/csv",
    body: () => csv(
      ["id", "centres", "group", "flipped_edges", "moves", "alg1", "alg2", "alg3", "alg4", "mirror_of", "mirror_alg"],
      e.cases.map((x: any) => [x.id, x.centres, x.group, x.bad_edges, x.optimal_moves, ...algCols(x.algs), x.mirror_of, x.mirror_of === x.id ? "" : x.mirror_alg]),
    ),
  },
  "zbll.csv": {
    type: "text/csv",
    body: () => csv(
      ["id", "shape", "corner_group", "moves", "alg1", "alg2", "alg3", "alg4"],
      z.cases.map((x: any) => [x.id, x.shape, x.group, x.algs[0].moves, ...algCols(x.algs.map((a: any) => a.alg))]),
    ),
  },
  "cmll.csv": {
    type: "text/csv",
    body: () => csv(
      ["id", "moves", "weight_of_648", "alg1", "alg2", "alg3", "alg4"],
      c.cases.map((x: any) => [x.id, x.algs[0].moves, x.weight, ...algCols(x.algs.map((a: any) => a.alg))]),
    ),
  },
  "eostripe.csv": {
    type: "text/csv",
    body: () => csv(
      ["id", "set", "centres", "flipped_edges", "moves", "alg1", "alg2", "alg3", "alg4"],
      [...s.sets.eo.map((x: any) => ["eo", x]), ...s.sets.stripe.map((x: any) => ["stripe", x])]
        .map(([set, x]: any) => [x.id, set, x.centres, x.bad_edges, x.optimal_moves, ...algCols(x.algs)]),
    ),
  },
};

export const MANIFEST = {
  version: VERSION,
  files: Object.keys(FILES).sort(),
  moves: "STM; the turn of the top layer before an algorithm is not counted",
  source: "https://github.com/VKSFY/zbroux-wiki",
};

export function getStaticPaths() {
  return [...Object.keys(FILES), "index.json"].map((file) => ({ params: { file } }));
}

export const GET: APIRoute = ({ params }) => {
  const name = params.file!;
  if (name === "index.json") {
    return new Response(JSON.stringify(MANIFEST, null, 1), { headers: { "Content-Type": "application/json" } });
  }
  const f = FILES[name];
  return new Response(f.body(), { headers: { "Content-Type": `${f.type}; charset=utf-8` } });
};
