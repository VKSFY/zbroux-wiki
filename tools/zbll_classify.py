import json, collections
from zbll_cases import all_states, canon, relabel_u, C_POS, mv, SOLVED_S
from cube import STICKERS, INDEX, apply, SOLVED

U = (0, 1, 0)
def twists(s):
    out = []
    for pos in C_POS:
        if s[INDEX[(pos, U)]] == "U": out.append(None); continue
        for n in [(pos[0], 0, 0), (0, 0, pos[2])]:
            if s[INDEX[(pos, n)]] == "U": out.append(n)
    return out

def twist_dir(pos, n):
    cx = (U[1]*n[2]-U[2]*n[1], U[2]*n[0]-U[0]*n[2], U[0]*n[1]-U[1]*n[0])
    other = [m for m in [(pos[0], 0, 0), (0, 0, pos[2])] if m != n][0]
    return 1 if sum(cx[i]*other[i] for i in range(3)) < 0 else -1

SUNE_DIR = None
def shape(s):
    global SUNE_DIR
    t = twists(s)
    k = sum(x is None for x in t)
    if k == 4: return "PLL"
    if k == 1:
        d = {twist_dir(C_POS[i], n) for i, n in enumerate(t) if n}
        assert len(d) == 1
        if SUNE_DIR is None:
            sune = apply(SOLVED, "R U2 R' U' R U' R'")
            tt = twists("".join(sune))
            SUNE_DIR = [twist_dir(C_POS[i], n) for i, n in enumerate(tt) if n][0]
        return "S" if d.pop() == SUNE_DIR else "AS"
    if k == 2:
        idx = [i for i, x in enumerate(t) if x is None]
        if (idx[1] - idx[0]) % 2 == 0: return "L"
        a, b = [x for x in t if x]
        return "U" if a == b else "T"
    if k == 0:
        ns = t
        return "H" if len(set(ns)) == 2 else "Pi"
    raise AssertionError

def corner_key(s):
    def hide(x):
        x = list(x)
        for i, (p, n) in enumerate(STICKERS):
            if p[1] == 1 and sum(1 for c in p if c) == 2 and n != U: x[i] = "?"
        return "".join(x)
    best = None
    a = s
    for i in range(4):
        b = a
        for j in range(4):
            h = hide(b); best = h if best is None or h < best else best
            b = relabel_u(b)
        a = mv(a, "U")
    return best

if __name__ == "__main__":
    cases = sorted({canon(s) for s in all_states()})
    cases.remove(min(canon(SOLVED_S), canon(SOLVED_S)))
    out = []
    for s in cases:
        out.append({"state": s, "shape": shape(s), "corners": corner_key(s)})
    c = collections.Counter(d["shape"] for d in out)
    print(len(out), dict(sorted(c.items())))
    g = collections.Counter((d["shape"], d["corners"]) for d in out)
    per = collections.defaultdict(list)
    for (sh, _), n in g.items(): per[sh].append(n)
    print({k: (len(v), sorted(v)) for k, v in per.items()})
    json.dump(out, open("_zbll_cases.json", "w"))
