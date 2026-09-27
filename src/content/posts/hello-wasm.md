---
title: "Your browser is a runtime now"
date: 2026-02-02
tags: [wasm, rust, web]
abstract: "The web stopped being a document viewer a long time ago. Here's what clicking 'view source' on a WebAssembly module actually feels like."
---

## The pitch nobody makes

People still introduce WebAssembly as "fast JavaScript." It isn't. It's a
**compilation target with a sandbox**, and the speed is a side effect of
taking the JIT out of the hot path. When you ship a `.wasm` module you are
shipping *decisions you made at compile time* — register allocation,
inlining, loop unrolling — straight past the interpreter.

The browser gives you, for free:

- a portable 32/64-bit VM that starts in single-digit milliseconds
- linear memory you can hand to Rust like it's `malloc`'s weird cousin
- `WebAssembly.instantiate` — a syscall-free `dlopen`

## What surprised me

Linear memory is the culture shock. There is no heap, no allocator unless
you bring one — just a flat `ArrayBuffer` and an offset. The first time you
write a string hasher you do what I did in `core.rs`:

```rust
pub unsafe extern "C" fn fnv1a(ptr: *const u8, len: u32) -> u32 {
    let bytes = core::slice::from_raw_parts(ptr, len as usize);
    // ...the rest is multiplication and regret
}
```

JavaScript owns the buffer. Rust borrows it. Nobody copies anything. That
single idea — *share memory across the language boundary* — unlocks audio
engines, raycasters, crypto cores. Everything else is ergonomics.

## The honest caveat

WASM is not free. Every export call crosses a boundary, and if you call it
per-pixel per-frame with a chatty ABI you will lose to canvas 2D. Design the
seam: batch, share buffers, let the module *own* the loop. Do that and the
browser becomes what it always pretended to be — an operating system with
really good font rendering.
