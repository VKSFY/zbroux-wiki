import json, sys
from cube import apply, parse, SOLVED, STICKERS, MOVES

FACE_MOVES = [f + s for f in "UDLRFB" for s in ("", "'", "2")]
PERMS = [MOVES[m] for m in FACE_MOVES]
CENTERS = {p: i for i, (p, n) in enumerate(STICKERS) if sum(1 for c in p if c) == 1}
CUBIE = {}
for i, (p, n) in enumerate(STICKERS):
    CUBIE.setdefault(p, []).append(i)
SIDE_PIECES = {x: {frozenset(SOLVED[i] for i in CUBIE[p]) for p in CUBIE if p[0] == x and p[1] <= 0 and sum(1 for c in p if c) >= 2} for x in (-1, 1)}


def normalize(state):
    m = {state[i]: SOLVED[i] for i in CENTERS.values()}
    return tuple(m[c] for c in state)


def mask(state, pieces):
    out = ["."] * 54
    for p, ids in CUBIE.items():
        if frozenset(state[i] for i in ids) in pieces:
            for i in ids:
                out[i] = state[i]
    return "".join(out)


def step(s, perm):
    return "".join(s[perm[i]] for i in range(54))


def back_table(depth, pieces):
    goal = mask(SOLVED, pieces)
    dist = {goal: 0}
    level = [goal]
    for d in range(1, depth + 1):
        nxt = []
        for s in level:
            for p in PERMS:
                t = step(s, p)
                if t not in dist:
                    dist[t] = d
                    nxt.append(t)
        level = nxt
    return dist


def optimal(start, back, back_depth, fwd_depth):
    best = back.get(start)
    seen = {start}
    level = [start]
    for a in range(1, fwd_depth + 1):
        if best is not None and best <= a:
            break
        nxt = []
        for s in level:
            for p in PERMS:
                t = step(s, p)
                if t in seen:
                    continue
                seen.add(t)
                nxt.append(t)
                b = back.get(t)
                if b is not None and (best is None or a + b < best):
                    best = a + b
        level = nxt
    return best


if __name__ == "__main__":
    vecs = json.load(open(sys.argv[1]))
    backs = {x: back_table(5, SIDE_PIECES[x]) for x in (-1, 1)}
    bad = 0
    for v in vecs:
        alg = v["scramble"].replace("Rw", "r").replace("Lw", "l").replace("Uw", "u")
        s = normalize(apply(SOLVED, parse(alg) + (parse(v["rotation"]) if v["rotation"] else [])))
        x = 1 if v.get("side") == "right" else -1
        d = optimal(mask(s, SIDE_PIECES[x]), backs[x], 5, 4)
        if d != v["fb"]:
            bad += 1
            print("MISMATCH", v, "python", d)
    sides = {k: sum(1 for v in vecs if v.get("side", "left") == k) for k in ("left", "right")}
    print(f"python cube.py first-block check: scrambles={len(vecs)} (left {sides['left']}, right {sides['right']}) back-table={len(backs[-1])}/{len(backs[1])} mismatches={bad}")
    sys.exit(1 if bad else 0)
