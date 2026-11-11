from cube import apply, SOLVED, STICKERS, parse

def ok_region(state, pred):
    return all(state[i] == SOLVED[i] for i, (p, n) in enumerate(STICKERS) if pred(p))

FB = lambda p: p[0] == -1 and p[1] <= 0
SB = lambda p: p[0] == 1 and p[1] <= 0
def eodfdb_done(s):
    for i, (p, n) in enumerate(STICKERS):
        if p[1] <= 0 and s[i] != SOLVED[i]:
            return False
        if p[1] == 1 and sum(1 for c in p if c) == 2 and n == (0, 1, 0) and s[i] != "U":
            return False
    return s[[i for i, (p, n) in enumerate(STICKERS) if p == (0, 1, 0)][0]] == "U"

def check(scramble, steps):
    s = apply(SOLVED, scramble)
    total = 0
    checks = [("First block", lambda s: ok_region(s, FB)),
              ("Second block", lambda s: ok_region(s, FB) and ok_region(s, SB)),
              ("EODFDB", eodfdb_done),
              ("ZBLL", lambda s: s == SOLVED)]
    for (name, alg), (cname, fn) in zip(steps, checks):
        s = apply(s, alg)
        n = len(parse(alg)); total += n
        auf = None
        if not fn(s) and cname == "ZBLL":
            for a in ["U", "U2", "U'"]:
                if apply(s, a) == SOLVED: auf = a
        print(f"{name:13s} {n:2d} moves  {'OK' if fn(s) else 'NOT DONE'}{f' (needs final {auf})' if auf else ''}")
    print("total", total)
    return s

if __name__ == "__main__":
    SCR = "D B' L D' B' D' L' D' B L2 B D B' F2 D2 R B' L R B' F' L' F2 L2 U'"
    STEPS = [("First block", "U L B' L F D M B"),
             ("Second block", "R U2 r U' r U' r2 U' R2 U' R"),
             ("EODFDB", "U M U M' U M2 U' M"),
             ("ZBLL", "R' U2 R2 U R U R U' R' U' R2 U R U")]
    check(SCR, STEPS)
