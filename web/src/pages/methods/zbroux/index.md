---
layout: ../../../layouts/Article.astro
title: What is ZBRoux?
description: The ZBRoux (LLOB / FSLZ) speedsolving method. Roux blockbuilding into EODFDB and a one-look ZBLL last layer.
lede: ZBRoux solves the first two layers like Roux, with two 1x2x3 blocks, and then finishes like ZZ, with edges oriented and the last layer in one algorithm.
---

Instead of Roux's CMLL and LSE, you orient all the remaining edges while placing the last two bottom edges (DF and DB). That leaves the first two layers solved with every last-layer edge oriented, and one ZBLL algorithm finishes the cube.

The method is also called **LLOB** (Last Layer Optimized Blockbuilding) and **FSLZ**.

## Steps

| Step | What you do | Typical moves |
|------|-------------|---------------|
| [1. First block](/methods/zbroux/first-block/) | Build a 1x2x3 block on the left | ~7 |
| [2. Second block](/methods/zbroux/second-block/) | Build a matching block on the right, using R, r, U and M | 14–16 |
| [3. EODFDB](/methods/zbroux/eodfdb/) | Orient all edges and place DF and DB, using M and U | ~8 |
| [4. ZBLL](/methods/zbroux/zbll/) | Solve the last layer in one algorithm | ~13 |

Moves are counted in STM. A full solve is usually 41–45 moves, about the same as ZZ and fewer than most CFOP solves.

## Is it worth it? ZBRoux against Roux

ZBRoux and Roux share the first two blocks, so the difference is entirely in the last ten pieces. Measured in STM (every turn, including slice turns and half turns, counts as one):

| Last ten pieces | Roux | ZBRoux |
|---|---|---|
| First step | CMLL: about 10 moves, including the AUF[^cmll] | EODFDB: 8.3 moves at best[^eod] |
| Second step | LSE: 11.1 moves at best[^lse] | ZBLL: 13.1 moves with this wiki's algorithms[^zbll] |
| Total | about 21 | about 21.4, plus AUF |
| Algorithms to learn | 42 (CMLL); LSE is intuitive | 493 (ZBLL); EODFDB can be intuitive, with [46](/algs/eodfdb/46/) or all [248](/algs/eodfdb/) cases as optional extras |
| Looks | CMLL, then LSE in several smaller steps | EODFDB, then ZBLL |

The move counts come out about even, so ZBRoux doesn't save moves overall. What it changes is the kind of moves. Roux finishes with M and U turns, while ZBRoux finishes with one drilled face-turn algorithm, which most people can turn faster. During EODFDB you can also read most of your ZBLL case, so there's less pause before the last algorithm. The price is around 450 more algorithms than Roux. If you want a low algorithm count, Roux is the better choice. ZBRoux is for people who already like Roux blockbuilding and are happy to learn ZBLL for a faster, more algorithmic finish.

[^cmll]: From the [LLOB write-up](https://docs.google.com/document/d/1gs3THtRU5UCckKcM_5zjjm5RkJmGxHAJUnv6ta4lJhw/mobilebasic): the average of a CMLL sheet plus the AUF.
[^lse]: The exact average of the shortest solution over all 184,320 LSE positions, computed for this wiki. Human LSE usually takes a couple of moves more.
[^eod]: The exact average of the shortest solution over all 3,840 EODFDB positions, computed for this wiki. Intuitive EODFDB usually takes a few moves more.
[^zbll]: The average length of the first algorithm listed for each case, weighted by how often each case comes up, without the AUF. These algorithms come from a computer search and aren't optimal or hand-picked, see [how the algorithms are made](/about/#zbll).

## Advantages

- It's rotationless. After the first block you mostly turn R, r, U and M, and the only rotations come from a few ZBLL algorithms.
- The first two layers are efficient. Two blocks plus EODFDB take about as many moves as ZZ's EOLine plus F2L.
- The finish is a single drilled algorithm instead of M and U turns, which most people can turn faster.
- You can look ahead easily. The DF and DB edges are easy to track during the second block, and the corners only move with the top layer during EODFDB, so you can recognise most of the ZBLL case before you get there.

## Disadvantages

- Full ZBLL is 493 algorithms, around 450 more than Roux. You can start with a two-look last layer and learn ZBLL over time; the [learning path](/methods/zbroux/learning-path/) explains how.
- It doesn't use fewer moves than Roux, see the table above.
- Blockbuilding takes practice, especially planning the first block in inspection. Roux solvers already have this skill.
- Slice-heavy blockbuilding is awkward on 4x4 and bigger cubes.

## Compared with Roux and ZZ

| | Roux | ZBRoux | ZZ with ZBLL |
|---|---|---|---|
| First two layers | Two blocks | Two blocks, then EODFDB | EOLine or EOCross, then F2L |
| Last layer | CMLL + LSE | ZBLL | ZBLL |
| Algorithms for the full method | about 42 | 493 ZBLL, plus optional EODFDB algs | 493 ZBLL |
| Main moves | R r U M | R r U M, then ZBLL | R U L |

If you already solve Roux, you keep your blockbuilding and replace CMLL and LSE with EODFDB and ZBLL. If you solve ZZ, you keep ZBLL and change how you get to an edge-oriented F2L.

## History

Finishing Roux blocks with DF, DB and an edge-oriented last layer has been suggested several times, so no single person gets the credit. [Cubing History](https://cubinghistory.com/3x3/Methods/ZBRoux) lists these proposals:

- **Michael James Straughan, 2010**: the earliest known suggestion, in the Speedsolving thread "[Does this (sub) method have a name?](https://www.speedsolving.com/threads/does-this-sub-method-have-a-name.22232/#post-407245)"
- **S. Gu, 2010**, [in a Speedsolving discussion thread](https://www.speedsolving.com/threads/random-cubing-discussion.22862/page-7#post-438312)
- **CriticalCubing and Teoidus, 2017**: [LLOB](https://www.speedsolving.com/threads/last-layer-optimized-blockbuilding-llob-method.65223/), the best-known write-up, which argued for doing EO together with DF and DB and finishing with ZBLL
- **KuatSyen, 2023**, [in the thread "Speedcubing method idea"](https://www.speedsolving.com/threads/speedcubing-method-idea.89355/)

The [Speedsolving wiki](https://www.speedsolving.com/wiki/index.php/ZBRoux) also has a page on the method.
