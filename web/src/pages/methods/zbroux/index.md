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

ZBRoux and Roux share the first two blocks, so the difference is entirely in the last ten pieces. Both methods have one intuitive step and one algorithm step. The intuitive steps are compared at their computed optimum, and the algorithm steps by algorithm lists. Every move is counted in STM, and the turns of the top layer are counted the same way on both sides:

| Last ten pieces | Roux | ZBRoux |
|---|---|---|
| Turn of the top layer before the algorithm | 0.75[^auf] | 0.75[^auf] |
| Algorithm step, from an algorithm list | CMLL: 9.75[^cmll] | ZBLL: 13.05[^zbll] |
| Intuitive step, shortest possible | LSE: 11.14, including lining up the corners and the final turn[^lse] | EODFDB: 8.31, before ZBLL[^eod] |
| Turn of the top layer after the last algorithm | (part of LSE) | 0.75[^auf] |
| Total | about 21.6 | about 22.9 |

With these figures ZBRoux takes about one move more than Roux for the last ten pieces. EODFDB is about three moves shorter than LSE, but ZBLL is a little over three moves longer than CMLL, and ZBRoux needs a turn of the top layer after its last algorithm where Roux does that inside LSE.

The two algorithm figures aren't quite alike. The CMLL figure comes from a human-picked sheet, while the ZBLL figure comes from this wiki's computer search, which favours short algorithms. Hand-picked algorithms usually give up a move or two for better finger tricks, so a typical human ZBLL list would probably be longer, and the real gap a bit bigger than one move. Where ZBRoux can win is time, not moves: Roux finishes with M and U turns, while ZBRoux finishes with one drilled face-turn algorithm, which most people can turn faster, and during EODFDB you can already read most of your ZBLL case.

[^auf]: The turn before the algorithm is computed for ZBLL over all 7,776 last-layer positions with this wiki's algorithms: one is needed in 75% of solves. The same 0.75 is assumed for CMLL. After ZBLL a turn is needed in 75% of solves too. In Roux, the turn that lines the corners up after CMLL is part of LSE, which is counted from any angle.
[^cmll]: From the [LLOB write-up](https://docs.google.com/document/d/1gs3THtRU5UCckKcM_5zjjm5RkJmGxHAJUnv6ta4lJhw/mobilebasic), which gives 10 moves "computed from avg of all the algs in my cmll sheet + 0.25 AUF". The 0.25 is taken out here because the turn before the algorithm is counted separately. This is the only number in the table not computed for this wiki, so treat it as accurate to about a move.
[^lse]: The exact average of the shortest solution over all 184,320 LSE positions, with the top layer at any angle, including the final turn, computed for this wiki. Starting with the corners already lined up gives 11.16, and leaving the first turn of the top layer free gives 10.55. Human LSE usually takes a couple of moves more.
[^eod]: The exact average of the shortest solution over all 3,840 EODFDB positions, counting every U turn, computed for this wiki. Intuitive EODFDB usually takes a few moves more. If you pick, among the shortest EODFDB solutions, one that leaves the top layer at the angle your ZBLL algorithm starts from, EODFDB plus the turn before ZBLL drops from 9.06 to 8.84 moves on average, but only if you already know your ZBLL case before EODFDB ends.
[^zbll]: The first algorithm listed for each case, weighted by how often each case comes up. These come from a computer search and aren't hand-picked, see [how the algorithms are made](/about/#zbll).

**Algorithms to learn.** Roux needs the 42 CMLL algorithms. ZBRoux needs the 493 ZBLL algorithms:

| EODFDB done | Algorithms in total | More than Roux |
|---|---|---|
| intuitively | 493 | 451 |
| with the [46-case set](/algs/eodfdb/46/) | 539 | 497 |
| with all [248 cases](/algs/eodfdb/) with aligned centres | 741 | 699 |

If you want few algorithms or the fewest moves, Roux is the better choice. ZBRoux is for people who like Roux blockbuilding and want a faster-turning, more algorithmic finish, and are happy to learn ZBLL for it.

[^lse]: The exact average of the shortest solution over all 46,080 LSE positions that start with the corners lined up, including the final turn of the top layer, computed for this wiki. If the turn before LSE is also left free it's 10.6. Human LSE usually takes a couple of moves more.
[^eod]: The exact average of the shortest solution over all 3,840 EODFDB positions, counting every U turn, computed for this wiki. Intuitive EODFDB usually takes a few moves more.
[^cmll]: From the [LLOB write-up](https://docs.google.com/document/d/1gs3THtRU5UCckKcM_5zjjm5RkJmGxHAJUnv6ta4lJhw/mobilebasic): the average of a CMLL algorithm sheet plus the AUF. This is the only number in the table not computed for this wiki, so treat it as accurate to about a move.
[^zbll]: The first algorithm listed for each case, weighted by how often each case comes up. A turn of the top layer is needed before the algorithm in 75% of solves and after it in 75%, which adds 1.5 moves on average. These algorithms come from a computer search and aren't hand-picked, see [how the algorithms are made](/about/#zbll). If you pick, among the shortest EODFDB solutions, one that leaves the top layer at the angle your ZBLL algorithm starts from, EODFDB plus the turn before ZBLL drops from 9.06 to 8.84 moves on average. That only works if you already know your ZBLL case before EODFDB ends.

## Advantages

- It's rotationless. After the first block you mostly turn R, r, U and M, and the only rotations come from a few ZBLL algorithms.
- The first two layers are efficient. Two blocks plus EODFDB take about as many moves as ZZ's EOLine plus F2L.
- The finish is a single drilled algorithm instead of M and U turns, which most people can turn faster.
- You can look ahead easily. The DF and DB edges are easy to track during the second block, and the corners only move with the top layer during EODFDB, so you can recognise most of the ZBLL case before you get there.

## Disadvantages

- Full ZBLL is 493 algorithms, 451 more than Roux's 42 CMLL (more if you also learn EODFDB algorithms). You can start with a two-look last layer and learn ZBLL over time; the [learning path](/methods/zbroux/learning-path/) explains how.
- It takes about one move more than Roux for the last ten pieces, probably a bit more with hand-picked ZBLL algorithms, see the table above.
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
- **CriticalCubing, 2017**: the [LLOB thread](https://www.speedsolving.com/threads/last-layer-optimized-blockbuilding-llob-method.65223/), the best-known proposal, which argued for doing EO together with DF and DB and finishing with ZBLL. The [LLOB document](https://docs.google.com/document/d/1gs3THtRU5UCckKcM_5zjjm5RkJmGxHAJUnv6ta4lJhw/mobilebasic) linked from that thread names CriticalCubing and Teoidus as its authors.
- **KuatSyen, 2023**, [in the thread "Speedcubing method idea"](https://www.speedsolving.com/threads/speedcubing-method-idea.89355/)

The [Speedsolving wiki](https://www.speedsolving.com/wiki/index.php/ZBRoux) also has a page on the method.
