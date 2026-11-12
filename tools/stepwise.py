import json
from collections import deque
from cube import STICKERS, SOLVED, MOVES, INDEX

MU = ["U", "U'", "U2", "M", "M'", "M2"]
SOLVED_S = "".join(SOLVED)
U_N, D_N = (0, 1, 0), (0, -1, 0)
SLOTS = {"UF": (0, 1, 1), "UR": (1, 1, 0), "UB": (0, 1, -1), "UL": (-1, 1, 0), "DF": (0, -1, 1), "DB": (0, -1, -1)}
RULES = ("lookahead", "random", "worst")


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


def at(s, pos, normal):
    return s[INDEX[(pos, normal)]]


def side_normal(pos):
    return tuple(c if i != 1 else 0 for i, c in enumerate(pos))


def edges_oriented(s):
    return all(at(s, pos, U_N if pos[1] == 1 else D_N) in "UD" for pos in SLOTS.values())


def step(states, goal, after, rule):
    targets = [s for s in states if goal(s)]
    dist = {s: 0 for s in targets}
    layers = [targets]
    while layers[-1]:
        nxt = []
        for s in layers[-1]:
            for m in MU:
                t = mv(s, m)
                if t not in dist:
                    dist[t] = dist[s] + 1
                    nxt.append(t)
        layers.append(nxt)
    paths, value = {}, {}
    for s in targets:
        paths[s] = 1
        value[s] = (0,) + after[s]
    for layer in layers[1:]:
        for s in layer:
            succ = [t for t in (mv(s, m) for m in MU) if dist[t] == dist[s] - 1]
            paths[s] = sum(paths[t] for t in succ)
            if rule == "random":
                tot = paths[s]
                value[s] = tuple(sum(paths[t] * value[t][i] for t in succ) / tot for i in range(len(value[succ[0]])))
            else:
                pick = min if rule == "lookahead" else max
                value[s] = pick((value[t] for t in succ), key=lambda v: sum(v))
            value[s] = (dist[s],) + value[s][1:]
    return {s: (dist[s],) + value[s][1:] if goal(s) else value[s] for s in states}


def run(states, steps, rule, solved):
    after = {s: () for s in states}
    for goal in reversed(steps):
        res = step(states, goal, after, rule)
        after = {s: res[s] for s in states}
    out = {s: (tuple(0 for _ in after[s]) if s == solved else after[s]) for s in states}
    n = len(states)
    parts = [round(sum(v[i] for v in out.values()) / n, 2) for i in range(len(steps))]
    return {"steps": parts, "total": round(sum(sum(v) for v in out.values()) / n, 2)}


def eodfdb_masked():
    return "".join(
        "." if p[1] == 1 and nz(p) == 3
        else ("U" if n == U_N else "x") if p[1] == 1 and nz(p) == 2
        else col
        for (p, n), col in zip(STICKERS, SOLVED)
    )


def eodfdb_step_a(s):
    if at(s, (0, 1, 0), U_N) != "D" or not edges_oriented(s):
        return False
    up = sorted(name for name, pos in SLOTS.items() if name[0] == "U" and at(s, pos, U_N) == "D")
    return up in (["UB", "UF"], ["UL", "UR"])


def lse_steps():
    corners = [i for i, (p, n) in enumerate(STICKERS) if p[1] == 1 and nz(p) == 3]

    def eo(s):
        return at(s, (0, 1, 0), U_N) in "UD" and edges_oriented(s)

    def ulur(s):
        if not eo(s):
            return False
        t = s
        for _ in range(4):
            if all(t[i] == SOLVED_S[i] for i in corners) and all(
                    at(t, p, n) == at(SOLVED_S, p, n) for p in [(1, 1, 0), (-1, 1, 0)] for n in [U_N, side_normal(p)]):
                return True
            t = mv(t, "U")
        return False

    return [eo, ulur, lambda s: s == SOLVED_S]


if __name__ == "__main__":
    masked = eodfdb_masked()
    eod_states = reachable(masked)
    lse_states = reachable(SOLVED_S)
    out = {"eodfdb": {}, "lse": {}}
    out["eodfdb"]["step_a_targets"] = sum(eodfdb_step_a(s) for s in eod_states)
    for rule in RULES:
        out["eodfdb"][rule] = run(eod_states, [eodfdb_step_a, lambda s: s == masked], rule, masked)
        out["lse"][rule] = run(lse_states, lse_steps(), rule, SOLVED_S)
    print(json.dumps(out, indent=1))
    stats = json.load(open("../data/stats.json"))
    stats["step_by_step"] = out
    json.dump(stats, open("../data/stats.json", "w"), indent=1)
