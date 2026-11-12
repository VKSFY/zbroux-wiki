import json
import heapq
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


def dijkstra(starts, weights):
    dist = {x: 0 for x in starts}
    heap = [(0, x) for x in starts]
    while heap:
        d, x = heapq.heappop(heap)
        if d > dist[x]:
            continue
        for m, w in weights.items():
            y = mv(x, m)
            if d + w < dist.get(y, 1 << 30):
                dist[y] = d + w
                heapq.heappush(heap, (d + w, y))
    return dist


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
ll_corners = [i for i, (p, n) in enumerate(STICKERS) if p[1] == 1 and nz(p) == 3]
lse_aligned = [d for x, d in lse.items() if all(x[i] == solved[i] for i in ll_corners)]

HTM_W = {"U": 1, "U'": 1, "U2": 1, "M": 2, "M'": 2, "M2": 2}
eod_htm = dijkstra([masked], HTM_W)


def u_turns(x):
    out = [x]
    for _ in range(3):
        out.append(mv(out[-1], "U"))
    return out


eod_htm_case = {}
for x in eod_htm:
    key = min(u_turns(x))
    eod_htm_case[key] = min(eod_htm[y] for y in u_turns(x))
eod_htm_case_aligned = [d for k, d in eod_htm_case.items() if k[top_centre] == "U"]

corner_sticker = next(i for i, (p, n) in enumerate(STICKERS) if p == (1, 1, 1) and n == (0, 1, 0))
marked = masked[:corner_sticker] + "k" + masked[corner_sticker + 1:]
goals = u_turns(marked)
by_goal = [bfs(g, MU) for g in goals]
extra = []
for x in by_goal[0]:
    ds = [b[x] for b in by_goal]
    best = min(ds)
    extra.append(best + (4 - ds.count(best)) / 4)

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
        "htm_optimal_avg_per_position": round(sum(eod_htm.values()) / len(eod_htm), 2),
        "htm_optimal_avg_per_case": round(sum(eod_htm_case.values()) / len(eod_htm_case), 2),
        "htm_optimal_avg_per_case_aligned": round(sum(eod_htm_case_aligned) / len(eod_htm_case_aligned), 2),
        "plus_zbll_turn_fixed_alg": round(sum(eod.values()) / len(eod) + 0.75, 2),
        "plus_zbll_turn_choosing_end_angle": round(sum(extra) / len(extra), 2),
        "distribution": dict(sorted(Counter(eod.values()).items())),
    },
    "lse": {
        "states": len(lse),
        "avg_stm": round(sum(lse.values()) / len(lse), 2),
        "max_stm": max(lse.values()),
        "corners_aligned_states": len(lse_aligned),
        "avg_stm_corners_aligned": round(sum(lse_aligned) / len(lse_aligned), 2),
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
