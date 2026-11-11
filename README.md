# ZBRoux Wiki

Source for the ZBRoux Wiki: method guides and complete, machine-checked algorithm lists for ZBRoux (EODFDB, ZBLL) and LEOR (EOStripe).

The site is built from `web/` (`npm run build`, output in `web/dist`).

Goal: complete, verified algorithm sets for under-documented speedsolving methods.

## EODFDB (ZBRoux / LLOB / FLSZ)
- `data/eodfdb.json`: all 992 cases (248 with centres solved), with up to 4 optimal `<M,U>` solutions each.

Regenerate and verify:
```
cd tools
python gen_eodfdb.py      # BFS over all <M,U> states, writes data/eodfdb.json
node verify_eodfdb.mjs    # independent JS sticker model re-checks every alg
python verify_solves.py   # checks every example solve in data/solves/ step by step
```

`tools/cube.py` is a general 3x3 simulator built from 3D geometry. `verify_eodfdb.mjs`
uses hand-written sticker cycles instead, so the two models check each other.

## EOStripe (LEOR)
- `data/eostripe.json`: depth table for all 73,728 states (matches RedstoneTim's ksolve++ table exactly), plus two learnable sets: 23 EO cases and 263 stripe cases.
```
cd tools
python gen_eostripe.py         # BFS over <R,r,M,U>, writes data/eostripe.json
node verify_eostripe.mjs       # hand-written R/U/M cycles re-check every sheet alg
python crosscheck_eostripe.py  # TS browser engine vs Python on 400 random states
```
EODFDB scramble lookup: `python crosscheck_eodfdb_lookup.py` (browser lookup vs Python on 300 states).
The website's live solver uses `web/src/lib/eostripe-engine.ts` (BFS in the browser).

## ZBLL (all 493 cases)
- `data/zbll.json`: every case (built from piece arrangements, counted up to pre/post-AUF), up to 4 algs each.
```
cd tools
python zbll_classify.py                                   # cases + shape/corner groups -> _zbll_cases.json
node --max-old-space-size=3000 zbll_gen.mts RUF 6 8       # meet-in-the-middle search per subset (also RU 8 8, RUD/RUL/RUr 6 8)
node --max-old-space-size=3000 zbll_gen.mts RUF 7 8 _zbll_missing.json +   # deeper pass for uncovered cases
python zbll_build.py                                      # simplify, verify in Python, rank -> data/zbll.json
node verify_zbll.mjs                                      # independent check with cubing.js
python crosscheck_zbll_lookup.py                          # browser case lookup vs data (400 random cases/AUFs/rotations)
```
Ranking is a heuristic (move weights + half-turn penalty); human curation is still to do.

## Website (`web/`)
Astro static site. Pages read the verified data straight from `data/`.
```
cd web
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in web/dist
```
- `src/pages/methods/zbroux/*.md`: ZBRoux guide pages (plain Markdown, easy to edit)
- `src/pages/algs/eodfdb/[...variant].astro`: EODFDB sheet (one page per centre state, print = PDF)
- `src/lib/site.ts`: site name (working title "AlgBase") and nav
