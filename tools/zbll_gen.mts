import { MOVES, SOLVED, STICKERS } from "../web/src/lib/cube.ts";
import { readFileSync, writeFileSync } from "node:fs";

const [setName, kAs, kBs, onlyFile, tag] = process.argv.slice(2);
const MODE = process.env.LL_MODE === "cmll" ? "cmll" : "zbll";
const only: number[] | null = onlyFile ? JSON.parse(readFileSync(onlyFile, "utf8")) : null;
const kA = Number(kAs), kB = Number(kBs);
const FACES = setName.split("");
const MOVELIST = FACES.flatMap((f) => [f, f + "'", f + "2"]);
const AXIS: Record<string, number> = { U: 1, D: 1, R: 0, L: 0, r: 0, F: 2, B: 2 };
const ORDER: Record<string, number> = { U: 0, D: 1, R: 0, L: 1, r: 2, F: 0, B: 1 };
const PERM = MOVELIST.map((m) => Uint8Array.from(MOVES[m]));
const inv = (m: string) => (m.endsWith("2") ? m : m.endsWith("'") ? m[0] : m + "'");
const dec = new TextDecoder("latin1");
const enc = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const key = (a: Uint8Array) => dec.decode(a);

function allowed(prev: string | undefined, m: string) {
  if (!prev) return true;
  const a = prev[0], b = m[0];
  if (a === b) return false;
  if (AXIS[a] === AXIS[b] && ORDER[b] < ORDER[a]) return false;
  return true;
}

const table = new Map<string, string[]>();
const nz = (p: number[]) => p.filter((c) => c !== 0).length;
const goal = SOLVED.map((c, i) => {
  if (MODE !== "cmll") return c;
  const p = STICKERS[i].p;
  if (nz(p) === 2 && (p[1] === 1 || p[0] === 0)) return "e";
  if (nz(p) === 1 && p[0] === 0) return "c";
  return c;
});
const solved = enc(goal.join(""));
const bufs = Array.from({ length: Math.max(kA, kB) + 2 }, () => new Uint8Array(54));
const path: string[] = [];
function back(s: Uint8Array, depth: number) {
  const k = key(s);
  const b = path.slice().reverse().map(inv).join(" ");
  const e = table.get(k);
  if (!e) table.set(k, [b]); else if (e.length < 3) e.push(b);
  if (depth === kB) return;
  const t = bufs[depth + 1];
  for (let i = 0; i < MOVELIST.length; i++) {
    const m = MOVELIST[i];
    if (!allowed(path[path.length - 1], m)) continue;
    const p = PERM[i];
    for (let j = 0; j < 54; j++) t[j] = s[p[j]];
    path.push(m); back(t, depth + 1); path.pop();
  }
}
let t0 = performance.now();
back(solved, 0);
console.error(`[${setName}] table: ${table.size} states (depth ${kB}) in ${Math.round(performance.now() - t0)} ms`);

const cases = JSON.parse(readFileSync(`_${MODE}_cases.json`, "utf8"));
const results: { i: number; sols: string[] }[] = [];
const fb = Array.from({ length: kA + 2 }, () => new Uint8Array(54));
t0 = performance.now();
for (let ci = 0; ci < cases.length; ci++) {
  if (only && !only.includes(ci)) continue;
  const found = new Set<string>();
  const VS = cases[ci].variants as string[];
  for (let vi = 0; vi < VS.length; vi++) {
    const pre = ["", "U", "U2", "U'"][Math.floor(vi / 4)];
    const start = enc(VS[vi]);
    const fwd = (s: Uint8Array, depth: number) => {
      const hit = table.get(key(s));
      if (hit) for (const b of hit) {
        const a = [pre, path.join(" "), b].filter(Boolean).join(" ");
        const sol = a;
        if (sol && found.size < 1000) found.add(sol);
      }
      if (depth === kA) return;
      const t = fb[depth + 1];
      for (let i = 0; i < MOVELIST.length; i++) {
        const m = MOVELIST[i];
        if (!allowed(path[path.length - 1], m)) continue;
        if (depth === 0 && m[0] === "U") continue;
        const p = PERM[i];
        for (let j = 0; j < 54; j++) t[j] = s[p[j]];
        path.push(m); fwd(t, depth + 1); path.pop();
      }
    };
    fwd(start, 0);
  }
  results.push({ i: ci, sols: [...found] });
  if (ci % 50 === 0) console.error(`[${setName}] case ${ci}/${cases.length} ${Math.round(performance.now() - t0)} ms`);
}
writeFileSync(`_${MODE}_${setName}${tag ?? ""}.json`, JSON.stringify(results));
const covered = results.filter((r) => r.sols.length).length;
console.error(`[${setName}] done: ${covered}/${only ? only.length : cases.length} cases have solutions, ${Math.round(performance.now() - t0)} ms`);
