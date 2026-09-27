---
title: "229 bytes of rain"
date: 2026-01-18
tags: [wasm, generative]
abstract: "The matrix rain on this site isn't Math.random(). It falls because a tiny compiled xorshift keeps shoving it."
---

## A deterministic downpour

Every column of green on this page advances by asking a 229-byte WebAssembly
module for its next random number:

```wat
(func (export "xorshift32") (param $s i32) (result i32)
  (local $x i32)
  (local.set $x (local.get $s))
  (local.set $x (i32.xor (local.get $x) (i32.shl (local.get $x) (i32.const 13))))
  (local.set $x (i32.xor (local.get $x) (i32.shr_u (local.get $x) (i32.const 17))))
  (local.set $x (i32.xor (local.get $x) (i32.shl (local.get $x) (i32.const 5))))
  (local.get $x))
```

Marsaglia's xorshift: three shifts, three xors, period 2³²−1. JavaScript
keeps the seed per column; the core does the mixing. The rain you're watching
is a hash function having a good time.

## Why bother?

Three reasons, only one of them honest:

1. **Honest reason** — it's a demo that can't lie. The PRNG driving the
   aesthetic *is* the module the benchmarks measure. No stock footage.
2. **Practical reason** — the seed state lives in a `Uint32Array`, so 120
   columns × 30fps of entropy costs one export call each. Cheaper than
   `Math.random`'s closure dance in some engines.
3. **Unhealthy reason** — because nobody expects their screensaver to have
   an ABI.

## The trick worth stealing

Give your ambient effects the *same* entropy source as your "serious" code.
The scramble-decode headlines here pick glyphs via `fnv1a(text:index:frame)`
— deterministic noise, so the glitch art is reproducible. A bug in the rain
is a bug in the core, and bugs in the core have test vectors. That's the
whole philosophy: **make the decoration load-bearing.**
