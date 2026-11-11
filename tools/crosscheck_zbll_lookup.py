import json, random, subprocess, os, sys
from cube import apply, SOLVED, invert, parse
random.seed(5)
cases = json.load(open("../data/zbll.json"))["cases"]
AUF = ["", "U", "U2", "U'"]
ROT = ["", "y", "x2", "z2 y'"]
vecs = []
for k in range(400):
    c = random.choice(cases)
    j, p = random.randrange(4), random.randrange(4)
    alg = c["algs"][0]["alg"]
    seq = " ".join(filter(None, [AUF[j], " ".join(invert(alg)), " ".join(invert(AUF[p])) if p else ""]))
    T = ROT[k % 4]
    scr = " ".join(filter(None, [T, seq, " ".join(invert(T)) if T else ""]))
    vecs.append({"scramble": scr, "moves": T, "id": c["id"], "alg": alg})
vecs.append({"scramble": "R U R' U'", "moves": "", "expect_error": True})
vecs.append({"scramble": "F R U R' U' F'", "moves": "", "expect_error": True})
json.dump(vecs, open("_zv.json", "w"))
open("_zr.mts", "w").write('''
import { findZbll, preAufFor } from "../web/src/lib/zbll-engine.ts";
import { readFileSync, writeFileSync } from "node:fs";
const data = JSON.parse(readFileSync("../data/zbll.json", "utf8")).cases;
const byKey = new Map(data.map((c) => [c.key, c]));
const v = JSON.parse(readFileSync("_zv.json", "utf8"));
writeFileSync("_zo.json", JSON.stringify(v.map((x) => {
  const r = findZbll(x.scramble, x.moves);
  if (!r.ok) return { ok: false, error: r.error };
  const c = byKey.get(r.key);
  return { ok: true, id: c?.id, pre: c ? preAufFor(r.state, c.state) : null };
})));
''')
r = subprocess.run(["node", "_zr.mts"], capture_output=True, text=True); print(r.stderr[:800])
out = json.load(open("_zo.json"))
fails = 0
for v, o in zip(vecs, out):
    if v.get("expect_error"):
        if o["ok"]: fails += 1; print("expected error", v["scramble"])
        continue
    if not o["ok"] or o["id"] != v["id"] or o["pre"] is None:
        fails += 1; print("lookup failed", v["id"], o); continue
    from cube import STICKERS, INDEX, NORMAL_TO_FACE
    s = apply(SOLVED, (v["scramble"] + " " + v["moves"]).strip())
    s = apply(s, (o["pre"] + " " + v["alg"]).strip())
    cmap = {s[INDEX[(n, n)]]: f for n, f in NORMAL_TO_FACE.items()}
    s = tuple(cmap[x] for x in s)
    if not any((apply(s, a) if a else s) == SOLVED for a in AUF):
        fails += 1; print("pre-AUF + alg doesn't solve", v["scramble"], o)
for f in ["_zv.json", "_zo.json", "_zr.mts"]: os.remove(f)
print(f"zbll lookup vectors={len(vecs)} failures={fails}")
sys.exit(1 if fails else 0)
