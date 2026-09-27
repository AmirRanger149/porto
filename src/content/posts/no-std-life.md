---
title: "Living in no_std"
date: 2025-11-21
tags: [rust, no_std]
abstract: "A panic handler that loops forever, a flat buffer instead of a heap, and the strange calm of a crate with nowhere to unwind to."
---

## The smallest possible roommate

The core behind this page is `#![no_std]`: no allocator, no `println!`, no
standard library at all. The entire runtime support is this:

```rust
#[panic_handler]
fn on_panic(_info: &PanicInfo) -> ! {
    loop {}
}
```

A panic handler that loops forever. There is no stderr to confess to, no
process to abort — just a wasm trap the browser reports as "unreachable."
Somewhere a tab's matrix rain freezes, and the console tells you exactly
which instruction gave up. It is the most honest crash report I have ever
shipped.

## What you actually lose (spoiler: less than you think)

For a pure-math module like this one:

- `format!` → you were logging in a place with no logs. Good riddance.
- `Vec` → replace with the host's `Uint8Array` view into linear memory.
  The *browser* is your allocator now.
- threads, filesystem, time → you never had them; the sandbox is the point

What you keep: slices, iterators, `wrapping_mul`, pattern matching, and the
borrow checker being exactly as insufferable as always. The compiler doesn't
care that you're small. It only cares that you're right.

## When no_std is the wrong answer

The moment you need strings that outlive a call, or collections that grow,
reach for `wasm-bindgen` and an allocator and stop being a hero. `no_std` is
for **leaf modules** — tight, pure, testable against vectors. Everything
this site renders qualifies. Your SaaS probably doesn't, and that's fine.
