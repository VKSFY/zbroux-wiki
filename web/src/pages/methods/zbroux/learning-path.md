---
layout: ../../../layouts/Article.astro
title: "Start here: learning path"
description: The order to learn ZBRoux in, from your first blocks to full ZBLL, with algorithm counts for every stage.
lede: You don't need 493 algorithms to start. This route lets you do full ZBRoux solves from day one and add algorithms in stages, with a working last layer at every stage.
crumbs:
  - { href: "/methods/zbroux/", label: "ZBRoux" }
---

| Stage | What you learn | New algorithms | Algorithms in your set afterwards |
|---|---|---|---|
| 1 | Blocks, intuitive EODFDB, last layer with OCLL + PLL | 28 (7 OCLL, 21 PLL) | 28 |
| 2 | Two-look last layer: COLL + edge PLL | 42 COLL (edge PLL is already part of PLL) | 70 |
| 3 | Full ZBLL, one set at a time | up to 472 (ZBLL without the 21 PLLs) | up to 493 |
| 4 | EODFDB algorithms (optional) | 46 for the 46-case set | up to 539 |

"Algorithms in your set" counts what you use once a stage is finished. With full ZBLL you no longer need OCLL or the two-look last layer, and every COLL algorithm is also a ZBLL algorithm, so your final set is 493 ZBLL plus 46 EODFDB, 539 in total. Counted as everything you learn along the way, including OCLL and COLL, it's 588. The 451 more than Roux quoted elsewhere is the final set with intuitive EODFDB (493) minus Roux's 42 CMLL.

If you already know OLL and PLL from CFOP, stage 1 costs nothing new.

## Stage 1: Blocks, intuitive EODFDB, a familiar last layer

- Learn the [first block](/methods/zbroux/first-block/) and [second block](/methods/zbroux/second-block/). If you already solve Roux, skip this.
- Do [EODFDB](/methods/zbroux/eodfdb/#doing-it-without-algorithms) without algorithms, in three steps: orient the edges, bring both bottom edges to the top, then M2.
- Finish the last layer with OLL and PLL. Since EODFDB has already oriented the edges, the only OLL cases you'll see are the 7 with all edges oriented (OCLL), plus the 21 PLLs.

## Stage 2: A two-look last layer that leads into ZBLL

- Learn **COLL** (42 algorithms). It solves the corners while keeping the edges oriented.
- Finish with an edge PLL: Ua, Ub, H or Z, which you already know from PLL.
- Each COLL algorithm is also the ZBLL algorithm for one case, the one where the edges are already solved, so nothing here is wasted.

## Stage 3: ZBLL, one set at a time

ZBLL is split by the shape the top colour makes on the corners. Each set replaces COLL and edge PLL whenever that shape comes up. "Share of solves" is how often a random last layer lands in that set (4/27 for each 72-case set, 2/27 for H, 1/27 for PLL), which isn't the same as its share of the 493 cases:

| Set | Cases | Share of solves |
|---|---|---|
| T, U, L, Pi, Sune, Antisune | 72 each | 14.8% each |
| H | 40 | 7.4% |
| PLL | 21 | 3.7% (you already know these) |

The six 72-case sets are worth exactly the same per algorithm learned. H and PLL are worth about 10% and 15% less per algorithm, but they're smaller. So choose by how comfortable you are recognising a set. A natural start is Sune or Antisune, whose shapes are easy to spot, or H, the smallest set. Learn a set one corner group at a time (12 cases in most groups, 8 in two of the H groups), using the [ZBLL lists](/algs/zbll/), the [recognition guide](/methods/zbroux/zbll-recognition/) and the [trainer](/tools/trainer/). Use COLL and edge PLL as the backup for sets you haven't learned yet.

## Stage 4: EODFDB algorithms

- First merge steps 1 and 2 of intuitive EODFDB: orient the edges while already bringing the bottom edges up. That alone saves about one and a half moves on average.
- Then learn the [46-case set](/algs/eodfdb/46/). It works the other way round: bring both bottom edges to the top first, opposite each other, and then one algorithm orients everything and inserts them. There's a [one-page cheat sheet](/algs/eodfdb/46-sheet/) to print.
- For the shortest solutions to everything, use the [full EODFDB case finder](/algs/eodfdb/).
- Practise reading your ZBLL case during EODFDB, so you know it before you get there.
