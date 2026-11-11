from collections import deque
from cube import STICKERS, SOLVED, MOVES, INDEX

GEN = ["U", "U'", "U2", "M", "M'", "M2"]

def is_corner(p): return sum(1 for c in p if c) == 3
def is_edge(p): return sum(1 for c in p if c) == 2

mask = []
for (p, n), col in zip(STICKERS, SOLVED):
    if p[1] == 1 and is_corner(p):
        mask.append(".")
    elif p[1] == 1 and is_edge(p):
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
print("masked states:", len(dist), " max optimal:", max(dist.values()))

def canon(s):
    c = [s]
    for _ in range(3):
        c.append(mv(c[-1], "U"))
    return min(c)

def mirror_alg_state(s):
    out = [None] * 54
    for i, (p, n) in enumerate(STICKERS):
        j = INDEX[((-p[0], p[1], p[2]), (-n[0], n[1], n[2]))]
        c = s[i]
        c = {"R": "L", "L": "R"}.get(c, c)
        out[j] = c
    return "".join(out)

U_CENTER = INDEX[((0, 1, 0), (0, 1, 0))]
F_CENTER = INDEX[((0, 0, 1), (0, 0, 1))]
def centers_ok(s): return s[U_CENTER] == "U"
def centers_ud(s): return s[U_CENTER] in "UD"

def dfdb_positions(s):
    pos = []
    for i, (p, n) in enumerate(STICKERS):
        if (p[0] == 0 or p[1] == 1) and is_edge(p) and s[i] == "D":
            pos.append(p)
    return pos

def bad_edges(s):
    bad = 0
    for i, (p, n) in enumerate(STICKERS):
        if is_edge(p) and (p[1] != 0 and p[0] == 0 or p[1] == 1):
            if s[i] in "UD" and n[1] == 0:
                bad += 1
    return bad

def report(name, pred):
    states = [s for s in dist if pred(s)]
    cases = {canon(s) for s in states}
    mir = set()
    for c in cases:
        mir.add(min(c, canon(mirror_alg_state(c))))
    print(f"{name:55s} states={len(states):5d} cases(modAUF)={len(cases):4d} +mirror={len(mir):4d}")

report("all", lambda s: True)
report("centres solved", centers_ok)
report("centres U/D (off by M2 allowed)", centers_ud)
report("centres solved, DF&DB both in U layer", lambda s: centers_ok(s) and all(p[1] == 1 for p in dfdb_positions(s)))
report("centres solved, DF&DB both in U, EO not solved", lambda s: centers_ok(s) and all(p[1]==1 for p in dfdb_positions(s)) and bad_edges(s) > 0)
report("centres solved, DF&DB not already solved", lambda s: centers_ok(s) and dfdb_positions(s) and True)
for b in (0, 2, 4, 6):
    report(f"centres solved, {b} bad edges", lambda s, b=b: centers_ok(s) and bad_edges(s) == b)

print("---- with y2 symmetry ----")
from cube import MOVES as MV
def y2_conj(s):
    t = mv(s, "y2")
    return "".join({"F": "B", "B": "F", "R": "L", "L": "R"}.get(c, c) for c in t)

def sym_classes(states, use_mirror, use_y2):
    seen = set()
    for s in states:
        orb = {canon(s)}
        changed = True
        while changed:
            changed = False
            for o in list(orb):
                cands = []
                if use_mirror: cands.append(canon(mirror_alg_state(o)))
                if use_y2: cands.append(canon(y2_conj(o)))
                for c in cands:
                    if c not in orb:
                        orb.add(c); changed = True
        seen.add(min(orb))
    return len(seen)

def rep2(name, pred):
    st = [s for s in dist if pred(s)]
    print(f"{name:55s} y2={sym_classes(st,False,True):4d} y2+mirror={sym_classes(st,True,True):4d}")

def inU(s): return all(p[1] == 1 for p in dfdb_positions(s))
def opp(s):
    ps = dfdb_positions(s)
    return inU(s) and ps[0][0] == -ps[1][0] and ps[0][2] == -ps[1][2]
rep2("all", lambda s: True)
rep2("centres solved", centers_ok)
rep2("centres solved, DF&DB in U", lambda s: centers_ok(s) and inU(s))
rep2("centres solved, DF&DB in U, opposite", lambda s: centers_ok(s) and opp(s))
rep2("centres solved, DF&DB in U, adjacent", lambda s: centers_ok(s) and inU(s) and not opp(s))
rep2("centres U/D, DF&DB in U", lambda s: centers_ud(s) and inU(s))
report("centres solved, DF&DB in U, opposite", lambda s: centers_ok(s) and opp(s))
report("centres solved, DF&DB in U, adjacent", lambda s: centers_ok(s) and inU(s) and not opp(s))
report("centres U/D, DF&DB in U", lambda s: centers_ud(s) and inU(s))
report("centres any, DF&DB in U", lambda s: inU(s))
print("---- more ----")
def eo_bad(s): return bad_edges(s) > 0
for nm, pr in [
  ("centres solved, in U, EO unsolved", lambda s: centers_ok(s) and inU(s) and eo_bad(s)),
  ("centres solved, in U, opposite, EO unsolved", lambda s: centers_ok(s) and opp(s) and eo_bad(s)),
  ("centres solved, in U, adjacent, EO unsolved", lambda s: centers_ok(s) and inU(s) and not opp(s) and eo_bad(s)),
  ("centres solved, not in U (>=1 in D/M), ", lambda s: centers_ok(s) and not inU(s)),
  ("centres solved, exactly one in U", lambda s: centers_ok(s) and sum(p[1]==1 for p in dfdb_positions(s))==1),
]:
    st = [s for s in dist if pr(s)]
    cases = {canon(s) for s in st}
    print(f"{nm:50s} modAUF={len(cases):4d} y2={sym_classes(st,False,True):4d} mir={sym_classes(st,True,False):4d} both={sym_classes(st,True,True):4d}")
