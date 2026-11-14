import { readFileSync } from "node:fs";
import { breakdown, STAGES } from "../web/src/lib/breakdown.ts";

const read = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url)));
const eod = read("../data/eodfdb.json").cases;
const zb = read("../data/zbll.json").cases;
const eodByKey = new Map(eod.map((c) => [c.key, { i: c.id, k: c.key, n: c.angle, g: c.group, m: c.optimal_moves, a: c.algs, f: false }]));
const zbByKey = new Map(zb.map((c) => [c.key, { i: c.id, k: c.key, sh: c.shape, st: c.state, n: c.name, a: c.algs.map((x) => [x.alg, x.moves]) }]));
const run = (scr, sol) => breakdown(scr, sol, eodByKey, zbByKey);
const norm = (a) => a.trim().split(/\s+/).filter(Boolean).join(" ");

let fails = 0, checks = 0;
const expect = (cond, msg) => { checks++; if (!cond) { fails++; console.log("FAIL", msg); } };

const solves = read("../data/solves/zbroux.json").solves;
for (const sv of solves) {
  const r = run(sv.scramble, sv.steps.map((s) => s.moves).join(" "));
  expect(r.ok, `${sv.id}: ${r.error}`);
  if (!r.ok) continue;
  expect(r.stages.length === 4 && r.stages.every((s) => s.done), `${sv.id}: not every stage done`);
  for (const [k, step] of sv.steps.entries()) {
    expect(step.step === STAGES[k], `${sv.id}: step name ${step.step}`);
    const got = r.stages[k] ? r.stages[k].moves.join(" ") : "(none)";
    expect(got === norm(step.moves), `${sv.id} ${step.step}: detected "${got}", hand-written "${norm(step.moves)}"`);
  }
  expect(r.rest.length === 0, `${sv.id}: leftover moves ${r.rest.join(" ")}`);
  expect(r.endAuf === "", `${sv.id}: ends unsolved (${r.endAuf})`);
  for (const step of sv.steps) {
    if (!step.case) continue;
    const info = step.set === "zbll" ? r.zb : r.eod;
    const id = info && info.found.ok ? info.found.c.i : `(${info?.found.error})`;
    expect(id === step.case, `${sv.id} ${step.step}: case ${id}, hand-written ${step.case}`);
  }
  const slashed = run(sv.scramble, sv.steps.map((s) => s.moves).join(" / "));
  expect(slashed.ok && slashed.stages.map((s) => s.moves.join(" ")).join("|") === r.stages.map((s) => s.moves.join(" ")).join("|"), `${sv.id}: "/" split differs`);
}

const sv = solves[0];
const sol = sv.steps.map((s) => s.moves).join(" ");
const cut = (r) => r.stages.map((s) => `${s.name}:${s.done ? "ok" : "no"}`).join(" ");

let r = run("", sol);
expect(!r.ok && /scramble/i.test(r.error), "empty scramble: " + r.error);
r = run(sv.scramble, "   ");
expect(!r.ok && /solution/i.test(r.error), "empty solution: " + r.error);
r = run(sv.scramble, sol.replace("M B", "M Q"));
expect(!r.ok && /Unknown move "Q"/.test(r.error), "typo: " + r.error);
r = run(sv.scramble, sol.split(" ").slice(0, -6).join(" "));
expect(r.ok && cut(r) === "First block:ok Second block:ok EODFDB:ok ZBLL:no" && r.endAuf === null, "unsolved: " + cut(r));
r = run(sv.scramble, sv.steps[0].moves + " " + sv.steps[1].moves + " U");
expect(r.ok && cut(r) === "First block:ok Second block:ok EODFDB:no" && !r.stages[3], "stops after first failing stage: " + cut(r));
expect(r.eod && r.eod.found.ok && r.eod.found.c.i === "pO7", "EODFDB case shown when blocks are done");
const mirror = (a) => a.split(" ").map((m) => {
  const f = { R: "L", L: "R", r: "l", l: "r" }[m[0]] ?? m[0];
  const t = m.slice(1);
  if (f === "M") return m;
  return f + (t === "2" ? "2" : t === "'" ? "" : "'");
}).join(" ");
r = run(mirror(sv.scramble), mirror(sol));
expect(r.ok && cut(r) === "First block:no" && /right/.test(r.stages[0].note), "first block on the right: " + cut(r));
r = run(sv.scramble, sol + " R");
expect(r.ok && r.rest.join(" ") === "R" && r.stages[3].done, "moves after solved go to rest");
r = run(sv.scramble, sol + " U");
expect(r.ok && r.endAuf === "U'" && r.stages[3].moves.at(-1) === "U" && r.rest.length === 0, "final AUF counted in ZBLL: " + r.endAuf);
r = run(sv.scramble, "a / b / c / d / e");
expect(!r.ok, "too many slashes");

r = run(`${sv.scramble} y`, `y' ${sol}`);
expect(r.ok && r.stages.every((s) => s.done) && r.stages[0].moves[0] === "y'" && r.stages[0].stm === sv.steps[0].moves.split(" ").length, "rotation at start: " + cut(r));
r = run(sv.scramble, `${sv.steps[0].moves} ${sv.steps[1].moves} ${sv.steps[2].moves} y2 ${mirrorY2(sv.steps[3].moves)}`);
expect(r.ok && r.stages[3].done && r.stages[3].moves[0] === "y2" && r.zb.found.ok && r.zb.found.c.i === "S1-07" && r.stages[3].stm === 14, "rotation before ZBLL: " + cut(r) + " " + (r.zb?.found.c?.i ?? r.zb?.found.error));
const zl = r.zb.listed.find((x) => x.stm === r.zb.shortest);
expect(zl && zl.stm >= 1, "listed ZBLL counted");

function mirrorY2(a) {
  const m = { R: "L", L: "R", F: "B", B: "F", r: "l", l: "r", f: "b", b: "f" };
  return a.split(" ").map((t) => (m[t[0]] ?? t[0]) + t.slice(1)).join(" ");
}

console.log(`breakdown: solves=${solves.length} checks=${checks} failures=${fails}`);
process.exit(fails ? 1 : 0);
