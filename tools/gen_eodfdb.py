import json, os
from collections import deque
from cube import STICKERS, SOLVED, MOVES, INDEX

GEN = ["U", "U'", "U2", "M", "M'", "M2"]

def n_nonzero(p): return sum(1 for c in p if c)

mask = []
for (p, n), col in zip(STICKERS, SOLVED):
    if p[1] == 1 and n_nonzero(p) == 3:
        mask.append(".")
    elif p[1] == 1 and n_nonzero(p) == 2:
        mask.append("U" if n == (0, 1, 0) else "x")
    else:
        mask.append(col)
GOAL = "".join(mask)

def mv(s, m):
    p = MOVES[m]
    return "".join(s[p[i]] for i in range(54))

dist = {GOAL: 0}
q = deque([GOAL])
while q:
    s = q.popleft()
    for m in GEN:
        t = mv(s, m)
        if t not in dist:
            dist[t] = dist[s] + 1
            q.append(t)

def auf_orbit(s):
    out = [s]
    for _ in range(3):
        out.append(mv(out[-1], "U"))
    return out

def canon(s): return min(auf_orbit(s))

AXIS = {"U": "U", "M": "M"}
def all_optimal(s, limit=400):
    sols = []
    def dfs(state, path):
        if len(sols) >= limit: return
        d = dist[state]
        if d == 0:
            sols.append(list(path)); return
        for m in GEN:
            if path and path[-1][0] == m[0]: continue
            t = mv(state, m)
            if dist[t] == d - 1:
                path.append(m); dfs(t, path); path.pop()
    dfs(s, [])
    return sols

def score(alg):
    return (len(alg), sum(m == "M" for m in alg), sum(m.endswith("2") for m in alg))

SLOTS = {"UF": (0, 1, 1), "UR": (1, 1, 0), "UB": (0, 1, -1), "UL": (-1, 1, 0),
         "DF": (0, -1, 1), "DB": (0, -1, -1)}

def primary_normal(pos):
    return (0, 1, 0) if pos[1] == 1 else (0, -1, 0)

def other_normal(pos):
    return tuple(c if i != 1 else 0 for i, c in enumerate(pos))

def describe(s):
    out = {}
    for name, pos in SLOTS.items():
        a = s[INDEX[(pos, primary_normal(pos))]]
        b = s[INDEX[(pos, other_normal(pos))]]
        stick = {a, b}
        if "U" in stick:
            piece, flip = "LL", a != "U"
        elif "D" in stick and "F" in stick:
            piece, flip = "DF", a != "D"
        elif "D" in stick and "B" in stick:
            piece, flip = "DB", a != "D"
        else:
            raise AssertionError((name, a, b))
        out[name] = {"piece": piece, "flip": flip}
    centre = s[INDEX[((0, 1, 0), (0, 1, 0))]]
    front = s[INDEX[((0, 0, 1), (0, 0, 1))]]
    return out, centre, front

def group_of(slots):
    where = [n for n, v in slots.items() if v["piece"] in ("DF", "DB")]
    inU = [n for n in where if n[0] == "U"]
    if len(inU) == 2:
        a, b = inU
        opp = {a, b} in ({"UF", "UB"}, {"UL", "UR"})
        return "both-in-U-opposite" if opp else "both-in-U-adjacent"
    if len(inU) == 1:
        return "one-in-U"
    return "none-in-U"

def bad_count(slots):
    return sum(v["flip"] for v in slots.values())

def mirror_alg(alg):
    out = []
    for m in alg:
        if m[0] == "U":
            out.append("U" if m == "U'" else "U'" if m == "U" else m)
        else:
            out.append(m)
    return out

GROUP_ORDER = ["both-in-U-opposite", "both-in-U-adjacent", "one-in-U", "none-in-U"]
CENTRE_NAME = {"U": "solved", "F": "off-M", "D": "off-M2", "B": "off-M'"}

cases = {}
for s in dist:
    c = canon(s)
    if c in cases: continue
    slots, centre, front = describe(c)
    cases[c] = {
        "key": c,
        "centres": CENTRE_NAME[centre],
        "u_centre": centre, "f_centre": front,
        "group": group_of(slots),
        "bad_edges": bad_count(slots),
        "order_moves": dist[c],
    }

