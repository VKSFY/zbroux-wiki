import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { cube3x3x3 } from "cubing/puzzles";
import { solve, buildTable, BLOCKS, tableInfo, ROTATIONS, fbLength, slashed } from "../web/src/lib/solver.ts";
import { breakdown, stm } from "../web/src/lib/breakdown.ts";
import { lookupEodfdb, lookupZbll } from "../web/src/lib/case-lookup.ts";
import { apply, parse, SOLVED, normalizeByCenters } from "../web/src/lib/cube.ts";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const eodByKey = new Map(read("../data/eodfdb.json").cases.map((c) => [c.key, { i: c.id, k: c.key, n: c.angle, g: c.group, m: c.optimal_moves, a: c.algs, f: false }]));
const zbByKey = new Map(read("../data/zbll.json").cases.map((c) => [c.key, { i: c.id, k: c.key, sh: c.shape, st: c.state, n: c.name, a: c.algs.map((x) => [x.alg, x.moves]) }]));

let seed = 20261114;
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
const pick = (a) => a[Math.floor(rnd() * a.length)];
const EXTRA = ["Rw", "Lw", "Uw", "r", "l", "u", "x", "y", "z"];
function scramble(i) {
  const out = [];
  let prev = "";
  while (out.length < 25) {
    const f = i % 3 && rnd() < 0.12 ? pick(EXTRA) : pick([..."UDLRFB"]);
    if (f === prev) continue;
    prev = f;
    out.push(f + pick(["", "'", "2"]));
  }
  return out.join(" ");
}

let fails = 0, checks = 0;
const expect = (cond, msg) => { checks++; if (!cond) { fails++; if (fails < 15) console.log("FAIL", msg); } };
const kp = await cube3x3x3.kpuzzle();
const cubingSolved = (scr, sol) => kp.defaultPattern().applyAlg(`${scr} ${sol}`).experimentalIsSolved({ ignorePuzzleOrientation: true, ignoreCenterOrientation: true });

let t0 = performance.now();
buildTable(BLOCKS.FB);
const fbTableMs = performance.now() - t0;
t0 = performance.now();
buildTable(BLOCKS.SB);
const sbTableMs = performance.now() - t0;

function check(id, scr, r) {
  expect(r.ok, `${id}: ${r.error}`);
  if (!r.ok) return;
  const all = r.stages.flatMap((x) => x.moves);
  const end = normalizeByCenters(apply(SOLVED, [...parse(scr), ...all]));
  expect(end.join("") === SOLVED.join(""), `${id}: cube.ts says not solved`);
  const bd = breakdown(scr, slashed(r.stages), eodByKey, zbByKey);
  expect(bd.ok && bd.stages.length === 4 && bd.stages.every((x) => x.done) && bd.rest.length === 0, `${id}: breakdown not four Done`);
  expect(bd.ok && bd.stages.every((x, k) => x.moves.join(" ") === r.stages[k].moves.join(" ")), `${id}: breakdown boundaries differ`);
  const before = [...r.stages[0].moves, ...r.stages[1].moves].join(" ");
  const e = lookupEodfdb(eodByKey, scr, before);
  expect(e.ok, `${id}: EODFDB lookup failed`);
  if (e.ok) {
    if (e.c.a.length) {
      expect(r.eod && r.eod.id === e.c.i, `${id}: EODFDB case differs`);
      const want = e.c.a.map((a) => [e.pre, a].filter(Boolean).join(" "));
      expect(want.includes(r.stages[2].moves.join(" ")), `${id}: EODFDB moves are not pre-U plus a listed algorithm`);
      expect(r.stages[2].stm === e.c.m + (e.pre ? 1 : 0), `${id}: EODFDB count`);
    } else expect(r.stages[2].moves.length === 0, `${id}: EODFDB should be empty`);
  }
  const z = lookupZbll(zbByKey, scr, [before, ...r.stages[2].moves].join(" "));
  if (z.ok) {
    expect(r.zb && r.zb.id === z.c.i, `${id}: ZBLL case differs`);
    expect(r.zb && r.zb.alts.every((a) => a.stm >= r.stages[3].stm), `${id}: a listed ZBLL algorithm is shorter than the chosen one`);
  } else expect(z.solved && !r.zb, `${id}: ZBLL lookup ${z.error}`);
  return bd;
}

