import { cube3x3x3 } from "cubing/puzzles";
import { Alg } from "cubing/alg";
import { readFileSync } from "node:fs";

const kp = await cube3x3x3.kpuzzle();
const solved = kp.defaultPattern();
const data = JSON.parse(readFileSync(new URL("../data/zbll.json", import.meta.url)));
const AUF = ["", "U", "U2", "U'"];
const isSolvedUpToAUF = (p) => AUF.some((a) => (a ? p.applyAlg(a) : p).isIdentical(solved));

function f2lSolvedEOLL(p) {
  const E = p.patternData.EDGES, C = p.patternData.CORNERS, S = solved.patternData;
  for (let i = 4; i < 12; i++) if (E.pieces[i] !== S.EDGES.pieces[i] || E.orientation[i] !== 0) return false;
  for (let i = 4; i < 8; i++) if (C.pieces[i] !== S.CORNERS.pieces[i] || C.orientation[i] !== 0) return false;
  for (let i = 0; i < 4; i++) if (E.orientation[i] !== 0) return false;
  const Z = p.patternData.CENTERS;
  for (let i = 0; i < 6; i++) if (Z.pieces[i] !== S.CENTERS.pieces[i]) return false;
  return true;
}
const sig = (p) => JSON.stringify([p.patternData.CORNERS, p.patternData.EDGES]);

let algs = 0, fails = 0;
const seen = new Map();
for (const c of data.cases) {
  const first = c.algs[0].alg;
  const caseT = kp.algToTransformation(new Alg(first).invert());
  const P = solved.applyTransformation(caseT);
  if (!f2lSolvedEOLL(P)) { fails++; console.log("not a ZBLL state", c.id); }
  if (P.isIdentical(solved)) { fails++; console.log("solved state listed as case", c.id); }
  for (const a of c.algs) {
    algs++;
    if (!isSolvedUpToAUF(P.applyAlg(a.alg))) { fails++; if (fails < 8) console.log("FAIL", c.id, a.alg); }
    if (new Alg(a.alg).experimentalNumChildAlgNodes() < 1) {}
  }
  let key = null;
  for (const pre of AUF) for (const post of AUF) {
    const t = kp.algToTransformation(new Alg(`${pre} ${new Alg(first).invert().toString()} ${post}`));
    const s = sig(solved.applyTransformation(t));
    if (key === null || s < key) key = s;
  }
  if (seen.has(key)) { fails++; console.log("duplicate case", c.id, "=", seen.get(key)); } else seen.set(key, c.id);
}
console.log(`cubing.js: cases=${data.cases.length} distinct=${seen.size} algs checked=${algs} failures=${fails}`);
process.exit(fails ? 1 : 0);
