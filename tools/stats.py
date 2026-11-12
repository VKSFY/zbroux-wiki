import json
from collections import Counter, deque
from cube import STICKERS, SOLVED, MOVES, apply
from zbll_cases import all_states, canon, relabel_u

MU = ["U", "U'", "U2", "M", "M'", "M2"]


def mv(s, m):
    p = MOVES[m]
    return "".join(s[p[i]] for i in range(54))


def bfs(start, gen):
    dist = {start: 0}
    q = deque([start])
    while q:
        s = q.popleft()
        for m in gen:
            t = mv(s, m)
            if t not in dist:
                dist[t] = dist[s] + 1
                q.append(t)
    return dist


def nz(p):
    return sum(1 for c in p if c)


def fixed_by_u(states, k):
    n = 0
    for s in states:
        t = s
        for _ in range(k):
            t = mv(t, "U")
        n += t == s
    return n


def htm(alg):
    return sum(2 if m[0] == "M" else 1 for m in alg.split())


solved = "".join(SOLVED)
masked = "".join(
    "." if p[1] == 1 and nz(p) == 3
    else ("U" if n == (0, 1, 0) else "x") if p[1] == 1 and nz(p) == 2
    else col
    for (p, n), col in zip(STICKERS, SOLVED)
)
eod = bfs(masked, MU)
top_centre = next(i for i, (p, n) in enumerate(STICKERS) if p == (0, 1, 0))
aligned = {s: d for s, d in eod.items() if s[top_centre] == "U"}
lse = bfs(solved, MU)

cases = json.load(open("../data/eodfdb.json"))["cases"]
best = [c["algs"][0] for c in cases if c["centres"] == "solved"]

zbll = json.load(open("../data/zbll.json"))["cases"]
weight = Counter(canon(s) for s in all_states())
moves = {c["key"]: c["algs"][0]["moves"] for c in zbll}
ll_states = sum(weight.values())
by_key = {c["key"]: c for c in zbll}
AUF = ["", "U", "U2", "U'"]
pre_turns = post_turns = 0
for st in all_states():
    k = canon(st)
    if k not in by_key:
        if tuple(st) != tuple(SOLVED):
            post_turns += 1
        continue
    c = by_key[k]
    a, found = st, None
    for p in range(4):
        b = a
        for _ in range(4):
            if b == c["state"]:
                found = p
                break
            b = relabel_u(b)
        if found is not None:
            break
        a = mv(a, "U")
    assert found is not None
    end = apply(tuple(st), (AUF[found] + " " + c["algs"][0]["alg"]).strip())
    q = next(i for i in range(4) if (apply(end, AUF[i]) if i else end) == tuple(SOLVED))
    pre_turns += found != 0
    post_turns += q != 0

case_moves = [c["optimal_moves"] for c in cases]
case_moves_aligned = [c["optimal_moves"] for c in cases if c["centres"] == "solved"]

stats = {
    "eodfdb": {
        "states": len(eod),
        "fixed_by_u": [fixed_by_u(eod, k) for k in range(4)],
        "aligned_states": len(aligned),
        "aligned_fixed_by_u": [fixed_by_u(aligned, k) for k in range(4)],
        "avg_stm": round(sum(eod.values()) / len(eod), 2),
        "avg_stm_aligned": round(sum(aligned.values()) / len(aligned), 2),
        "avg_htm_listed_aligned": round(sum(htm(a) for a in best) / len(best), 2),
        "avg_per_case_free_auf": round(sum(case_moves) / len(case_moves), 2),
        "avg_per_case_free_auf_aligned": round(sum(case_moves_aligned) / len(case_moves_aligned), 2),
        "distribution": dict(sorted(Counter(eod.values()).items())),
    },
    "lse": {
        "states": len(lse),
        "avg_stm": round(sum(lse.values()) / len(lse), 2),
        "max_stm": max(lse.values()),
    },
    "zbll": {
        "ll_states": ll_states,
        "avg_moves_weighted": round(sum(weight[k] * moves.get(k, 0) for k in weight) / ll_states, 2),
        "avg_pre_auf_turns": round(pre_turns / ll_states, 3),
        "avg_post_auf_turns": round(post_turns / ll_states, 3),
    },
}
json.dump(stats, open("../data/stats.json", "w"), indent=1)
print(json.dumps(stats, indent=1))
