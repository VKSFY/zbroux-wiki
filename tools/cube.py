from itertools import product

FACES = {"U": (0, 1, 0), "D": (0, -1, 0), "R": (1, 0, 0),
         "L": (-1, 0, 0), "F": (0, 0, 1), "B": (0, 0, -1)}
NORMAL_TO_FACE = {v: k for k, v in FACES.items()}

def _stickers():
    out = []
    for p in product((-1, 0, 1), repeat=3):
        for f, n in FACES.items():
            if all(p[i] == n[i] for i in range(3) if n[i] != 0):
                out.append((p, n))
    return sorted(out)

STICKERS = _stickers()
INDEX = {s: i for i, s in enumerate(STICKERS)}
assert len(STICKERS) == 54

def _rot(v, axis, quarter):
    x, y, z = v
    for _ in range(quarter % 4):
        if axis == 0:
            y, z = -z, y
        elif axis == 1:
            z, x = -x, z
        else:
            x, y = -y, x
    return (x, y, z)

_BASE = {
    "U": (1, lambda p: p[1] == 1, -1),
    "D": (1, lambda p: p[1] == -1, 1),
    "E": (1, lambda p: p[1] == 0, 1),
    "R": (0, lambda p: p[0] == 1, -1),
    "L": (0, lambda p: p[0] == -1, 1),
    "M": (0, lambda p: p[0] == 0, 1),
    "F": (2, lambda p: p[2] == 1, -1),
    "B": (2, lambda p: p[2] == -1, 1),
    "S": (2, lambda p: p[2] == 0, -1),
    "r": (0, lambda p: p[0] >= 0, -1),
    "l": (0, lambda p: p[0] <= 0, 1),
    "u": (1, lambda p: p[1] >= 0, -1),
    "x": (0, lambda p: True, -1),
    "y": (1, lambda p: True, -1),
    "z": (2, lambda p: True, -1),
}

def _perm(name):
    axis, pred, q = _BASE[name]
    perm = list(range(54))
    for i, (p, n) in enumerate(STICKERS):
        if pred(p):
            j = INDEX[(_rot(p, axis, q), _rot(n, axis, q))]
            perm[j] = i
    return tuple(perm)

def _compose(a, b):
    return tuple(a[b[i]] for i in range(54))

MOVES = {}
for _n in _BASE:
    p1 = _perm(_n)
    p2 = _compose(p1, p1)
    MOVES[_n] = p1
    MOVES[_n + "2"] = p2
    MOVES[_n + "'"] = _compose(p2, p1)

def parse(alg):
    toks = alg.replace("(", " ").replace(")", " ").split()
    out = []
    for t in toks:
        t = t.replace("’", "'").replace("2'", "2")
        if t not in MOVES:
            raise ValueError(f"unknown move {t!r}")
        out.append(t)
    return out

def apply(state, alg):
    seq = parse(alg) if isinstance(alg, str) else alg
    for m in seq:
        p = MOVES[m]
        state = tuple(state[p[i]] for i in range(54))
    return state

SOLVED = tuple(NORMAL_TO_FACE[n] for (_, n) in STICKERS)

def invert(alg):
    seq = parse(alg) if isinstance(alg, str) else alg
    out = []
    for m in reversed(seq):
        if m.endswith("2"):
            out.append(m)
        elif m.endswith("'"):
            out.append(m[:-1])
        else:
            out.append(m + "'")
    return out

if __name__ == "__main__":
    for m in ["U", "M", "R", "r", "F", "x", "y", "z", "S", "E"]:
        assert apply(SOLVED, [m] * 4) == SOLVED, m
        assert apply(SOLVED, [m]) != SOLVED, m
    sexy = "R U R' U' "
    assert apply(SOLVED, sexy * 6) == SOLVED
    tperm = "R U R' U' R' F R2 U' R' U' R U R' F' "
    assert apply(SOLVED, tperm * 2) == SOLVED and apply(SOLVED, tperm) != SOLVED
    assert MOVES["r"] == _compose(MOVES["R"], MOVES["M'"])
    s = apply(SOLVED, "U")
    assert s[INDEX[((-1, 1, 0), (-1, 0, 0))]] == "F"
    s = apply(SOLVED, "M")
    assert s[INDEX[((0, 0, 1), (0, 0, 1))]] == "U"
    print("cube.py sanity checks passed")
