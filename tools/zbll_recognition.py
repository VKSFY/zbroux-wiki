import json
from collections import defaultdict, Counter
from cube import INDEX, apply

SIDES = "FRBL"
TOP = [(x, 1, z) for z in (-1, 0, 1) for x in (-1, 0, 1)]
ROW = {
    "F": [((x, 1, 1), (0, 0, 1)) for x in (-1, 0, 1)],
    "R": [((1, 1, z), (1, 0, 0)) for z in (1, 0, -1)],
    "L": [((-1, 1, z), (-1, 0, 0)) for z in (-1, 0, 1)],
}
VIEWS = {"front and right": ["F", "R"], "left, front and right": ["L", "F", "R"]}


def signature(state, sides):
    cells = [state[INDEX[(p, (0, 1, 0))]] for p in TOP]
    for side in sides:
        cells += [state[INDEX[(p, n)]] for p, n in ROW[side]]
    ref = next(c for c in cells if c in SIDES)
    return tuple(c if c not in SIDES else (SIDES.index(c) - SIDES.index(ref)) % 4 for c in cells)


if __name__ == "__main__":
    cases = json.load(open("../data/zbll.json"))["cases"]
    out = {}
    for view, sides in VIEWS.items():
        owners = defaultdict(set)
        rows = []
        for c in cases:
            s = tuple(c["state"])
            for k, auf in enumerate(["", "U", "U2", "U'"]):
                t = apply(s, auf) if auf else s
                sig = signature("".join(t), sides)
                owners[sig].add(c["id"])
                rows.append((c["shape"], sig))
        unique = Counter()
        total = Counter()
        for shape, sig in rows:
            total[shape] += 1
            unique[shape] += len(owners[sig]) == 1
        out[view] = {
            "unique_share": round(sum(unique.values()) / sum(total.values()), 4),
            "by_shape": {sh: round(unique[sh] / total[sh], 4) for sh in total},
            "max_cases_sharing_a_view": max(len(v) for v in owners.values()),
        }
    print(json.dumps(out, indent=1))
    stats = json.load(open("../data/stats.json"))
    stats["zbll_recognition"] = out
    json.dump(stats, open("../data/stats.json", "w"), indent=1)
