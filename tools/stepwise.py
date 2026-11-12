import json
from collections import deque
from cube import STICKERS, SOLVED, MOVES, INDEX

MU = ["U", "U'", "U2", "M", "M'", "M2"]
SOLVED_S = "".join(SOLVED)


def nz(p):
    return sum(1 for c in p if c)


def mv(s, m):
    p = MOVES[m]
    return "".join(s[p[i]] for i in range(54))


def reachable(start):
    seen = {start}
    q = deque([start])
    while q:
        s = q.popleft()
        for m in MU:
            t = mv(s, m)
            if t not in seen:
                seen.add(t)
                q.append(t)
    return seen


def chain(states, goal, cost_after):
    dist = {}
    label = {}
    frontier = [s for s in states if goal(s)]
    for s in frontier:
        dist[s] = 0
        label[s] = cost_after(s)
    d = 0
    while frontier:
        d += 1
        nxt = {}
        for s in frontier:
            for m in MU:
                t = mv(s, m)
                if t in dist:
                    continue
                if t not in nxt or label[s] < nxt[t]:
                    nxt[t] = label[s]
        for t, lab in nxt.items():
            dist[t] = d
            label[t] = lab
        frontier = list(nxt)
    return {s: dist[s] + label[s] for s in dist}


def at(s, pos, normal):
    return s[INDEX[(pos, normal)]]


U_N, D_N = (0, 1, 0), (0, -1, 0)
SLOTS = {"UF": (0, 1, 1), "UR": (1, 1, 0), "UB": (0, 1, -1), "UL": (-1, 1, 0), "DF": (0, -1, 1), "DB": (0, -1, -1)}


def top_or_bottom(pos):
    return U_N if pos[1] == 1 else D_N


def edges_oriented(s, colours):
    return all(at(s, pos, top_or_bottom(pos)) in colours for pos in SLOTS.values())


def eodfdb_model():
    masked = "".join(
        "." if p[1] == 1 and nz(p) == 3
        else ("U" if n == U_N else "x") if p[1] == 1 and nz(p) == 2
        else col
        for (p, n), col in zip(STICKERS, SOLVED)
    )
    states = reachable(masked)
    full = chain(states, lambda s: s == masked, lambda s: 0)

    def step_a(s):
        if at(s, (0, 1, 0), U_N) != "D" or not edges_oriented(s, "UD"):
            return False
        top = {name: (at(s, pos, U_N), at(s, pos, tuple(c if i != 1 else 0 for i, c in enumerate(pos))))
               for name, pos in SLOTS.items() if name[0] == "U"}
        bottom_edges = [n for n, (a, b) in top.items() if a == "D"]
        return sorted(bottom_edges) in (["UB", "UF"], ["UL", "UR"])

    two_step = chain(states, step_a, lambda s: full[s])
    two_step = {s: (0 if full[s] == 0 else v) for s, v in two_step.items()}
    return {
        "positions": len(states),
        "optimal": round(sum(full.values()) / len(states), 2),
        "step_by_step": round(sum(two_step.values()) / len(states), 2),
    }


def lse_model():
    states = reachable(SOLVED_S)
    full = chain(states, lambda s: s == SOLVED_S, lambda s: 0)
    corners = [i for i, (p, n) in enumerate(STICKERS) if p[1] == 1 and nz(p) == 3]

    def eo(s):
        return at(s, (0, 1, 0), U_N) in "UD" and edges_oriented(s, "UD")

    def ulur(s):
        if not eo(s):
            return False
        t = s
        for _ in range(4):
            if all(t[i] == SOLVED_S[i] for i in corners) and all(
                    t[INDEX[(p, n)]] == SOLVED_S[INDEX[(p, n)]]
                    for p in [(1, 1, 0), (-1, 1, 0)] for n in [U_N, (p[0], 0, 0)]):
                return True
            t = mv(t, "U")
        return False

    c4b = chain(states, ulur, lambda s: full[s])
    c4a = chain(states, eo, lambda s: c4b[s])
    c4a = {s: (0 if full[s] == 0 else v) for s, v in c4a.items()}
    return {
        "positions": len(states),
        "optimal": round(sum(full.values()) / len(states), 2),
        "step_by_step": round(sum(c4a.values()) / len(states), 2),
    }


if __name__ == "__main__":
    out = {"eodfdb": eodfdb_model(), "lse": lse_model()}
    print(json.dumps(out, indent=1))
    stats = json.load(open("../data/stats.json"))
    stats["step_by_step"] = out
    json.dump(stats, open("../data/stats.json", "w"), indent=1)
