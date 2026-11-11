---
layout: ../../../layouts/Article.astro
title: "Step 3: EODFDB"
description: Orient all edges and insert DF and DB in ZBRoux. How the step works, how to do it intuitively, and the full list of cases.
lede: Orient every remaining edge and put the two bottom edges (DF and DB) in place at the same time, using only M and U. It takes about 8 moves. Afterwards only the last layer is left, with every edge already oriented.
crumbs:
  - { href: "/methods/zbroux/", label: "ZBRoux" }
---

**Already know the step and just need an algorithm?** Use the [EODFDB case finder](/algs/eodfdb/). Answer a few questions about your cube, or paste your scramble and block moves.

## What this step solves

After both blocks, six edges are left: the four top-layer edges, plus the two bottom edges DF (bottom-front) and DB (bottom-back). The middle-slice centres may also be turned. EODFDB fixes all of that at once:

- DF and DB end up in place, the right way round;
- the centres end up aligned;
- all four top-layer edges end up oriented, with the top colour facing up.

The top-layer edges can be in any order, and the top layer can be at any angle. ZBLL takes care of both.

## Doing it without algorithms

You don't need any algorithms to start. The step works like Roux's EOLR, except the edges you're placing are DF and DB instead of UL and UR.

1. **Orient the edges** with M and U moves, the same way as in Roux, using the arrow, 2-flip and 4-flip patterns. While doing that, aim to finish with both bottom edges on top, opposite each other, with their bottom colour facing up.
2. **Insert them.** Turn the top so the DF edge is at the back (UB) and the DB edge is at the front (UF), then do M2. The centres must already be aligned before that last M2, because every M move turns them too, so fix them during step 1.

Once this is comfortable, use the [case finder](/algs/eodfdb/) to learn shorter solutions for the cases you see most. Most cases take 5–8 moves.

## The algorithm list

The [case finder](/algs/eodfdb/) contains every possible case, each with the shortest possible M/U solutions:

| | Cases | Average moves |
|---|---|---|
| Centres aligned | 248 | 8.3 |
| All cases, including turned centres | 992 | 8.3 |

With aligned centres, most cases take 7–9 moves, and only four cases need more than 11.

### Why some sources say 46 algorithms

The [Speedsolving wiki](https://www.speedsolving.com/wiki/index.php/ZBRoux) lists EODFDB as 46 algorithms, but no list has been published. The full set above is bigger because it includes every starting position. A set with exactly 46 cases does come out if you do a little setup first, like in the intuitive method above: both bottom edges on top and opposite each other, the top centre showing your top or bottom colour, and mirror cases counted once. That's very likely what the 46 refers to, but it isn't confirmed yet.

## Looking ahead to ZBLL

M moves never move the corners, and U moves only turn them around. So during EODFDB the corners of your ZBLL case are visible the whole time. If you also learn where the top-layer edges end up after each algorithm, you can know the whole ZBLL case before EODFDB is finished, and go straight into it.
