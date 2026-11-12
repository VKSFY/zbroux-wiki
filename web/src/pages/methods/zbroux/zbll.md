---
layout: ../../../layouts/Article.astro
title: "Step 4: ZBLL"
description: ZBLL in ZBRoux. Solving the whole last layer in one algorithm after EODFDB, how the cases are grouped, and how to recognise them.
lede: Once the first two layers are done and every top edge is oriented, one algorithm solves the rest of the cube. There are 493 cases.
crumbs:
  - { href: "/methods/zbroux/", label: "ZBRoux" }
---

**Looking for a case?** Use the [ZBLL case finder](/algs/zbll/), or browse the lists by set: [T](/algs/zbll/t/), [U](/algs/zbll/u/), [L](/algs/zbll/l/), [H](/algs/zbll/h/), [Pi](/algs/zbll/pi/), [Sune](/algs/zbll/s/), [Antisune](/algs/zbll/as/), [PLL](/algs/zbll/pll/).

ZBLL (Zborowski–Bruchem Last Layer) solves the whole last layer in one algorithm, as long as all four top edges are already oriented. EODFDB makes sure they always are. It's the same ZBLL that ZZ and ZB solvers use, so any ZBLL material works for ZBRoux too.

## How the cases are grouped

ZBLL is split by the shape the top colour makes on the corners. These are the same seven shapes as the corner cases of OLL: T, U, L, H, Pi, Sune and Antisune. If all corners are already oriented, the case is a PLL.

Each shape is then split by how the corners are arranged (6 groups of 12 for most shapes), and each group by the edges. Most people learn one shape at a time.

## Recognising a case

The [ZBLL recognition guide](/methods/zbroux/zbll-recognition/) explains this in detail. In short:

1. **Shape**: look at where the top colour is on the corners.
2. **Corner pattern**: look at the side colours of the corners to find which group it is.
3. **Edges**: within the group, look at the edges to pick the exact case.

In ZBRoux you can do the first two looks early. During EODFDB the corners only move with U turns, so you can work out the shape and corner pattern before EODFDB is finished, and only the edges are left to check at the end.

## The algorithms on this wiki

Each case has up to four algorithms, found by a solver in move sets people use for speed (RU, RUD, RUF, RUL). They're ordered by a simple rule, not picked by hand yet, so try the alternatives and use whichever feels best. [How the algorithms are made](/about/) has the details.

Not ready for full ZBLL? The [learning path](/methods/zbroux/learning-path/) shows how to start with a two-look last layer.
