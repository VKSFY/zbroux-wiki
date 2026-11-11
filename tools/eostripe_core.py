from collections import deque
from cube import STICKERS, SOLVED, MOVES

GEN = [m + s for m in "URMr" for s in ("", "'", "2")]

def nz(p): return sum(1 for c in p if c)

def ref_sticker(colors_by_normal):
    cols = set(colors_by_normal)
    for c in "UD":
        if c in cols: return c
    for c in "FB":
        if c in cols: return c
    return None

def ref_face(pos):
    if pos[1] != 0: return (0, pos[1], 0)
    return (0, 0, pos[2])

LEFT = lambda p: p[0] == -1 and p[1] <= 0

def mask(state):
    out = list(state)
    pieces = {}
    for i, (p, n) in enumerate(STICKERS):
        if nz(p) == 2: pieces.setdefault(p, []).append(i)
        if nz(p) == 3 and not LEFT(p): out[i] = "."
    for p, idx in pieces.items():
        if LEFT(p): continue
        cols = [state[i] for i in idx]
        if set(cols) in ({"D", "F"}, {"D", "B"}):
            continue
        r = ref_sticker(cols)
        for i in idx:
            out[i] = "o" if state[i] == r else "x"
    return "".join(out)

GOAL = mask(SOLVED)

def mv(s, m):
    p = MOVES[m]
    return "".join(s[p[i]] for i in range(54))

def bfs():
    dist = {GOAL: 0}
    q = deque([GOAL])
    while q:
        s = q.popleft()
        d = dist[s] + 1
        for m in GEN:
            t = mv(s, m)
            if t not in dist:
                dist[t] = d
                q.append(t)
    return dist

if __name__ == "__main__":
    import collections
    dist = bfs()
    c = collections.Counter(dist.values())
    tot = 0
    print("depth new total")
    for d in sorted(c):
        tot += c[d]; print(d, c[d], tot)
    print("states", len(dist), "avg", round(sum(dist.values()) / len(dist), 4))
