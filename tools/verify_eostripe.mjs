import { readFileSync } from "node:fs";

const SOLVED = [..."UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"];
const CYC = {
  U: [[0,2],[2,8],[8,6],[6,0],[1,5],[5,7],[7,3],[3,1],[18,36],[19,37],[20,38],[36,45],[37,46],[38,47],[45,9],[46,10],[47,11],[9,18],[10,19],[11,20]],
  M: [[1,19],[4,22],[7,25],[19,28],[22,31],[25,34],[28,52],[31,49],[34,46],[46,7],[49,4],[52,1]],
  R: [[9,11],[11,17],[17,15],[15,9],[10,14],[14,16],[16,12],[12,10],
      [20,2],[23,5],[26,8],[2,51],[5,48],[8,45],[45,35],[48,32],[51,29],[29,20],[32,23],[35,26]],
};
const quarter = (s, c) => { const o = s.slice(); for (const [a, b] of c) o[b] = s[a]; return o; };
function turn(s, f, n) { for (let i = 0; i < ((n % 4) + 4) % 4; i++) s = quarter(s, CYC[f]); return s; }
function apply(s, alg) {
  for (const t of alg.trim().split(/\s+/).filter(Boolean)) {
    const n = t.endsWith("2") ? 2 : t.endsWith("'") ? 3 : 1;
    if (t[0] === "r") { s = turn(s, "R", n); s = turn(s, "M", -n); }
    else if ("URM".includes(t[0])) s = turn(s, t[0], n);
    else throw new Error("bad move " + t);
  }
  return s;
}
const eq = (a, b) => a.join("") === b.join("");
for (const [seq, k] of [["R U",105],["R U R' U'",6],["R U2",30],["r U",120],["r U R'",8],["M U R",420],["R2 U M'",24]]) {
  let s = apply(SOLVED, seq), n = 1; while (!eq(s, SOLVED)) { s = apply(s, seq); n++; }
  if (n !== k) throw new Error(`order(${seq}) js=${n} py=${k}`);
}

const SLOT = { UF:[7,19], UR:[5,10], UB:[1,46], UL:[3,37], FR:[23,12], BR:[48,14], DR:[32,16], DF:[28,25], DB:[34,52] };
const OPP = { U: "D", D: "U", F: "B", B: "F" };

function build(c) {
  const s = SOLVED.slice();
  for (const i of [0,2,6,8,9,11,15,17,18,20,26,29,35,45,47,51,36,38]) s[i] = ".";
  for (const [name, { piece, flip }] of Object.entries(c.slots)) {
    const [p, q] = SLOT[name];
    const [a, b] = piece === "E" ? ["o", "x"] : piece === "DF" ? ["D", "F"] : ["D", "B"];
    s[p] = flip ? b : a; s[q] = flip ? a : b;
  }
  s[4] = c.u_centre; s[22] = c.f_centre; s[31] = OPP[c.u_centre]; s[49] = OPP[c.f_centre];
  return s;
}
function isGoal(s) {
  for (const n of ["UF","UR","UB","UL","FR","BR","DR"]) if (s[SLOT[n][0]] !== "o") return false;
  if (s[28] !== "D" || s[25] !== "F" || s[34] !== "D" || s[52] !== "B") return false;
  if (s[4] !== "U" || s[22] !== "F" || s[31] !== "D" || s[49] !== "B") return false;
  for (const i of [39,40,41,42,43,44, 21,24, 27,30,33, 50,53]) if (s[i] !== SOLVED[i]) return false;
  return true;
}

const data = JSON.parse(readFileSync(new URL("../data/eostripe.json", import.meta.url)));
let algs = 0, fails = 0, len = 0;
for (const [set, list] of Object.entries(data.sets)) {
  for (const c of list) {
    const s0 = build(c);
    if (isGoal(s0)) { fails++; console.log("case already solved", set, c.id); }
    for (const a of c.algs) {
      algs++;
      if (!isGoal(apply(s0, a))) { fails++; if (fails < 6) console.log("FAIL", set, c.id, a); }
      if (a.split(/\s+/).filter(Boolean).length !== c.optimal_moves) len++;
    }
  }
}
console.log(`EO cases=${data.sets.eo.length} stripe cases=${data.sets.stripe.length} algs checked=${algs} failures=${fails} length mismatches=${len}`);
process.exit(fails || len ? 1 : 0);
