import json, glob, collections
from cube import apply, parse, SOLVED, STICKERS
from zbll_cases import relabel_u

SOLVED_S = "".join(SOLVED)
cases = json.load(open("_zbll_cases.json"))
sols = collections.defaultdict(dict)
for f in sorted(glob.glob("_zbll_*.json")):
    if f.endswith("_cases.json") or "missing" in f: continue
    st = f[len("_zbll_"):-len(".json")].rstrip("+")
    for r in json.load(open(f)):
        for a in r["sols"]:
            sols[r["i"]].setdefault(a, st)

W = {"R": 1.0, "U": 1.0, "r": 1.15, "D": 1.5, "F": 1.5, "L": 1.5, "B": 2.0}
HALF = {"U": 0.1, "R": 0.3, "r": 0.3, "D": 0.3, "F": 0.4, "L": 0.4, "B": 0.4}
def split_auf(alg):
    seq = parse(alg)
    pre = []
    while seq and seq[0][0] == "U":
        pre.append(seq.pop(0))
    return pre, seq
def score(alg):
    pre, body = split_auf(alg)
    return sum(W[m[0]] + (HALF[m[0]] if m.endswith("2") else 0) for m in body) + 0.3 * len(pre)

Q = {"": 1, "2": 2, "'": 3}
def simplify(alg):
    out = []
    for m in parse(alg):
        f, q = m[0], Q[m[1:]]
        if out and out[-1][0] == f:
            t = (out[-1][1] + q) % 4
            out.pop()
            if t: out.append((f, t))
        else:
            out.append((f, q))
    return " ".join(f + {1: "", 2: "2", 3: "'"}[q] for f, q in out)

LL_PIECES = {}
for _i, (_p, _n) in enumerate(STICKERS):
    if _p[1] == 1 and sum(1 for _c in _p if _c) >= 2:
        LL_PIECES.setdefault(_p, []).append(_i)


def moved_pieces(state):
    corners = edges = 0
    for p, ids in LL_PIECES.items():
        if sorted(state[i] for i in ids) != sorted(SOLVED_S[i] for i in ids):
            if sum(1 for c in p if c) == 3:
                corners += 1
            else:
                edges += 1
    return corners + edges, corners


def calmest_view(state):
    views = [state]
    for _ in range(3):
        views.append(relabel_u(views[-1]))
    return min(views, key=lambda v: (moved_pieces(v), views.index(v)))


PLL_ALGS = {
    "Aa": "x L2 D2 L' U' L D2 L' U L' x'",
    "Ab": "x' L2 D2 L U L' D2 L U' L x",
    "E": "x' L' U L D' L' U' L D L' U' L D' L' U L D x",
    "F": "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    "Ga": "R2 U R' U R' U' R U' R2 U' D R' U R D'",
    "Gb": "R' U' R U D' R2 U R' U R U' R U' R2 D",
    "Gc": "R2 U' R U' R U R' U R2 U D' R U' R' D",
    "Gd": "R U R' U' D R2 U' R U' R' U R' U R2 D'",
    "H": "M2 U M2 U2 M2 U M2",
    "Ja": "x R2 F R F' R U2 r' U r U2 x'",
    "Jb": "R U R' F' R U R' U' R' F R2 U' R'",
    "Na": "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    "Nb": "R' U R U' R' F' U' F R U R' F R' F' R U' R",
    "Ra": "R U' R' U' R U R D R' U' R D' R' U2 R'",
    "Rb": "R2 F R U R U' R' F' R U2 R' U2 R",
    "T": "R U R' U' R' F R2 U' R' U' R U R' F'",
    "Ua": "M2 U M U2 M' U M2",
    "Ub": "M2 U' M U2 M' U' M2",
    "V": "R' U R' U' y R' F' R2 U' R' U R' F R F y'",
    "Y": "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    "Z": "M' U M2 U M2 U M' U2 M2",
}


