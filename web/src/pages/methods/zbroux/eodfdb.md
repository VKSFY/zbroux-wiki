---
layout: ../../../layouts/Article.astro
title: "Step 3: EODFDB"
description: Orient all edges and insert DF and DB in ZBRoux. How the step works, how to do it intuitively, how many cases there are and where the numbers come from.
lede: Orient every remaining edge and put the two bottom edges (DF and DB) in place at the same time, using only M and U. Solved as efficiently as possible it takes about 8 moves. Afterwards only the last layer is left, with every edge already oriented.
crumbs:
  - { href: "/methods/zbroux/", label: "ZBRoux" }
---

**Already know the step and just need an algorithm?** Use the [EODFDB case finder](/algs/eodfdb/). Answer a few questions about your cube, or paste your scramble and block moves.

## Notation used on this page

- **U**: the top layer. **M**: the middle slice between the left and right blocks, turned in the same direction as L.
- **DF** and **DB**: the bottom-front and bottom-back edges, the two bottom edges that are still unsolved after both blocks.
- **Moves are counted in STM**: every M, M', M2, U, U' and U2 counts as one move. A turn of the top layer to line a case up before its algorithm isn't counted. In HTM, where each slice turn counts as two, the listed algorithms average about 12.5 moves.

## What this step solves

After both blocks, six edges are left: the four top-layer edges plus DF and DB. The middle-slice centres may also be turned. EODFDB fixes all of that at once:

- DF and DB end up in place, the right way round;
- the centres end up aligned;
- all four top-layer edges end up oriented, with the top colour facing up.

The top-layer edges can be in any order, and the top layer can be at any angle. ZBLL takes care of both.

## Doing it without algorithms

You don't need any algorithms to start. The step works like Roux's EOLR, except the edges you're placing are DF and DB instead of UL and UR.

1. **Orient the edges** with M and U moves, the same way as in Roux, using the arrow, 2-flip and 4-flip patterns. While doing that, aim to finish with both bottom edges on top, opposite each other, with their bottom colour facing up.
2. **Insert them.** Turn the top so the DF edge is at the back (UB) and the DB edge is at the front (UF), then do M2. The centres must already be aligned before that last M2, because every M move turns them too, so fix them during step 1.

Solving it this way usually takes a few moves more than the shortest solution. Once it's comfortable, use the case lists below to learn shorter solutions for the cases you see most.

## Case lists

- **[Find your case](/algs/eodfdb/)**: all 992 cases, each with the shortest possible M/U solutions, found by answering questions about your cube or by pasting a scramble.
- **[The 46-case set](/algs/eodfdb/46/)**: a smaller set for solvers who always set the two bottom edges up on top first. See below for where the number 46 comes from.

With aligned centres, most cases take 7 or 9 moves once the top layer is lined up, and the longest take 13. Each case is shown from the angle where its shortest solution starts, so no algorithm begins with a turn of the top layer.

## Where the numbers come from

After both blocks, the unsolved part of the cube is the six edges in the top layer and the middle slice, plus the middle-slice centres.

- The DF and DB edges can sit in 6 × 5 = **30** combinations of slots.
- The six edges can be flipped in **32** ways, because the number of flipped edges is always even.
- The centres can be turned 4 ways.

That gives 30 × 32 × 4 = **3,840** positions. Two positions that only differ by a turn of the top layer are the same case, so the cases are counted with Burnside's lemma over the four top-layer turns. 3,840 positions stay the same under no turn, 32 under U, 64 under U2 and 32 under U'. That gives (3,840 + 32 + 64 + 32) / 4 = **992 cases**. With the centres aligned there are 960 positions, and (960 + 8 + 16 + 8) / 4 = **248 cases**.

There are two ways to quote an average, and they give different numbers:

- **7.9 moves per case** (8.0 with aligned centres): each case solved from its best angle, with the turn that lines it up not counted, and every case counting equally. This is the number to compare algorithm lists by.
- **8.3 moves per position**: each of the 3,840 positions solved as efficiently as possible, counting every U turn, including the one that lines the case up. Positions are weighted by how often they come up, so this is what a real solve costs on average, and it's the number used in the [comparison with Roux](/methods/zbroux/#is-it-worth-it-zbroux-against-roux).

### The 46

The [ZBRoux page on the Speedsolving wiki](https://www.speedsolving.com/wiki/index.php/ZBRoux) gives EODFDB as 46 algorithms. It's in the info box at the top, under "No. Algs": "493 ZBLL, 46 EOFB or EODFDB". No list or definition has been published with it. A set of exactly 46 does come out if you set the step up intuitively first: both bottom edges on top and opposite, the top centre showing your top or bottom colour, the two cases that need no orienting left out, and mirror cases counted once. Without leaving those two out it's 48. That reconstruction and its list are on [the 46-case set](/algs/eodfdb/46/) page. It matches the number, but it isn't confirmed to be the set the wiki meant.

## Looking ahead to ZBLL

M moves never move the corners. U moves turn all four corners together, so their pattern relative to each other doesn't change during EODFDB. You can read the corner part of your ZBLL case while you're still doing EODFDB. If you also learn where the top-layer edges end up after each algorithm, you can know the whole ZBLL case before EODFDB is finished.
