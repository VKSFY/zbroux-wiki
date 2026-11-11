---
layout: ../../../layouts/Article.astro
title: "Start here: learning path"
description: The order to learn ZBRoux in, from your first blocks to full ZBLL, with a two-look last layer along the way.
lede: You don't need 493 algorithms to start. This order lets you do full solves with the method from the first day, and add algorithms as you go.
crumbs:
  - { href: "/methods/zbroux/", label: "ZBRoux" }
---

## Stage 1: Blocks and an easy finish

- Learn the [first block](/methods/zbroux/first-block/) and [second block](/methods/zbroux/second-block/). If you already solve Roux, you can skip this.
- Do [EODFDB](/methods/zbroux/eodfdb/) without algorithms: orient the edges first, then bring the two bottom edges to the top and insert them with M2.
- Finish the last layer with what you already know, for example OLL and PLL. Since the edges are already oriented, you'll only get the 7 OLL cases that have all edges oriented (the "OCLL" cases).

## Stage 2: A two-look last layer

- Learn **COLL** (42 cases). It solves the corners while keeping the edges oriented.
- Finish with the 4 **edge PLLs** (Ua, Ub, H and Z).
- COLL then EPLL is a complete two-look last layer for ZBRoux. Each COLL algorithm also solves one ZBLL case, the one where the edges are already in place, so nothing you learn here is wasted.

## Stage 3: EODFDB algorithms

- Use the [EODFDB case finder](/algs/eodfdb/) to replace your slow intuitive solutions with shorter ones. Start with the cases you see most, and the ones where your own solution is much longer than the listed one.

## Stage 4: Full ZBLL

- Learn ZBLL one shape at a time with the [ZBLL lists](/algs/zbll/). Many people start with T and U (72 cases each), then L, then Pi, H, Sune and Antisune.
- Keep COLL and EPLL as a backup for cases you haven't learned yet.
- Practise recognising the corners during EODFDB, so you know your ZBLL case before you get there.
