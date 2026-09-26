# ▚ KAI NAKAMURA — rust → wasm portfolio

A terminal-flavoured portfolio site whose matrix rain, text scramble, live
monitor, benchmark race and in-page terminal all run on a **real 229-byte
WebAssembly core compiled from Rust**. No mock "wasm" — the module is fetched,
instantiated and invoked on every frame, with a JS mirror as graceful fallback.

```
 ██╗  ██╗ █████╗ ██╗      core.wasm ......... 229 bytes
 ██║ ██╔╝██╔══██╗██║      exports ........... memory · core_version
 █████╔╝ ███████║██║                          xorshift32 · fnv1a · fib
 ██╔═██╗ ██╔══██║██║      stack ............. React 19 · Vite 7 · Tailwind 4
 ██║  ██╗██║  ██║██║      fonts ............. VT323 × IBM Plex Mono
 ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝      tracking .......... none. the rain sees all.
```

---

## Quick start

```bash
npm install     # node >= 20.19 (or 22.12+)
npm run dev     # http://localhost:5173 — dev server + HMR
npm run build   # → dist/index.html  (single self-contained file)
npm run preview # serve the production build locally
```

That's it. The compiled core ships as **base64 text embedded in
`src/wasm/core.b64.ts`** (generated from `core.wasm`), so no Rust or wasm
tooling is required — and the build can't break if a binary file gets lost in
a copy/transfer or `.gitignore`.

---

## Run with Docker

```bash
docker compose up --build
```

Then open **http://localhost:8080**. The image is a three-stage assembly line:

1. **`core`** — recompiles the wasm core from `core.wat` (never trusts a binary, only source)
2. **`build`** — `npm ci && npm run build` → the single-file `dist/index.html`
3. **`serve`** — `nginx:alpine` with gzip, SPA fallback and security headers

Useful commands:

```bash
docker compose up -d                        # detached, in the background
docker compose logs -f                      # watch nginx access logs
docker compose down                         # stop + remove
docker compose up --build --force-recreate  # rebuild after code changes
```

No compose? Plain docker works too:

```bash
docker build -t nakamura-portfolio .
docker run --rm -p 8080:80 nakamura-portfolio
```

Port is mapped `8080 → 80`; change the left side of `"8080:80"` in
`compose.yaml` if 8080 is taken.

---

## Rebuilding the WASM core

### Path A — no Rust needed (wat2wasm)

`core.wat` is the compilation source and is kept semantics-identical to the
Rust crate. It compiles with [wabt](https://github.com/WebAssembly/wabt)
(already a devDependency):

```bash
node scripts/build-wasm.mjs
# → writes src/wasm/core.wasm (binary artifact)
# → writes src/wasm/core.b64.ts (what the site actually imports)
# → smoke test: fib(10)=55 fnv1a("")=0x811c9dc5 xorshift(1)=270369 version=10003 PASS
```

### Path B — the real Rust toolchain

`src/wasm/` is a complete `#![no_std]` crate (`core.rs` + `Cargo.toml` +
`.cargo/config.toml`). With Rust installed:

```bash
rustup target add wasm32-unknown-unknown
cd src/wasm
cargo build --release
# → target/wasm32-unknown-unknown/release/portfolio_core.wasm

# use it as the site's core:
cp target/wasm32-unknown-unknown/release/portfolio_core.wasm ../core.wasm
```

Both binaries export the same ABI — `memory, core_version, xorshift32,
fnv1a, fib` — and the loader (`src/lib/wasm.ts`) binds by name, so either one
drops in. Release profile is tuned for size (`opt-level = "z"`, LTO,
`panic = "abort"`).

---

## How the page uses the core

| Export       | Where you can see it working                                    |
| ------------ | --------------------------------------------------------------- |
| `xorshift32` | Matrix rain column/glyph entropy · CORE_MONITOR PRNG + sparkline |
| `fnv1a`      | Glyph noise for every scramble-decode headline (deterministic)   |
| `fib`        | `BENCH.RACE` widget + `bench` terminal command (JS vs WASM)      |
| `memory`     | JS writes UTF-8 into linear memory for `fnv1a` string hashing    |
| `core_version` | Header LED, footer, boot loader and `sysinfo` readouts         |

---

## Project structure

```
├── Dockerfile                # 3 stages: core → build → nginx
├── compose.yaml              # docker compose up --build → http://localhost:8080
├── deploy/nginx.conf         # gzip · SPA fallback · security headers
├── scripts/build-wasm.mjs    # wat → wasm compiler + smoke test
├── src/
│   ├── wasm/
│   │   ├── core.rs           # Rust crate source (shown in-page, cargo-buildable)
│   │   ├── core.wat          # compilation source for the binary
│   │   ├── core.wasm         # 229-byte binary artifact (regenerable)
│   │   ├── core.b64.ts       # ← AUTO-GENERATED base64 embed the site imports
│   │   ├── Cargo.toml        # crate manifest (cdylib, opt-level z)
│   │   └── .cargo/config.toml
│   ├── lib/
│   │   ├── wasm.ts           # loader, typed API, call stats, JS fallback
│   │   └── bench.ts          # JS-vs-WASM fib race (median-of-N)
│   ├── components/           # BootScreen · MatrixRain · Header · Hero ·
│   │                         # About · Projects · Skills · Terminal · Uplink …
│   ├── data/profile.ts       # ← all persona/project/skill/channel data
│   └── hooks/                # reveal · in-view · reduced-motion · core
└── index.html
```

---

## Terminal cheat sheet

The `./tty` section is a live shell — type in it:

```
help        list commands          bench       race JS vs WASM fib(30)
sysinfo     core + machine dump    matrix zen  overdrive the rain daemon
projects    list case files        matrix off  kill the rain (on = restore)
skills      diagnostics            pill        choose wisely
about       the operator           sudo        (you are not in sudoers)
contact     uplink channels        clear       wipe the session
```

`↑` / `↓` recall history. `echo` works too — it just doesn't remember.

---

## Make it yours

Everything personal lives in **`src/data/profile.ts`** — name, handle, bio,
counters, the six case files, skill groups, ticker items and uplink channels.
Swap that one file and the whole site (terminal included) follows.

---

## Troubleshooting

| Symptom                                | Fix                                                                  |
| -------------------------------------- | --------------------------------------------------------------------- |
| `Cannot find package 'wabt'`           | `npm install` (it's a devDependency) — or just don't rebuild; the core embed is prebuilt |
| `Could not resolve "../wasm/core.wasm?url"` | You're on an old copy where the binary was lost in transfer. Fix: `node scripts/build-wasm.mjs` — or sync the current sources, which embed the core as text (`core.b64.ts`) and need no binary at all |
| Header LED shows `CORE:JS-MIRROR`      | WASM failed to instantiate (ancient browser); site still works via the JS fallback |
| `cargo build` fails                    | `rustup target add wasm32-unknown-unknown` — or use Path A (wabt)     |
| Want calmer motion                     | The site honours `prefers-reduced-motion`: static rain frame, no scrambles |

## Build notes

- Production output is a **single `dist/index.html`** (via
  `vite-plugin-singlefile`): JS, CSS and the wasm binary (as a data URL) are
  inlined — deploy it anywhere, even `file://`.
- Fonts load from Google Fonts (VT323 + IBM Plex Mono); everything else is
  self-hosted, and nothing phones home.

```
$ exit
logout — connection to wasm closed.
```
