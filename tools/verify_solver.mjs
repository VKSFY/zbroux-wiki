import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { cube3x3x3 } from "cubing/puzzles";
import { solve, solveBlock, buildTable, BLOCKS, tableInfo, ROTATIONS, fbLength, slashed, rank, mirrorMoves, mirrorAlg, reflectState, centersAfter, COLOR_NAME } from "../web/src/lib/solver.ts";
import { breakdown, fbDone, sbDone, stm } from "../web/src/lib/breakdown.ts";
import { lookupEodfdb, lookupZbll } from "../web/src/lib/case-lookup.ts";
import { apply, parse, SOLVED, normalizeByCenters } from "../web/src/lib/cube.ts";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const eodData = read("../data/eodfdb.json").cases, zbData = read("../data/zbll.json").cases;
const eodByKey = new Map(eodData.map((c) => [c.key, { i: c.id, k: c.key, n: c.angle, g: c.group, m: c.optimal_moves, a: c.algs, f: false }]));
const zbByKey = new Map(zbData.map((c) => [c.key, { i: c.id, k: c.key, sh: c.shape, st: c.state, n: c.name, a: c.algs.map((x) => [x.alg, x.moves]) }]));

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
const CUBING_POS = { top: 0, left: 1, front: 2, right: 3, back: 4, bottom: 5 };
const cubingCenters = (alg) => {
  const p = kp.defaultPattern().applyAlg(alg).patternData.CENTERS.pieces;
  return Object.fromEntries(Object.entries(CUBING_POS).map(([k, i]) => [k, COLOR_NAME["ULFRBD"[p[i]]]]));
};

const tableMs = {};
for (const k of ["FB", "SB", "SBL"]) { const t0 = performance.now(); buildTable(BLOCKS[k]); tableMs[k] = performance.now() - t0; }

const ALL_MOVES = "R L U D F B r l u d f b M E S x y z".split(" ").flatMap((f) => [f, f + "'", f + "2"]);
let mirrorBad = 0;
for (let i = 0; i < 500; i++) {
  const a = Array.from({ length: 20 }, () => pick(ALL_MOVES));
  if (reflectState(apply(SOLVED, a)).join("") !== apply(SOLVED, mirrorMoves(a)).join("")) mirrorBad++;
  if (mirrorMoves(mirrorMoves(a)).join(" ") !== a.join(" ")) mirrorBad++;
}
expect(mirrorBad === 0, `mirroring moves and mirroring the cube disagree ${mirrorBad} times`);

const stripU = (a) => { const m = parse(a); while (m.length && m[0][0] === "U") m.shift(); return m.join(" "); };
const withAlg = eodData.filter((c) => c.algs.length && c.algs[0]);
const withMirror = eodData.filter((c) => c.mirror_alg);
let mirrorAlgSame = 0;
for (const c of withMirror) if (stripU(c.mirror_alg) === stripU(mirrorAlg(c.algs[0]))) mirrorAlgSame++;
const zbMirrorFields = zbData.filter((c) => Object.keys(c).some((k) => /mirror/i.test(k)) || c.algs.some((a) => Object.keys(a).some((k) => /mirror/i.test(k)))).length;

