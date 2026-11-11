---
layout: ../../../layouts/Article.astro
title: LEOR
description: The LEOR speedsolving method. Left block, EOStripe, right block, ZBLL. Popular with one-handed solvers.
lede: Left block, then EOStripe, then right block, then ZBLL. LEOR mixes Roux-style blockbuilding with ZZ-style edge orientation and is mostly used for one-handed solving.
crumbs:
  - { href: "/methods/", label: "Methods" }
---

LEOR starts like Roux and ZBRoux, with a 1x2x3 block on the left. Then comes EOStripe: you orient every remaining edge while solving the DF and DB edges and the centres. After that, the rest of the first two layers is a right block built almost entirely with R and U, and because all edges are oriented, the last layer is a ZBLL case.

The name stands for **L**eft block, **EO**Stripe, **R**ight block. It was proposed by Noah Arthurs (2013) and by Arc and Pyjam (2017), with Joseph Briggs's methods as another influence. The first three steps together build an edge-oriented 2x2x3 block, so it's also often compared to Petrus.

## Steps

| Step | What you do | Moves |
|------|-------------|-------|
| 1. Left block | 1x2x3 block on the left, as in Roux | ~7 |
| 2. [EOStripe](/methods/leor/eostripe/) | Orient all edges and solve DF, DB and the centres, with R, r, M and U | ~8.4 |
| 3. Right block | The right 1x2x3 block, mostly with R and U | |
| 4. [ZBLL](/algs/zbll/) | The last layer, in one algorithm or two looks | ~13 |

## Why people use it

- After EOStripe, the right block is almost all R and U moves, which suits one-handed solving. Most people who use LEOR use it for one-handed.
- You get the edge orientation of ZZ without having to plan it at the very start of the solve.
- It's sometimes suggested for 4x4 by ZZ solvers who want edge orientation without an EO-first step.

## Learning EOStripe

EOStripe is the step people find hardest, mainly because there's been very little written about it. The other steps are covered well elsewhere: the left block is the Roux first block, the right block is like ZZ F2L, and ZBLL is ZBLL.

On this wiki:

- [EOStripe](/methods/leor/eostripe/): how the step works, and how many moves it takes.
- [EOStripe solver](/tools/eostripe-solver/): every shortest solution for your own scramble.
- Case lists for the two halves of the step: [orienting edges](/algs/eostripe/eo/) and [placing DF and DB](/algs/eostripe/stripe/).

## Further reading

- [RedstoneTim's LEOR page](https://redstonetim.github.io/cubing/leor_method.html), with tutorials and a link to the LEOR Discord
- [LEOR on the Speedsolving wiki](https://www.speedsolving.com/wiki/index.php/LEOR)
- [Cubing History: LEOR](https://cubinghistory.com/3x3/Methods/Leor)
