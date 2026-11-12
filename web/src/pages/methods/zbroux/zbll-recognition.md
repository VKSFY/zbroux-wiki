---
layout: ../../../layouts/Article.astro
title: ZBLL recognition
description: How to recognise a ZBLL case quickly in three looks, how much of the cube you need to see, and how ZBRoux lets you do most of it during EODFDB.
lede: ZBLL has 493 cases, but you never identify one from scratch. You narrow it down in three looks, shape, corners, then edges, and in ZBRoux you can do the first two before EODFDB is even finished.
crumbs:
  - { href: "/methods/zbroux/", label: "ZBRoux" }
  - { href: "/methods/zbroux/zbll/", label: "ZBLL" }
---

## How much you need to see

These numbers were computed over every ZBLL case, from all four angles:

- **The top face plus two adjacent sides is always enough.** From any angle, the top and the two sides facing you (front and right) tell every one of the 493 cases apart. You never need to look at a third side.
- **One side is never enough.** With the top and only one side, every view matches several cases, up to 6.
- The top face alone identifies only about 4% of views.

So the skill to train is reading the top and the two sides you're facing, quickly and in a fixed order.

## Look 1: the shape

Look only at where your top colour is on the four corners. There are eight possibilities, the same as the corner cases of OLL:

| Shape | Corners showing the top colour on top | Cases | Comes up in |
|---|---|---|---|
| T, U, L | two | 72 each | 14.8% of solves each |
| Sune, Antisune | one | 72 each | 14.8% of solves each |
| Pi, H | none | 72 and 40 | 14.8% and 7.4% |
| PLL | all four | 21 | 3.7% |

With two corners oriented: T and U have them side by side, L has them diagonal. With one: Sune and Antisune differ in which way the other three are twisted. With none: H has the top colour on two opposite sides only, Pi on three sides. The [ZBLL case finder](/algs/zbll/) shows a picture of each shape.

## Look 2: the corner pattern

Within a shape, look at the side colours of the corners on the two sides you're facing. They split each shape into groups of 12 cases (H has groups of 8 and 12, PLL groups of 4, 5 and 12). Things to look for:

- **Headlights**: the two corners on one side show the same colour on that side.
- **Opposite colours**: the two corners on one side show opposite colours (like green and blue).
- **Neighbouring colours**: the two corners on one side show colours that sit next to each other on the cube.

Which of these you see on the front and the right, together with the shape, tells you the group. The [case finder](/algs/zbll/) shows every group's corner pattern as a picture, with the edges greyed out, so you can learn them one shape at a time.

## Look 3: the edges

Once you know the group, 12 cases are left, and they differ only in where the four top edges are. Compare each edge you can see with the corner stickers next to it on the same side:

- **Bar**: the edge matches the corner sticker on both sides of it, making a row of three of the same colour.
- **Block**: the edge matches the corner sticker on one side only, making a pair.
- **Opposite**: the edge is the opposite colour of a corner sticker next to it.

The pattern of bars, blocks and opposites on the front and right sides is enough to pick the exact case, since two sides always identify it. Learn the 12 cases of a group together, so you learn to tell them apart rather than recognise each one separately.

## Doing most of it during EODFDB

During EODFDB, M moves never touch the corners and U moves turn all four together. So the shape and the corner pattern are already visible while you're still doing EODFDB, and they don't change. If you've done looks 1 and 2 by the time EODFDB ends, only the edges are left to read, and those are the pieces EODFDB has just been moving, so you've already been watching them.

## Practising

- Use the [trainer](/tools/trainer/) with "Show the case picture before solving" turned **off**, so you have to recognise the case from the cube.
- Start with one set and one corner group at a time.
- In real solves, say the shape and corner group to yourself before EODFDB ends. That habit is what makes the method's last step pauseless.

<small>How the recognition numbers were computed: every case was looked at from all four angles, and the stickers on the top face and on the chosen sides were compared using relative colours (the same, opposite, or next to each other), since that's how recognition works. The code is [zbll_recognition.py](https://github.com/VKSFY/zbroux-wiki/blob/main/tools/zbll_recognition.py).</small>
