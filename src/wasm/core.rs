//! core.rs — the Rust crate this site's WebAssembly core is written against.
//!
//! Build (the real toolchain):
//!   rustup target add wasm32-unknown-unknown
//!   cargo build --release --target wasm32-unknown-unknown \
//!     -- -C link-args=--export-memory -C lto=fat -C opt-level=z
//!
//! The checked-in `core.wasm` is the wat2wasm output of `core.wat`,
//! which is kept semantics-identical to this file (see `scripts/build-wasm.mjs`).

#![no_std]
#![allow(clippy::missing_safety_doc)]

use core::panic::PanicInfo;

#[panic_handler]
fn on_panic(_info: &PanicInfo) -> ! {
    // The matrix has you. There is nowhere to unwind to.
    loop {}
}

/// Semantic version, packed as MAJOR * 10_000 + MINOR * 100 + PATCH.
#[no_mangle]
pub extern "C" fn core_version() -> u32 {
    10_003 // 1.0.3
}

/// Marsaglia xorshift32. Pure, stateless one step — JS keeps the seed,
/// the core does the mixing. Feeds the rain daemon and the scramble FX.
#[no_mangle]
pub extern "C" fn xorshift32(state: u32) -> u32 {
    let mut x = state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    x
}

/// FNV-1a 32-bit over raw linear memory. JS writes UTF-8 bytes into
/// shared memory, then asks the core for the digest.
///
/// # Safety
/// `[ptr, ptr + len)` must be readable for `len` bytes.
#[no_mangle]
pub unsafe extern "C" fn fnv1a(ptr: *const u8, len: u32) -> u32 {
    let bytes = core::slice::from_raw_parts(ptr, len as usize);
    let mut hash: u32 = 0x811c_9dc5;
    for &byte in bytes {
        hash ^= byte as u32;
        hash = hash.wrapping_mul(0x0100_0193);
    }
    hash
}

/// Naive recursive fibonacci — deliberately exponential.
/// It exists so you can race JavaScript against the compiled core
/// and watch the gap. `fib(30) = 832_040`.
#[no_mangle]
pub extern "C" fn fib(n: u32) -> u32 {
    if n <= 1 {
        n
    } else {
        fib(n - 1) + fib(n - 2)
    }
}
