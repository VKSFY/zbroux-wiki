import collections
from eostripe_core import bfs, mv, GOAL, STICKERS, nz
from cube import INDEX
dist = bfs()

RU = ["U", "R"]
orbit_id = {}
orbits = []
for s in dist:
    if s in orbit_id: continue
    oid = len(orbits); members = [s]; orbit_id[s] = oid
    q = [s]
    while q:
        x = q.pop()
        for m in RU:
            y = mv(x, m)
            if y not in orbit_id:
                orbit_id[y] = oid; members.append(y); q.append(y)
    orbits.append(members)
print("classes under <R,U> pre-moves:", len(orbits))
sizes = collections.Counter(len(o) for o in orbits)
print("orbit sizes:", sorted(sizes.items()))
best = [min(dist[x] for x in o) for o in orbits]
print("min optimal within class: avg", round(sum(best)/len(best),2), collections.Counter(best))

def feats(s):
    stripe = []
    bad = 0
    for i,(p,n) in enumerate(STICKERS):
        if nz(p)==2 and s[i]=="D": stripe.append(p)
    return stripe
U_C = INDEX[((0,1,0),(0,1,0))]
cent = collections.Counter(s[U_C] for s in dist)
print("centre states:", cent)

print("---- subsets ----")
from cube import SOLVED
GOALs = GOAL
def stripe_done(s):
    for i,(p,n) in enumerate(STICKERS):
        if p[0]==0 and p[1]<=0 and s[i]!=GOALs[i]: return False
    for i,(p,n) in enumerate(STICKERS):
        if p in ((0,1,0),(0,0,1),(0,0,-1),(0,-1,0)) and s[i]!=GOALs[i]: return False
    return True
def eo_done(s):
    from eostripe_core import ref_face
    for i,(p,n) in enumerate(STICKERS):
        if nz(p)==2 and s[i]=="o" and n!=ref_face(p): return False
    return True
for name, pred in [("EO left, stripe+centres done", lambda s: stripe_done(s) and not eo_done(s)),
                   ("stripe left, EO done", lambda s: eo_done(s) and not stripe_done(s)),
                   ("stripe left, EO done, centres solved", lambda s: eo_done(s) and not stripe_done(s) and s[INDEX[((0,1,0),(0,1,0))]]=="U")]:
    st = [s for s in dist if pred(s)]
    cls = {orbit_id[s] for s in st}
    ds = [dist[s] for s in st]
    print(f"{name:45s} states={len(st):6d} RU-classes={len(cls):4d} avg={sum(ds)/len(ds):.2f} max={max(ds)}")
    au = set()
    for s in st:
        o=[s]
        for _ in range(3): o.append(mv(o[-1],"U"))
        au.add(min(o))
    print(f"{'':45s} AUF-classes={len(au)}")