const N = 300;
const scrambles = Array.from({ length: N }, (_, i) => scramble(i));
const ms = { fb: [], sb: [], eod: [], zbll: [], solve: [], all24: [] };
const fixed = [];
let autoSame = 0, withExtra = 0;
for (const [i, scr] of scrambles.entries()) {
  if (/[xyzrlu]|w/.test(scr)) withExtra++;
  let t = performance.now();
  const r = solve(scr, eodByKey, zbByKey);
  ms.solve.push(performance.now() - t);
  check(`#${i} fixed`, scr, r);
  fixed.push(r);
  if (r.ok) {
    for (const k of ["fb", "sb", "eod", "zbll"]) ms[k].push(r.ms[k]);
    const auto = breakdown(scr, r.stages.flatMap((x) => x.moves).join(" "), eodByKey, zbByKey);
    if (auto.ok && auto.stages.every((x, k) => x.done && x.moves.join(" ") === r.stages[k].moves.join(" "))) autoSame++;
    expect(r.stages[0].stm === fbLength(scr, ""), `#${i}: first block not the table optimum`);
  }
  t = performance.now();
  const results = ROTATIONS.map((rot) => solve(scr, eodByKey, zbByKey, rot));
  ms.all24.push(performance.now() - t);
  for (const [k, rr] of results.entries()) check(`#${i} ${ROTATIONS[k] || "none"}`, scr, rr);
  const best = results.filter((x) => x.ok).sort((a, b) => a.total - b.total)[0];
  expect(best && fixed[i].ok && best.total <= fixed[i].total, `#${i}: 24 placements did worse than fixed`);
}

const sample = scrambles.slice(0, 30).map((scr, i) => ({ scramble: scr, rotation: "", fb: fixed[i].stages[0].stm }))
  .concat(scrambles.slice(0, 30).map((scr, i) => ({ scramble: scr, rotation: ROTATIONS[(i * 7) % 24], fb: fbLength(scr, ROTATIONS[(i * 7) % 24]) })));
writeFileSync(new URL("_fb_vecs.json", import.meta.url), JSON.stringify(sample));
let py = "";
try { py = execFileSync("python", ["check_fb_optimal.py", "_fb_vecs.json"], { cwd: new URL(".", import.meta.url), encoding: "utf8" }).trim(); }
catch (e) { py = (e.stdout ?? "") + (e.stderr ?? ""); expect(false, "python first-block check failed"); }

let cubingOk = 0;
for (const [i, scr] of scrambles.slice(0, 30).entries()) {
  const r = fixed[i];
  const ok = cubingSolved(scr, r.stages.flatMap((x) => x.moves).join(" "));
  expect(ok, `#${i}: cubing.js says not solved`);
  const rot = ROTATIONS[(i * 7) % 24];
  const rr = solve(scr, eodByKey, zbByKey, rot);
  const ok2 = rr.ok && cubingSolved(scr, rr.stages.flatMap((x) => x.moves).join(" "));
  expect(ok2, `#${i} ${rot}: cubing.js says not solved`);
  if (ok && ok2) cubingOk++;
}

const q = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
const f = (x) => x.toFixed(2);
const worst = fixed.reduce((a, r) => (r.ok && r.total > (a?.total ?? 0) ? r : a), null);
console.log(py);
console.log(`node ${process.version}; tables: ${tableInfo().map((t) => `${t.name} ${(t.bytes / 1e6).toFixed(2)} MB, ${t.states} positions, max depth ${t.maxDepth}`).join("; ")}`);
console.log(`table build ms: first block ${fbTableMs.toFixed(0)}, second block ${sbTableMs.toFixed(0)}`);
for (const k of Object.keys(ms)) console.log(`${k.padEnd(6)} median ${f(q(ms[k], 0.5))} ms, worst ${f(q(ms[k], 1))} ms`);
console.log(`scrambles=${N} (with wide moves or rotations: ${withExtra}), auto split same as intended: ${autoSame}/${N}, cubing.js solved: ${cubingOk}/30 (fixed and rotated)`);
console.log(`worst total (fixed): ${worst.total} STM, stages ${worst.stages.map((x) => x.stm).join("/")}`);
console.log(`solver: checks=${checks} failures=${fails}`);
process.exit(fails ? 1 : 0);
