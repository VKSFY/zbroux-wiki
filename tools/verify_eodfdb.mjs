import { readFileSync } from "node:fs";

const SOLVED = [..."UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"];

const U_CYC = [
  [0, 2], [2, 8], [8, 6], [6, 0], [1, 5], [5, 7], [7, 3], [3, 1],
  [18, 36], [19, 37], [20, 38], [36, 45], [37, 46], [38, 47],
  [45, 9], [46, 10], [47, 11], [9, 18], [10, 19], [11, 20],
];
const M_CYC = [
  [1, 19], [4, 22], [7, 25], [19, 28], [22, 31], [25, 34],
  [28, 52], [31, 49], [34, 46], [46, 7], [49, 4], [52, 1],
];
function quarter(state, cyc) {
  const out = state.slice();
  for (const [a, b] of cyc) out[b] = state[a];
  return out;
}
function apply(state, alg) {
  for (const tok of alg.trim().split(/\s+/).filter(Boolean)) {
    const cyc = tok[0] === "U" ? U_CYC : tok[0] === "M" ? M_CYC : null;
    if (!cyc || tok.length > 2) throw new Error("bad move " + tok);
    const n = tok.endsWith("2") ? 2 : tok.endsWith("'") ? 3 : 1;
    for (let i = 0; i < n; i++) state = quarter(state, cyc);
  }
  return state;
}

const eq = (a, b) => a.join("") === b.join("");
for (const m of ["U", "M"]) {
  if (!eq(apply(SOLVED, `${m} ${m} ${m} ${m}`), SOLVED)) throw new Error(m + "^4");
}
if (eq(apply(SOLVED, "M"), SOLVED) || eq(apply(SOLVED, "U"), SOLVED)) throw new Error("move is identity");
if (apply(SOLVED, "M")[19] !== "U" || apply(SOLVED, "U")[36] !== "F") throw new Error("direction");
for (const [seq, k] of [["M2 U2", 4], ["M U", 8], ["M' U", 8], ["M U2", 12], ["M2 U", 12], ["M U M' U'", 5], ["M' U M U2", 12]]) {
  let s = apply(SOLVED, seq), n = 1;
  while (!eq(s, SOLVED)) { s = apply(s, seq); n++; }
  if (n !== k) throw new Error(`order of ${seq}: js=${n} py=${k}`);
}

const SLOT = { UF: [7, 19], UR: [5, 10], UB: [1, 46], UL: [3, 37], DF: [28, 25], DB: [34, 52] };
const OPP = { U: "D", D: "U", F: "B", B: "F" };

function buildState(c) {
  const s = SOLVED.slice();
  for (const i of [0, 2, 6, 8, 9, 11, 18, 20, 36, 38, 45, 47]) s[i] = ".";
  for (const [name, { piece, flip }] of Object.entries(c.slots)) {
    const [p, q] = SLOT[name];
    const [a, b] = piece === "LL" ? ["U", "x"] : piece === "DF" ? ["D", "F"] : ["D", "B"];
    s[p] = flip ? b : a;
    s[q] = flip ? a : b;
  }
  s[4] = c.u_centre; s[22] = c.f_centre; s[31] = OPP[c.u_centre]; s[49] = OPP[c.f_centre];
  return s;
}

function isGoal(s) {
  for (const i of [1, 3, 5, 7]) if (s[i] !== "U") return false;
  for (let i = 0; i < 54; i++) {
    const inULayer = i < 9 || [9, 10, 11, 18, 19, 20, 36, 37, 38, 45, 46, 47].includes(i);
    if (!inULayer && s[i] !== SOLVED[i]) return false;
  }
  return true;
}

const data = JSON.parse(readFileSync(new URL("../data/eodfdb.json", import.meta.url)));
let algs = 0, fails = 0, lenMismatch = 0;
for (const c of data.cases) {
  const start = buildState(c);
  for (const alg of c.algs) {
    algs++;
    if (!isGoal(apply(start, alg))) { fails++; if (fails < 5) console.log("FAIL", c.id, alg); }
    if (alg.split(/\s+/).filter(Boolean).length !== c.optimal_moves) lenMismatch++;
  }
  if (c.optimal_moves > 0 && isGoal(start)) { fails++; console.log("already solved but dist>0", c.id); }
}
const byId = new Map(data.cases.map((c) => [c.id, c]));
let mirrors = 0;
for (const c of data.cases) {
  if (!c.algs[0]) continue;
  mirrors++;
  if (!isGoal(apply(buildState(byId.get(c.mirror_of)), c.mirror_alg))) { fails++; if (fails < 5) console.log("MIRROR FAIL", c.id, c.mirror_alg); }
}
console.log(`cases=${data.cases.length} algs checked=${algs} mirror algs checked=${mirrors} failures=${fails} length mismatches=${lenMismatch}`);
process.exit(fails ? 1 : 0);
