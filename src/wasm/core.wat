;; core.wat — hand-tuned WebAssembly core for the portfolio.
;; Semantics 1:1 with core.rs (the Rust crate source shown in the UI).
;; Compile: node scripts/build-wasm.mjs   (wat2wasm via wabt)

(module $core

  ;; 1 page = 64 KiB of linear memory, shared with JS for string hashing.
  (memory (export "memory") 1)

  ;; Semantic version packed as MAJOR * 10000 + MINOR * 100 + PATCH  → 1.0.3
  (func (export "core_version") (result i32)
    (i32.const 10003))

  ;; Marsaglia xorshift32 PRNG — drives the matrix rain + text scramble.
  (func (export "xorshift32") (param $s i32) (result i32)
    (local $x i32)
    (local.set $x (local.get $s))
    (local.set $x (i32.xor (local.get $x) (i32.shl (local.get $x) (i32.const 13))))
    (local.set $x (i32.xor (local.get $x) (i32.shr_u (local.get $x) (i32.const 17))))
    (local.set $x (i32.xor (local.get $x) (i32.shl (local.get $x) (i32.const 5))))
    (local.get $x))

  ;; FNV-1a 32-bit hash over linear memory at [ptr, ptr+len).
  (func (export "fnv1a") (param $ptr i32) (param $len i32) (result i32)
    (local $h i32)
    (local $i i32)
    (local.set $h (i32.const 2166136261))
    (block $done
      (loop $next
        (br_if $done (i32.ge_u (local.get $i) (local.get $len)))
        (local.set $h
          (i32.mul
            (i32.xor
              (local.get $h)
              (i32.load8_u (i32.add (local.get $ptr) (local.get $i))))
            (i32.const 16777619)))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        (br $next)))
    (local.get $h))

  ;; Naive recursive fibonacci — the JS-vs-WASM benchmark workload.
  (func $fib (export "fib") (param $n i32) (result i32)
    (if (result i32) (i32.le_s (local.get $n) (i32.const 1))
      (then (local.get $n))
      (else
        (i32.add
          (call $fib (i32.sub (local.get $n) (i32.const 1)))
          (call $fib (i32.sub (local.get $n) (i32.const 2)))))))
)
