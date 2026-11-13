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
AUF = ["", "U", "U2", "U'"]


def relative(cells):
    ref = next((c for c in cells if c in SIDES), None)
    if ref is None:
        return tuple(cells)
    return tuple(c if c not in SIDES else (SIDES.index(c) - SIDES.index(ref)) % 4 for c in cells)


def stickers(state, sides):
    cells = [state[INDEX[(p, (0, 1, 0))]] for p in TOP]
    for side in sides:
        cells += [state[INDEX[(p, n)]] for p, n in ROW[side]]
    return cells


def full_view(state, sides):
    return relative(stickers(state, sides))


def relation(a, b, directional):
    if a == "U" or b == "U":
        return "top" if a == b else ("top-a" if a == "U" else "top-b")
    d = (SIDES.index(a) - SIDES.index(b)) % 4
    if directional:
        return {0: "same", 1: "next-cw", 2: "opposite", 3: "next-ccw"}[d]
    return {0: "same", 2: "opposite"}.get(d, "neighboring")


def side_row(state, side):
    return [state[INDEX[(p, n)]] for p, n in ROW[side]]


def scheme(directional, cross, top_pattern):
    def view(state, case):
        out = [case["shape"]]
        f, r = side_row(state, "F"), side_row(state, "R")
        for a, e, b in (f, r):
            out += [relation(a, b, directional), relation(e, a, directional), relation(e, b, directional)]
        if cross:
            out += [relation(f[1], r[1], directional), relation(f[0], r[2], directional)]
        if top_pattern:
            out += ["U" if state[INDEX[(p, (0, 1, 0))]] == "U" else "-" for p in TOP]
        return tuple(out)
    return view


def measure(cases, view):
    owners = defaultdict(set)
    rows = []
    for c in cases:
        for auf in AUF:
            t = "".join(apply(tuple(c["state"]), auf) if auf else c["state"])
            v = view(t, c)
            owners[v].add(c["id"])
            rows.append((c["shape"], v))
    unique = Counter(sh for sh, v in rows if len(owners[v]) == 1)
    total = Counter(sh for sh, _ in rows)
    return {
        "distinct_views": len(owners),
        "unique_share": round(sum(unique.values()) / len(rows), 4),
        "max_cases_sharing_a_view": max(len(v) for v in owners.values()),
        "by_shape": {sh: round(unique[sh] / total[sh], 4) for sh in total},
    }


if __name__ == "__main__":
    cases = json.load(open("../data/zbll.json"))["cases"]
    out = {
        "top only": measure(cases, lambda t, c: full_view(t, [])),
        "top and front": measure(cases, lambda t, c: full_view(t, ["F"])),
        "top, front and right": measure(cases, lambda t, c: full_view(t, ["F", "R"])),
        "scheme: relations within each side": measure(cases, scheme(False, False, False)),
        "scheme: plus where the top color sits": measure(cases, scheme(False, False, True)),
        "scheme: plus which neighboring color": measure(cases, scheme(True, False, True)),
        "scheme: plus comparing front with right": measure(cases, scheme(True, True, True)),
    }
    print(json.dumps({k: {kk: vv for kk, vv in v.items() if kk != "by_shape"} for k, v in out.items()}, indent=1))
    stats = json.load(open("../data/stats.json"))
    stats["zbll_recognition"] = out
    json.dump(stats, open("../data/stats.json", "w"), indent=1)
