import glob
import json
from cube import apply, parse, SOLVED

SOLVED_S = "".join(SOLVED)
AUF = ["", "U", "U2", "U'"]
W = {"R": 1.0, "U": 1.0, "r": 1.15, "D": 1.5, "F": 1.5, "L": 1.5, "B": 2.0}
HALF = {"U": 0.1, "R": 0.3, "r": 0.3, "D": 0.3, "F": 0.4, "L": 0.4, "B": 0.4}
Q = {"": 1, "2": 2, "'": 3}


def simplify(alg):
    out = []
    for m in parse(alg):
        f, q = m[0], Q[m[1:]]
        if out and out[-1][0] == f:
            t = (out[-1][1] + q) % 4
            out.pop()
            if t:
                out.append((f, t))
        else:
            out.append((f, q))
    return " ".join(f + {1: "", 2: "2", 3: "'"}[q] for f, q in out)


def split_auf(alg):
    seq = parse(alg)
    pre = []
    while seq and seq[0][0] == "U":
        pre.append(seq.pop(0))
    return pre, seq


def score(alg):
    pre, body = split_auf(alg)
    return sum(W[m[0]] + (HALF[m[0]] if m.endswith("2") else 0) for m in body) + 0.3 * len(pre)


def auf_amount(pre):
    return sum({"U": 1, "U2": 2, "U'": 3}[m] for m in pre) % 4


def solved_up_to_auf(state):
    for a in AUF:
        s = apply(state, a) if a else state
        if all(ch in "ec" or ch == SOLVED_S[i] for i, ch in enumerate(s)):
            return True
    return False


def solves(state, alg):
    return solved_up_to_auf(apply(tuple(state), alg))


if __name__ == "__main__":
    cases = json.load(open("_cmll_cases.json"))
    sols = {}
    for f in sorted(glob.glob("_cmll_*.json")):
        if f.endswith("_cases.json"):
            continue
        st = f[len("_cmll_"):-len(".json")].rstrip("+")
        for r in json.load(open(f)):
            for a in r["sols"]:
                sols.setdefault(r["i"], {}).setdefault(simplify(a), st)
    out, rejected = [], 0
    for i, c in enumerate(cases):
        cand = []
        for a, st in sols.get(i, {}).items():
            if not solves(c["state"], a):
                rejected += 1
                continue
            cand.append((score(a), a, st))
        assert cand, i
        cand.sort()
        k = auf_amount(split_auf(cand[0][1])[0])
        disp = "".join(apply(tuple(c["state"]), AUF[k])) if k else c["state"]
        algs, seen = [], set()
        for sc, a, st in cand:
            pre, body = split_auf(a)
            norm = " ".join(([AUF[(auf_amount(pre) - k) % 4]] if (auf_amount(pre) - k) % 4 else []) + body)
            if norm in seen:
                continue
            assert solves(disp, norm)
            seen.add(norm)
            algs.append({"alg": norm, "moves": len(body), "set": st})
            if len(algs) == 4:
                break
        out.append({"key": c["key"], "state": disp, "weight": c["weight"], "algs": algs})
    out.sort(key=lambda d: (d["algs"][0]["moves"], d["key"]))
    for n, d in enumerate(out, 1):
        d["id"] = f"C{n:02d}"
    meta = {"set": "CMLL", "cases": len(out), "corner_states": 648,
            "note": "Edges and middle centres are ignored. Same search and ranking as ZBLL."}
    json.dump({"meta": meta, "cases": out}, open("../data/cmll.json", "w"), indent=1)
    best = [d["algs"][0]["moves"] for d in out]
    print(f"cases {len(out)} rejected {rejected} | first-alg avg per case {sum(best)/len(best):.2f} max {max(best)}")
