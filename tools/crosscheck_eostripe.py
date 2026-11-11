import json, random, subprocess, sys
from cube import apply, SOLVED, parse, invert
from eostripe_core import bfs, mask, GOAL, GEN

random.seed(7)
dist = bfs()
ROTS = ["", "x2", "z2 y", "x y2", "y", "z' x"]
vecs = []
for k in range(400):
    seq = " ".join(random.choice(GEN) for _ in range(random.randint(0, 30)))
    T = ROTS[k % len(ROTS)]
    scramble = " ".join(filter(None, [T, seq, " ".join(invert(T)) if T else ""]))
    m = mask(apply(SOLVED, seq))
    vecs.append({"scramble": scramble, "lb": T, "masked": m, "dist": dist[m]})
vecs.append({"scramble": "F U", "lb": "", "expect_error": True})
vecs.append({"scramble": "D", "lb": "", "expect_error": True})
vecs.append({"scramble": "R U", "lb": "x2", "expect_error": True})
json.dump(vecs, open("_vecs.json", "w"))

js = r'''
import { analyse } from "../web/src/lib/eostripe-engine.ts";
import { readFileSync, writeFileSync } from "node:fs";
const vecs = JSON.parse(readFileSync("_vecs.json", "utf8"));
const t0 = performance.now();
const out = vecs.map((v) => { const a = analyse(v.scramble, v.lb); return { ok: a.ok, error: a.error, masked: a.masked, optimal: a.optimal, sols: (a.solutions ?? []).slice(0, 5).map((s) => s.join(" ")), n: a.solutions?.length, bad: a.badEdges }; });
writeFileSync("_out.json", JSON.stringify(out));
console.log("engine ran", vecs.length, "cases in", Math.round(performance.now() - t0), "ms");
'''
open("_run.mts", "w").write(js)
r = subprocess.run(["node", "_run.mts"], capture_output=True, text=True)
print(r.stdout.strip(), r.stderr.strip()[:2000])
out = json.load(open("_out.json"))

fails = 0; checked = 0
for v, o in zip(vecs, out):
    if v.get("expect_error"):
        if o["ok"]: fails += 1; print("expected error, got ok", v)
        continue
    if not o["ok"]: fails += 1; print("engine error", v["scramble"], o["error"]); continue
    if o["masked"] != v["masked"]: fails += 1; print("mask mismatch", v["scramble"]); continue
    if o["optimal"] != v["dist"]: fails += 1; print("dist mismatch", v, o["optimal"]); continue
    for sol in o["sols"]:
        checked += 1
        if len(parse(sol)) if sol else 0 != v["dist"]: pass
        end = mask(apply(apply(SOLVED, v["scramble"]), v["lb"] + " " + sol)) if False else None
        seq_state = apply(SOLVED, [m for m in parse(v["scramble"])])
        full = apply(seq_state, parse(v["lb"]) + (parse(sol) if sol else []))
        from cube import STICKERS, INDEX, NORMAL_TO_FACE
        cmap = {full[INDEX[(n, n)]]: f for n, f in NORMAL_TO_FACE.items()}
        full = tuple(cmap[c] for c in full)
        if mask(full) != GOAL or len(parse(sol) if sol else []) != v["dist"]:
            fails += 1; print("bad solution", v["scramble"], sol)
print(f"vectors={len(vecs)} solutions re-verified={checked} failures={fails}")
sys.exit(1 if fails else 0)
