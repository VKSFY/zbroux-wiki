import json
from itertools import permutations, product
from cube import STICKERS, SOLVED
from zbll_cases import build, relabel_u, mv, parity

U_EDGE_OR_M = {i for i, (p, n) in enumerate(STICKERS)
               if sum(1 for c in p if c) == 2 and (p[1] == 1 or p[0] == 0)}
M_CENTRES = {i for i, (p, n) in enumerate(STICKERS)
             if sum(1 for c in p if c) == 1 and p[0] == 0}


def mask(s):
    return "".join("e" if i in U_EDGE_OR_M else "c" if i in M_CENTRES else ch for i, ch in enumerate(s))


def variants(s):
    out = []
    a = s
    for _ in range(4):
        b = a
        for _ in range(4):
            out.append(b)
            b = relabel_u(b)
        a = mv(a, "U")
    return out


def corner_states():
    for cp in permutations(range(4)):
        for co3 in product(range(3), repeat=3):
            co = list(co3) + [(-sum(co3)) % 3]
            ep = list(range(4))
            if parity(cp):
                ep[0], ep[1] = ep[1], ep[0]
            yield build(cp, co, ep)


if __name__ == "__main__":
    states = list(corner_states())
    seen = {}
    for s in states:
        vs = variants(s)
        key = min(mask(v) for v in vs)
        seen.setdefault(key, []).append(s)
    solved_key = min(mask(v) for v in variants("".join(SOLVED)))
    cases = []
    for key, members in seen.items():
        if key == solved_key:
            continue
        rep = members[0]
        pre_post = []
        a = rep
        for i in range(4):
            b = a
            for j in range(4):
                pre_post.append(mask(b))
                b = relabel_u(b)
            a = mv(a, "U")
        cases.append({"key": key, "state": mask(rep), "variants": pre_post, "weight": len(members)})
    print("corner states:", len(states), "| CMLL cases (excluding solved):", len(cases),
          "| solved-class states:", len(seen[solved_key]))
    json.dump(cases, open("_cmll_cases.json", "w"))
