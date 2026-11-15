# ZBRoux Wiki

Source for the ZBRoux Wiki: method guides and complete, machine-checked algorithm lists for ZBRoux (EODFDB, ZBLL) and LEOR (EOStripe).

The site is built from `web/` (`npm run build`, output in `web/dist`).

Goal: complete, verified algorithm sets for under-documented speedsolving methods.

## EODFDB (ZBRoux / LLOB / FLSZ)
- `data/eodfdb.json`: all 992 cases (248 with centers solved), with up to 4 optimal `<M,U>` solutions each.

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

## CMLL (for the Roux comparison)
```
cd tools
python cmll_cases.py
LL_MODE=cmll node --max-old-space-size=3000 zbll_gen.mts RUF 6 8
python cmll_build.py
node verify_cmll.mjs
python stats.py
```

## Website (`web/`)
Astro static site. Pages read the verified data straight from `data/`.
```
cd web
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in web/dist
```
- `src/pages/methods/zbroux/*.md`: ZBRoux guide pages (plain Markdown, easy to edit)
- `src/pages/algs/eodfdb/[...variant].astro`: EODFDB sheet (one page per center state, print = PDF)
- `src/lib/site.ts`: site name and nav

Tools on the site:
- `/algs/eodfdb/`: EODFDB case finder (questions, or a scramble and block moves)
- `/algs/zbll/`: ZBLL case finder (tap your colors, or a scramble and moves)
- `/tools/trainer/`: EODFDB and ZBLL trainer
- `/tools/breakdown/`: solve breakdown (splits a pasted ZBRoux solution into stages and looks up the cases; `node tools/verify_breakdown.mjs` checks it against the example solves)
- `/tools/solver/`: solve suggester. By default it doesn't rotate: it tries the first block on the left (second block with R, r, M and U) and on the right (second block with L, l, M and U, EODFDB and ZBLL algorithms mirrored) and shows the lower total; a checkbox also allows a rotation before the first move (all 24 placements). The blocks come from exact distance tables built in the browser, EODFDB and ZBLL from the lists, and every solve is checked with the breakdown before it's shown. Each result says how to hold the cube and, after a rotation, which center colors should be where. `node tools/verify_solver.mjs` runs 300 seeded scrambles on both sides without a rotation and in all 24 placements, checks the left second-block table against the right one mirrored, checks 90 first-block lengths (60 left, 30 right) against an independent search in `tools/check_fb_optimal.py` (cube.py), replays 630 solves with cubing.js, and checks the shown center colors against cubing.js for every placement
- `/tools/eostripe-solver/`: EOStripe solver for LEOR

## License

Code: MIT (see `LICENSE`). Algorithm data in `data/`: CC BY 4.0 (see `data/LICENSE`).
