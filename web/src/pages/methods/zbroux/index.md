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

A full solve is usually 41–45 moves, about the same as ZZ and fewer than most CFOP solves.

## Advantages

- It's rotationless. After the first block you mostly turn R, r, U and M, and the only rotations come from a few ZBLL algorithms.
- The first two layers are efficient. Two blocks plus EODFDB take about as many moves as ZZ's EOLine plus F2L.
- The finish is fast to turn. Roux ends with M and U moves in LSE, while ZBRoux ends with drilled face-turn algorithms.
- You can look ahead easily. The DF and DB edges are easy to track during the second block, and during EODFDB the corners only move with U, so you can recognise most of the ZBLL case before you get there.

## Disadvantages

- Full ZBLL is 493 algorithms. You can start with a two-look last layer and learn ZBLL over time; the [learning path](/methods/zbroux/learning-path/) explains how.
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

Finishing Roux blocks with DF, DB and a CFOP-style last layer has been suggested many times, so no single person gets the credit. The earliest known suggestion is from 2010, and it came up again later that year. The best-known write-up is **LLOB** (2017) by CriticalCubing and Teoidus, which proposed doing EO together with DF and DB and finishing with ZBLL. It was proposed again in 2023. [Cubing History](https://cubinghistory.com/3x3/Methods/ZBRoux) and the [Speedsolving wiki](https://www.speedsolving.com/wiki/index.php/ZBRoux) list the proposals.
