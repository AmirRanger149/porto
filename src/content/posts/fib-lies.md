---
title: "The fib benchmark is a lie — run it anyway"
date: 2025-12-07
tags: [benchmarks, wasm, honesty]
abstract: "Recursive fibonacci proves nothing about your workload. It's still the best recruitment poster a runtime ever had."
---

## What fib(30) actually measures

The race on this site — JavaScript vs `core.wasm` on recursive `fib(30)` —
measures exactly one thing: **how much your engine hates redundant call
stacks**. It says nothing about DOM throughput, GC pauses under real
allocation patterns, or whether your audio graph will underrun. Anyone who
sells you fib numbers as architecture advice is selling you a t-shirt.

And yet. Run it in the terminal above (`bench`) and watch the wasm line come
in 5–15× under the JS line on almost any silicon made this decade. Why does
a dishonest benchmark produce such a consistent feeling?

## Because the gap is real, just mislabeled

What fib compresses into 832,040 additions is the cost model difference:

- **JS**: polymorphic call sites, on-stack replacement, a JIT that only
  *arrives* after the function is hot — and recursion that stays lukewarm
- **WASM**: types known forever, stack frames fixed at compile time, zero
  runtime negotiation

The benchmark misattributes the gap to "compiled vs interpreted." The real
story is "decided at build time vs decided at 3am under memory pressure."

## The rule I ship by

Benchmark the lie to *feel* the runtime, then benchmark your actual hot loop
before believing anything. The fib race is a campfire story. Your profiler
is the court of law. Both belong in the same engineering culture — just
don't let the campfire story sign the purchase order.