def pll_names(cases):
    names = {}
    for name, alg in PLL_ALGS.items():
        hits = [c["id"] for c in cases if c["shape"] == "PLL"
                and any(solves(apply(tuple(c["state"]), pre) if pre else c["state"], alg) for pre in ["", "U", "U2", "U'"])]
        assert len(hits) == 1, (name, hits)
        assert hits[0] not in names, (name, hits)
        names[hits[0]] = name
    assert len(names) == 21
    return names


def solves(state, alg):
    s = apply(tuple(state), alg)
    for a in ["", "U", "U2", "U'"]:
        if (apply(s, a) if a else s) == SOLVED: return True
    return False

def auf_amount(pre):
    q = {"U": 1, "U2": 2, "U'": 3}
    return sum(q[m] for m in pre) % 4
AUF = {0: [], 1: ["U"], 2: ["U2"], 3: ["U'"]}

out, bad, missing = [], 0, []
for i, c in enumerate(cases):
    cand = []
    for a0, st in sols.get(i, {}).items():
        a = simplify(a0)
        if not solves(c["state"], a):
            bad += 1; continue
        cand.append((score(a), a, st))
    if not cand:
        missing.append(i); continue
    cand.sort()
    best = cand[0][1]
    k = auf_amount(split_auf(best)[0])
    disp = "".join(apply(tuple(c["state"]), AUF[k])) if k else c["state"]
    disp = calmest_view(disp)
    algs, seen = [], set()
    for sc, a, st in cand:
        pre, body = split_auf(a)
        rel = (auf_amount(pre) - k) % 4
        norm = " ".join(AUF[rel] + body)
        if norm in seen: continue
        assert solves(disp, norm), (i, norm)
        seen.add(norm)
        algs.append({"alg": norm, "moves": len(body), "set": st})
        if len(algs) == 4: break
    out.append({"key": c["state"], "shape": c["shape"], "corners": c["corners"], "state": disp, "algs": algs,
                "best_moves": algs[0]["moves"], "candidates": len(cand)})

SHAPES = ["PLL", "T", "U", "L", "H", "Pi", "S", "AS"]
out.sort(key=lambda d: (SHAPES.index(d["shape"]), d["corners"], d["best_moves"], d["algs"][0]["alg"]))
gnum = {}
cnt = collections.Counter()
for d in out:
    g = gnum.setdefault((d["shape"], d["corners"]), sum(1 for k in gnum if k[0] == d["shape"]) + 1)
    d["group"] = g
    cnt[(d["shape"], g)] += 1
    d["id"] = f"{d['shape']}{g}-{cnt[(d['shape'], g)]:02d}"
    del d["corners"]

names = pll_names(out)
for d in out:
    if d["id"] in names:
        d["name"] = names[d["id"]]

json.dump({"meta": {
    "set": "ZBLL", "cases": len(out),
    "generated_by": "cubing/tools/zbll_gen.mts (bidirectional search per move subset), ranked by zbll_build.py",
    "subsets": "RU (<=16 moves), RUD / RUF / RUL / RUr (<=14 moves)",
    "ranking": "heuristic: R,U=1, r=1.15, D/F/L=1.5, B=2 per move; half turns +0.1 (U) to +0.4 (F/L/B); +0.3 per pre-AUF",
    "orientation": "Yellow top, green front. Diagram shows the angle the first alg starts from.",
  }, "cases": out}, open("../data/zbll.json", "w"), indent=1)
print(f"cases with algs: {len(out)}/{len(cases)}  rejected candidates: {bad}  missing: {len(missing)}")
bm = [d['best_moves'] for d in out]
print("best alg length avg", round(sum(bm)/len(bm), 2), "max", max(bm), collections.Counter(d['algs'][0]['set'] for d in out))
if missing: json.dump(missing, open("_zbll_missing.json", "w")); print("missing ids:", [cases[i]['shape'] for i in missing][:40])