function check(id, scr, r) {
  expect(r.ok, `${id}: ${r.error}`);
  if (!r.ok) return;
  const right = r.side === "right";
  const all = r.stages.flatMap((x) => x.moves);
  const end = normalizeByCenters(apply(SOLVED, [...parse(scr), ...all]));
  expect(end.join("") === SOLVED.join(""), `${id}: cube.ts says not solved`);
  const allowed = right ? /^[LlMU]['2]?$/ : /^[RrMU]['2]?$/;
  expect(r.stages[1].moves.every((m) => allowed.test(m)), `${id}: second block uses a move outside ${right ? "L l M U" : "R r M U"}`);
  const k = r.rotation ? parse(r.rotation).length : 0;
  expect(r.stages[0].moves.slice(0, k).join(" ") === (r.rotation ? parse(r.rotation).join(" ") : ""), `${id}: rotation is not at the start`);
  expect(r.stages[0].moves.slice(k).every((m) => /^[UDLRFB]['2]?$/.test(m)), `${id}: first block uses a move that isn't a face turn`);
  if (right) {
    const afterFb = apply(SOLVED, [...parse(scr), ...r.stages[0].moves]);
    const afterSb = apply(afterFb, r.stages[1].moves);
    expect(fbDone(apply(afterFb, "y2")) && sbDone(apply(afterSb, "y2")), `${id}: blocks not on the right then left`);
  }
  const ws = right ? r.mirror.scramble : scr;
  const wStages = right ? r.stages.map((x) => ({ moves: mirrorMoves(x.moves) })) : r.stages;
  expect(!right || r.mirror.solution === slashed(wStages), `${id}: mirror link does not match the solve`);
  const bd = breakdown(ws, slashed(wStages), eodByKey, zbByKey);
  expect(bd.ok && bd.stages.length === 4 && bd.stages.every((x) => x.done) && bd.rest.length === 0, `${id}: breakdown not four Done`);
  expect(bd.ok && bd.stages.every((x, j) => x.moves.join(" ") === wStages[j].moves.join(" ")), `${id}: breakdown boundaries differ`);
  const before = [...wStages[0].moves, ...wStages[1].moves].join(" ");
  const e = lookupEodfdb(eodByKey, ws, before);
  expect(e.ok, `${id}: EODFDB lookup failed`);
  if (e.ok) {
    if (e.c.a.length && e.c.a[0]) {
      expect(r.eod && r.eod.id === e.c.i, `${id}: EODFDB case differs`);
      const want = e.c.a.map((a) => [e.pre, a].filter(Boolean).join(" "));
      expect(want.includes(wStages[2].moves.join(" ")), `${id}: EODFDB moves are not pre-U plus a listed algorithm${right ? ", mirrored" : ""}`);
      expect(r.stages[2].stm === e.c.m + (e.pre ? 1 : 0), `${id}: EODFDB count`);
    } else expect(r.stages[2].moves.length === 0, `${id}: EODFDB should be empty`);
  }
  const z = lookupZbll(zbByKey, ws, [before, ...wStages[2].moves].join(" "));
  if (z.ok) {
    expect(r.zb && r.zb.id === z.c.i, `${id}: ZBLL case differs`);
    expect(r.zb && r.zb.alts.every((a) => a.stm >= r.stages[3].stm), `${id}: a listed ZBLL algorithm is shorter than the chosen one`);
  } else expect(z.solved && !r.zb, `${id}: ZBLL lookup ${z.error}`);
  return bd;
}

const N = 300;
const scrambles = Array.from({ length: N }, (_, i) => scramble(i));
const ms = { fb: [], sb: [], eod: [], zbll: [], solve: [], fbRight: [], sbLeft: [], eodRight: [], zbllRight: [], solveRight: [], all24: [] };
const fixed = [], rightSide = [];
let autoSame = 0, withExtra = 0, rightLower = 0, tie = 0, centerChecks = 0, sblSame = 0;
for (const [i, scr] of scrambles.entries()) {
  if (/[xyzrlu]|w/.test(scr)) withExtra++;
  let t = performance.now();
  const r = solve(scr, eodByKey, zbByKey);
  ms.solve.push(performance.now() - t);
  check(`#${i} left`, scr, r);
  fixed.push(r);
  if (r.ok) {
    for (const k of ["fb", "sb", "eod", "zbll"]) ms[k].push(r.ms[k]);
    const auto = breakdown(scr, r.stages.flatMap((x) => x.moves).join(" "), eodByKey, zbByKey);
    if (auto.ok && auto.stages.every((x, k) => x.done && x.moves.join(" ") === r.stages[k].moves.join(" "))) autoSame++;
    expect(r.stages[0].stm === fbLength(scr, ""), `#${i}: first block not the table length`);
  }

  t = performance.now();
  const q = solve(scr, eodByKey, zbByKey, "", "right");
  ms.solveRight.push(performance.now() - t);
  check(`#${i} right`, scr, q);
  rightSide.push(q);
  if (q.ok) {
    ms.fbRight.push(q.ms.fb); ms.sbLeft.push(q.ms.sb); ms.eodRight.push(q.ms.eod); ms.zbllRight.push(q.ms.zbll);
    expect(q.stages[0].stm === fbLength(scr, "", "right"), `#${i}: right first block not the table length`);
    const w = normalizeByCenters(apply(SOLVED, mirrorMoves([...parse(scr), ...q.stages[0].moves])));
    const viaSb = solveBlock(BLOCKS.SB, w, 1)[0].length;
    expect(viaSb === q.stages[1].stm, `#${i}: left second-block table gives ${q.stages[1].stm}, mirrored right table gives ${viaSb}`);
    if (viaSb === q.stages[1].stm) sblSame++;
  }
  if (r.ok && q.ok) { if (q.total < r.total) rightLower++; if (q.total === r.total) tie++; }

  t = performance.now();
  const results = ROTATIONS.map((rot) => solve(scr, eodByKey, zbByKey, rot));
  ms.all24.push(performance.now() - t);
  for (const [k, rr] of results.entries()) check(`#${i} ${ROTATIONS[k] || "none"}`, scr, rr);
  const pool = [r, q, ...results.slice(1)].filter((x) => x.ok).sort(rank);
  const noRot = [r, q].filter((x) => x.ok).sort(rank)[0];
  expect(pool[0] && noRot && pool[0].total <= noRot.total, `#${i}: allowing a rotation did worse than without`);
  expect(noRot && noRot.total === Math.min(r.total, q.total) && !noRot.rotation, `#${i}: rotationless pick is not the lower of the two sides`);

  for (const rot of ROTATIONS) {
    const alg = `${scr} ${rot}`.trim();
    const a = centersAfter(alg), b = cubingCenters(alg);
    expect(Object.keys(b).every((f) => a[f] === b[f]), `#${i} ${rot || "none"}: shown colors ${JSON.stringify(a)} differ from cubing.js ${JSON.stringify(b)}`);
    centerChecks++;
  }
}

const sample = [
  ...scrambles.slice(0, 30).map((scr, i) => ({ scramble: scr, rotation: "", side: "left", fb: fixed[i].stages[0].stm })),
  ...scrambles.slice(0, 30).map((scr, i) => ({ scramble: scr, rotation: ROTATIONS[(i * 7) % 24], side: "left", fb: fbLength(scr, ROTATIONS[(i * 7) % 24]) })),
  ...scrambles.slice(0, 30).map((scr, i) => ({ scramble: scr, rotation: "", side: "right", fb: rightSide[i].stages[0].stm })),
];
writeFileSync(new URL("_fb_vecs.json", import.meta.url), JSON.stringify(sample));
let py = "";
try { py = execFileSync("python", ["check_fb_optimal.py", "_fb_vecs.json"], { cwd: new URL(".", import.meta.url), encoding: "utf8" }).trim(); }
catch (e) { py = (e.stdout ?? "") + (e.stderr ?? ""); expect(false, "python first-block check failed"); }

let cubingOk = 0, cubingN = 0;
for (const [i, scr] of scrambles.entries()) {
  for (const r of [fixed[i], rightSide[i]]) {
    const ok = r.ok && cubingSolved(scr, r.stages.flatMap((x) => x.moves).join(" "));
    expect(ok, `#${i} ${r.side}: cubing.js says not solved`);
    cubingN++; if (ok) cubingOk++;
  }
  if (i < 30) {
    const rot = ROTATIONS[(i * 7) % 24];
    const rr = solve(scr, eodByKey, zbByKey, rot);
    const ok2 = rr.ok && cubingSolved(scr, rr.stages.flatMap((x) => x.moves).join(" "));
    expect(ok2, `#${i} ${rot}: cubing.js says not solved`);
    cubingN++; if (ok2) cubingOk++;
  }
}

const qn = (a, p) => { const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
const f = (x) => x.toFixed(2);
const worstOf = (list) => list.reduce((a, r) => (r.ok && r.total > (a?.total ?? 0) ? r : a), null);
const avg = (list) => (list.reduce((a, r) => a + r.total, 0) / list.length).toFixed(2);
const lower = scrambles.map((_, i) => Math.min(fixed[i].total, rightSide[i].total));
console.log(py);
console.log(`node ${process.version}; tables: ${tableInfo().map((t) => `${t.name} ${(t.bytes / 1e6).toFixed(2)} MB, ${t.states} positions, max depth ${t.maxDepth}`).join("; ")}`);
console.log(`table build ms: first block ${tableMs.FB.toFixed(0)}, second block ${tableMs.SB.toFixed(0)}, second block on the left ${tableMs.SBL.toFixed(0)}`);
for (const k of Object.keys(ms)) console.log(`${k.padEnd(10)} median ${f(qn(ms[k], 0.5))} ms, worst ${f(qn(ms[k], 1))} ms`);
console.log(`mirror: 500 random move sequences agree; EODFDB cases with a listed algorithm ${withAlg.length}, with mirror_alg ${withMirror.length}, mirror_alg equal to the listed algorithm mirrored (up to a leading U turn) ${mirrorAlgSame}; ZBLL cases with any mirror field ${zbMirrorFields} of ${zbData.length}`);
console.log(`left second-block table agrees with the mirrored right one: ${sblSame}/${N}`);
console.log(`scrambles=${N} (with wide moves or rotations: ${withExtra}), auto split same as intended (left): ${autoSame}/${N}, cubing.js solved: ${cubingOk}/${cubingN}, center colors checked: ${centerChecks}`);
console.log(`average total: left ${avg(fixed)}, right ${avg(rightSide)}, lower of the two ${(lower.reduce((a, b) => a + b, 0) / N).toFixed(2)}; right lower in ${rightLower}, tie in ${tie}`);
console.log(`worst total: left ${worstOf(fixed).total} (${worstOf(fixed).stages.map((x) => x.stm).join("/")}), right ${worstOf(rightSide).total} (${worstOf(rightSide).stages.map((x) => x.stm).join("/")})`);
console.log(`solver: checks=${checks} failures=${fails}`);
process.exit(fails ? 1 : 0);