def sort_key(item):
    c, d = item
    return (list(CENTRE_NAME.values()).index(d["centres"]), GROUP_ORDER.index(d["group"]),
            d["bad_edges"], d["order_moves"], c)

out = []
ids = {}
counters = {}
for c, d in sorted(cases.items(), key=sort_key):
    prefix = {"both-in-U-opposite": "O", "both-in-U-adjacent": "A",
              "one-in-U": "S", "none-in-U": "N"}[d["group"]]
    cpre = {"solved": "", "off-M": "m", "off-M2": "h", "off-M'": "p"}[d["centres"]]
    k = cpre + prefix
    counters[k] = counters.get(k, 0) + 1
    d["id"] = f"{k}{counters[k]}"
    ids[c] = d["id"]
    out.append(d)

def mirror_state(s):
    o = [None] * 54
    for i, (p, n) in enumerate(STICKERS):
        j = INDEX[((-p[0], p[1], p[2]), (-n[0], n[1], n[2]))]
        o[j] = {"R": "L", "L": "R"}.get(s[i], s[i])
    return "".join(o)

def angles(c):
    a = [c]
    for _ in range(3):
        a.append(mv(a[-1], "U"))
    return a

QUARTER = {"U": 1, "U2": 2, "U'": 3}
AUF_NAME = {1: "U", 2: "U2", 3: "U'"}


def with_pre_auf(pre, alg):
    moves = alg.split()
    q = QUARTER.get(pre, 0)
    while moves and moves[0] in QUARTER:
        q += QUARTER[moves.pop(0)]
    q %= 4
    return " ".join(([AUF_NAME[q]] if q else []) + moves)


def run(s, alg):
    for m in alg.split():
        s = mv(s, m)
    return s


for c, d in cases.items():
    d["mirror_of"] = ids[canon(mirror_state(c))]
by_id = {d["id"]: (c, d) for c, d in cases.items()}

display = {}
for d in out:
    c = d["key"]
    if c in display:
        continue
    a = angles(c)
    best = min(range(4), key=lambda b: (dist[a[b]], b))
    display[c] = a[best]
    m_key, _ = by_id[d["mirror_of"]]
    if m_key not in display:
        reflected = mirror_state(a[best])
        assert reflected in angles(m_key)
        display[m_key] = reflected

for c, d in cases.items():
    disp = display[c]
    slots, _, _ = describe(disp)
    sols = sorted(all_optimal(disp), key=score)
    d["angle"] = angles(c).index(disp)
    d["slots"] = slots
    d["optimal_moves"] = dist[disp]
    d["n_optimal"] = len(sols)
    d["algs"] = [" ".join(a) for a in sols[:4]]

for c, d in cases.items():
    target = display[by_id[d["mirror_of"]][0]]
    flipped = " ".join(mirror_alg(d["algs"][0].split())) if d["algs"][0] else ""
    for pre in ["", "U", "U2", "U'"]:
        cand = with_pre_auf(pre, flipped)
        if dist[run(target, cand)] == 0:
            d["mirror_alg"] = cand
            break
    else:
        raise AssertionError(d["id"])

for d in out:
    d.pop("order_moves")

os.makedirs("../data", exist_ok=True)
meta = {
    "set": "EODFDB",
    "method": "ZBRoux / LLOB / FLSZ",
    "goal": "DF and DB solved, M-slice centres solved, all LL edges oriented. LL permutation and AUF free (finish with ZBLL).",
    "moves": "<M,U>, STM (M2 and U2 count as 1)",
    "cases_are": "up to pre-AUF; each case is shown from the angle with the shortest solution (angle = U turns from the key)",
    "generated_by": "cubing/tools/gen_eodfdb.py (BFS, all optimal solutions)",
    "orientation": "Yellow top, green front. 'flip' = U/D sticker of the edge is not on the U/D face.",
}
with open("../data/eodfdb.json", "w") as f:
    json.dump({"meta": meta, "cases": out}, f, indent=1)

from collections import Counter
print("states", len(dist), "cases", len(out))
print(Counter((d["centres"], d["group"]) for d in out))
main = [d for d in out if d["centres"] == "solved"]
print("main set (centres solved):", len(main),
      "avg optimal", round(sum(d["optimal_moves"] for d in main) / len(main), 2),
      "max", max(d["optimal_moves"] for d in main))
for d in main[:5]:
    print(d["id"], d["optimal_moves"], d["algs"][:2])
