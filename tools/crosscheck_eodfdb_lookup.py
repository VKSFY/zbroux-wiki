import json, random, subprocess, sys
from cube import STICKERS, SOLVED, MOVES, INDEX, NORMAL_TO_FACE, invert, apply
from check_solve import eodfdb_done
random.seed(11)
def nz(p): return sum(1 for c in p if c)
mask = []
for (p, n), col in zip(STICKERS, SOLVED):
    if p[1] == 1 and nz(p) == 3: mask.append(".")
    elif p[1] == 1 and nz(p) == 2: mask.append("U" if n == (0, 1, 0) else "x")
    else: mask.append(col)
GOAL = "".join(mask)
def mv(s, m): p = MOVES[m]; return "".join(s[p[i]] for i in range(54))
def canon(s):
    o = [s]
    for _ in range(3): o.append(mv(o[-1], "U"))
    return min(o)
data = json.load(open("../data/eodfdb.json"))["cases"]
keys = {c["key"]: c["id"] for c in data}
by_key = {c["key"]: c for c in data}
GEN = ["U", "U'", "U2", "M", "M'", "M2"]
ROTS = ["", "x2", "z2 y", "y'", "x y2"]
vecs = []
for k in range(300):
    seq = [random.choice(GEN) for _ in range(random.randint(0, 25))]
    st = GOAL
    for m in seq: st = mv(st, m)
    T = ROTS[k % len(ROTS)]
    scr = " ".join(filter(None, [T, " ".join(seq), " ".join(invert(T)) if T else ""]))
    vecs.append({"scramble": scr, "blocks": T, "expect": canon(st)})
vecs.append({"scramble": "D B' L D' B' D' L' D' B L2 B D B' F2 D2 R B' L R B' F' L' F2 L2 U'",
             "blocks": "U L B' L F D M B R U2 r U' r U' r2 U' R2 U' R", "expect_id": "pO7"})
vecs.append({"scramble": "R U", "blocks": "", "expect_error": True})
json.dump(vecs, open("_lv.json", "w"))
open("_lr.mts", "w").write('''
import { findEodfdb } from "../web/src/lib/eodfdb-engine.ts";
import { readFileSync, writeFileSync } from "node:fs";
const v = JSON.parse(readFileSync("_lv.json", "utf8"));
writeFileSync("_lo.json", JSON.stringify(v.map((x) => findEodfdb(x.scramble, x.blocks))));
''')
r = subprocess.run(["node", "_lr.mts"], capture_output=True, text=True); print(r.stderr[:500])
out = json.load(open("_lo.json"))
fails = 0
checked = 0
for v, o in zip(vecs, out):
    if v.get("expect_error"):
        if o["ok"]: fails += 1; print("expected error", v)
    elif "expect_id" in v:
        got = keys.get(o.get("key"))
        print("your ZBRoux solve ->", got, "turns to key:", o.get("turns"))
        if got != v["expect_id"]: fails += 1
    elif not o["ok"] or o["key"] != v["expect"] or o["key"] not in keys:
        fails += 1; print("mismatch", v["scramble"], o)
    else:
        c = by_key[o["key"]]
        pre = ["", "U", "U2", "U'"][(o["turns"] + c["angle"]) % 4]
        state = apply(SOLVED, (v["scramble"] + " " + v["blocks"]).strip())
        state = apply(state, (pre + " " + c["algs"][0]).strip())
        cmap = {
            state[INDEX[((-1, 0, 0), (-1, 0, 0))]]: "L",
            state[INDEX[((1, 0, 0), (1, 0, 0))]]: "R",
            state[INDEX[((-1, -1, 0), (0, -1, 0))]]: "D",
            state[INDEX[((-1, 0, 1), (0, 0, 1))]]: "F",
            state[INDEX[((-1, 0, -1), (0, 0, -1))]]: "B",
        }
        cmap[(set(state) - set(cmap)).pop()] = "U"
        st = "".join(cmap[x] for x in state)
        if not eodfdb_done(st):
            fails += 1; print("pre-AUF + alg does not finish EODFDB", v["scramble"], pre, c["id"])
        checked += 1
for f in ["_lv.json", "_lo.json", "_lr.mts"]:
    import os; os.remove(f)
print(f"lookup vectors={len(vecs)} pre-AUF + alg verified={checked} failures={fails}")
sys.exit(1 if fails else 0)
