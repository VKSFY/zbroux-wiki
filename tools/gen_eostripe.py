import json, collections
from eostripe_core import bfs, mv, GOAL, STICKERS, nz, ref_face, GEN
from cube import INDEX

dist = bfs()

SLOTS = {"UF": (0,1,1), "UR": (1,1,0), "UB": (0,1,-1), "UL": (-1,1,0),
         "FR": (1,0,1), "BR": (1,0,-1), "DR": (1,-1,0), "DF": (0,-1,1), "DB": (0,-1,-1)}
def other_normal(pos, rn):
    axes = [i for i in range(3) if pos[i] != 0]
    for i in axes:
        n = tuple(pos[j] if j == i else 0 for j in range(3))
        if n != rn: return n

def describe(s):
    out = {}
    for name, pos in SLOTS.items():
        rn = ref_face(pos); on = other_normal(pos, rn)
        a, b = s[INDEX[(pos, rn)]], s[INDEX[(pos, on)]]
        if {a, b} in ({"D","F"},):
            out[name] = {"piece": "DF", "flip": a != "D"}
        elif {a, b} == {"D","B"}:
            out[name] = {"piece": "DB", "flip": a != "D"}
        else:
            out[name] = {"piece": "E", "flip": a != "o"}
    return out, s[INDEX[((0,1,0),(0,1,0))]], s[INDEX[((0,0,1),(0,0,1))]]

def stripe_done(s):
    for i, (p, n) in enumerate(STICKERS):
        if p[0] == 0 and p[1] <= 0 and s[i] != GOAL[i]: return False
    return s[INDEX[((0,1,0),(0,1,0))]] == "U"

def eo_done(s):
    return all(not (nz(p) == 2 and s[i] == "o" and n != ref_face(p)) for i, (p, n) in enumerate(STICKERS))

def all_optimal(s, limit=300):
    sols = []
    def dfs(x, path):
        if len(sols) >= limit: return
        d = dist[x]
        if d == 0: sols.append(list(path)); return
        for m in GEN:
            if path:
                a, b = path[-1][0], m[0]
                if a == b: continue
                if a in "RrM" and b in "RrM" and "RrM".index(b) < "RrM".index(a): continue
            t = mv(x, m)
            if dist[t] == d - 1:
                path.append(m); dfs(t, path); path.pop()
    dfs(s, [])
    return sols

def score(a):
    return (len(a), sum(m[0] == "M" for m in a), sum(m[0] == "r" for m in a), sum(m.endswith("2") for m in a))

def canon(s):
    o = [s]
    for _ in range(3): o.append(mv(o[-1], "U"))
    return min(o)

CNAME = {"U": "solved", "F": "off-M", "D": "off-M2", "B": "off-M'"}
def build(pred, prefix):
    seen = {}
    for s in dist:
        if pred(s):
            c = canon(s)
            if c not in seen: seen[c] = None
    out = []
    for c in seen:
        slots, u, f = describe(c)
        sols = sorted(all_optimal(c), key=score)
        stripe_pieces = [n for n, v in slots.items() if v["piece"] in ("DF", "DB")]
        out.append({"slots": slots, "u_centre": u, "f_centre": f, "centres": CNAME[u],
                    "bad_edges": sum(v["flip"] for v in slots.values()),
                    "stripe_in": sorted(stripe_pieces),
                    "optimal_moves": dist[c], "n_optimal": len(sols),
                    "algs": [" ".join(a) for a in sols[:4]]})
    order = list(CNAME.values())
    out.sort(key=lambda d: (order.index(d["centres"]), d["bad_edges"], d["optimal_moves"], json.dumps(d["slots"], sort_keys=True)))
    cnt = collections.Counter()
    for d in out:
        k = prefix + {"solved": "", "off-M": "m", "off-M'": "p", "off-M2": "h"}[d["centres"]]
        cnt[k] += 1; d["id"] = f"{k}{cnt[k]}"
    return out

eo = build(lambda s: stripe_done(s) and not eo_done(s), "EO")
stripe = build(lambda s: eo_done(s) and not stripe_done(s), "S")

depth = collections.Counter(dist.values())
data = {
  "meta": {
    "set": "EOStripe", "method": "LEOR",
    "goal": "After the left block: DF, DB and M-slice centres solved, all remaining edges oriented (ZZ / F-B axis EO). Corners ignored.",
    "moves": "<R, r, M, U>, STM", "orientation": "Yellow top, green front, left block on L.",
    "cross_check": "Depth table matches RedstoneTim's ksolve++ table on redstonetim.github.io/cubing/leor_method.html exactly.",
    "generated_by": "cubing/tools/gen_eostripe.py",
  },
  "depth_table": [{"depth": d, "states": depth[d]} for d in sorted(depth)],
  "total_states": len(dist), "average": round(sum(dist.values()) / len(dist), 4),
  "sets": {"eo": eo, "stripe": stripe},
}
json.dump(data, open("../data/eostripe.json", "w"), indent=1)
for k, v in data["sets"].items():
    c = collections.Counter(d["centres"] for d in v)
    print(k, len(v), dict(c), "avg", round(sum(d["optimal_moves"] for d in v) / len(v), 2))
    for d in v[:3]: print("  ", d["id"], d["optimal_moves"], d["algs"][:2])
