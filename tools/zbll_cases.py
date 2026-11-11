from itertools import permutations, product
from cube import STICKERS, SOLVED, INDEX, MOVES

U = (0, 1, 0)
C_POS = [(1, 1, 1), (1, 1, -1), (-1, 1, -1), (-1, 1, 1)]
E_POS = [(0, 1, 1), (1, 1, 0), (0, 1, -1), (-1, 1, 0)]

def facelets(pos):
    ns = [U] + [tuple(pos[i] if j == i else 0 for j in range(3)) for i in (0, 2) if pos[i] != 0]
    if len(ns) == 3:
        a, b = ns[1], ns[2]
        cx = (U[1]*a[2]-U[2]*a[1], U[2]*a[0]-U[0]*a[2], U[0]*a[1]-U[1]*a[0])
        if sum(cx[i]*b[i] for i in range(3)) > 0: ns = [U, b, a]
    return ns

SOLVED_COL = {}
for pos in C_POS + E_POS:
    SOLVED_COL[pos] = [SOLVED[INDEX[(pos, n)]] for n in facelets(pos)]

def parity(p):
    p = list(p); s = 0
    for i in range(len(p)):
        while p[i] != i:
            j = p[i]; p[i], p[j] = p[j], p[i]; s ^= 1
    return s

def build(cp, co, ep):
    s = list(SOLVED)
    for slot, (piece, tw) in enumerate(zip(cp, co)):
        cols = SOLVED_COL[C_POS[piece]]
        cols = cols[-tw:] + cols[:-tw] if tw else cols
        for n, c in zip(facelets(C_POS[slot]), cols):
            s[INDEX[(C_POS[slot], n)]] = c
    for slot, piece in enumerate(ep):
        for n, c in zip(facelets(E_POS[slot]), SOLVED_COL[E_POS[piece]]):
            s[INDEX[(E_POS[slot], n)]] = c
    return "".join(s)

def mv(s, m):
    p = MOVES[m]; return "".join(s[p[i]] for i in range(54))

def all_states():
    out = []
    for cp in permutations(range(4)):
        for co3 in product(range(3), repeat=3):
            co = list(co3) + [(-sum(co3)) % 3]
            for ep in permutations(range(4)):
                if parity(cp) == parity(ep):
                    out.append(build(cp, co, ep))
    return out

SOLVED_S = "".join(SOLVED)
def canon(s):
    best = None
    a = s
    for i in range(4):
        b = a
        for j in range(4):
            best = b if best is None or b < best else best
            b = relabel_u(b)
        a = mv(a, "U")
    return best

PIECE = {}
for i, (p, n) in enumerate(STICKERS):
    PIECE.setdefault(p, []).append(i)
ORIGIN = {}
for p, ids in PIECE.items():
    cols = frozenset(SOLVED[i] for i in ids)
    for i in ids:
        ORIGIN[(cols, SOLVED[i])] = i
UTURNED = mv("".join(SOLVED), "U")
def relabel_u(s):
    out = []
    for i, (p, n) in enumerate(STICKERS):
        cols = frozenset(s[j] for j in PIECE[p])
        out.append(UTURNED[ORIGIN[(cols, s[i])]])
    return "".join(out)

if __name__ == "__main__":
    st = all_states()
    print("LL states with EO solved (parity-valid):", len(st))
    for s in st[:5]:
        assert relabel_u(relabel_u(relabel_u(relabel_u(s)))) == s
    cases = {canon(s) for s in st}
    print("cases up to pre/post-AUF:", len(cases), "(including solved:", canon(SOLVED_S) in cases, ")")
