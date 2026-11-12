import { cube3x3x3 } from "cubing/puzzles";
import { Alg } from "cubing/alg";
import { readFileSync } from "node:fs";

const kp = await cube3x3x3.kpuzzle();
const solved = kp.defaultPattern();
const S = solved.patternData;
const data = JSON.parse(readFileSync(new URL("../data/cmll.json", import.meta.url)));
const AUF = ["", "U", "U2", "U'"];
const BLOCK_EDGES = [5, 7, 8, 9, 10, 11];
const BLOCK_CORNERS = [4, 5, 6, 7];

function blocksIntact(p) {
  const E = p.patternData.EDGES, C = p.patternData.CORNERS, Z = p.patternData.CENTERS;
  return BLOCK_EDGES.every((i) => E.pieces[i] === S.EDGES.pieces[i] && E.orientation[i] === 0)
    && BLOCK_CORNERS.every((i) => C.pieces[i] === S.CORNERS.pieces[i] && C.orientation[i] === 0)
    && Z.pieces[1] === S.CENTERS.pieces[1] && Z.pieces[3] === S.CENTERS.pieces[3];
}
function cornersSolved(p) {
  const C = p.patternData.CORNERS;
  return C.pieces.every((x, i) => x === S.CORNERS.pieces[i]) && C.orientation.every((o) => o === 0);
}
const solvedUpToAuf = (p) => AUF.some((a) => { const q = a ? p.applyAlg(a) : p; return blocksIntact(q) && cornersSolved(q); });
const cornerSig = (p) => JSON.stringify(p.patternData.CORNERS);

let algs = 0, fails = 0;
const seen = new Map();
for (const c of data.cases) {
  const P = solved.applyAlg(new Alg(c.algs[0].alg).invert());
  if (!blocksIntact(P) || solvedUpToAuf(P)) { fails++; console.log("not a CMLL case", c.id); }
  for (const a of c.algs) {
    algs++;
    if (!solvedUpToAuf(P.applyAlg(a.alg))) { fails++; if (fails < 6) console.log("FAIL", c.id, a.alg); }
  }
  let key = null;
  for (const pre of AUF) for (const post of AUF) {
    const t = kp.algToTransformation(new Alg(`${pre} ${new Alg(c.algs[0].alg).invert().toString()} ${post}`));
    const s = cornerSig(solved.applyTransformation(t));
    if (key === null || s < key) key = s;
  }
  if (seen.has(key)) { fails++; console.log("duplicate", c.id, seen.get(key)); } else seen.set(key, c.id);
}
console.log(`cubing.js CMLL: cases=${data.cases.length} distinct=${seen.size} algs checked=${algs} failures=${fails}`);
process.exit(fails ? 1 : 0);
