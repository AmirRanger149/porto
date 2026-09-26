import { CORE_WASM_BASE64 } from "../wasm/core.b64";

function decodeCore(): Uint8Array<ArrayBuffer> {
  const bin = atob(CORE_WASM_BASE64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export type CoreStatus = "booting" | "online" | "fallback";

export interface CoreStats {
  /** total export invocations made by the page */
  calls: number;
  /** last xorshift32 output (unsigned) */
  prng: number;
  /** last fnv1a digest (unsigned) */
  hash: number;
}

export interface CoreApi {
  status: CoreStatus;
  version: string;
  moduleBytes: number;
  instantiateMs: number;
  memoryBytes: number;
  exports: string[];
  stats: CoreStats;
  xorshift(state: number): number;
  fnv1a(input: string): number;
  fib(n: number): number;
}

/* ---------- pure-JS mirror of the core (fallback path) ---------- */

function jsXorshift(s: number): number {
  let x = s >>> 0;
  x ^= (x << 13) >>> 0;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= (x << 5) >>> 0;
  return x >>> 0;
}

function jsFnv1a(input: string): number {
  const bytes = new TextEncoder().encode(input);
  let h = 0x811c9dc5;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

function jsFib(n: number): number {
  return n <= 1 ? n : jsFib(n - 1) + jsFib(n - 2);
}

/* ---------- loader ---------- */

function formatVersion(v: number): string {
  return `${Math.floor(v / 10000)}.${Math.floor(v / 100) % 100}.${v % 100}`;
}

let cached: Promise<CoreApi> | null = null;
let resolved: CoreApi | null = null;

export function peekCore(): CoreApi | null {
  return resolved;
}

export function getCore(): Promise<CoreApi> {
  if (!cached) cached = load();
  return cached;
}

async function load(): Promise<CoreApi> {
  const stats: CoreStats = { calls: 0, prng: 0, hash: 0 };

  try {
    const t0 = performance.now();
    const bytes = decodeCore();
    const compiled = await WebAssembly.compile(bytes);
    const instance = await WebAssembly.instantiate(compiled);
    const instantiateMs = performance.now() - t0;

    const exp = instance.exports as unknown as {
      memory: WebAssembly.Memory;
      core_version: () => number;
      xorshift32: (s: number) => number;
      fnv1a: (ptr: number, len: number) => number;
      fib: (n: number) => number;
    };

    const mem = new Uint8Array(exp.memory.buffer);
    const encoder = new TextEncoder();

    const api: CoreApi = {
      status: "online",
      version: formatVersion(exp.core_version()),
      moduleBytes: bytes.byteLength,
      instantiateMs,
      memoryBytes: exp.memory.buffer.byteLength,
      exports: Object.keys(instance.exports),
      stats,
      xorshift(state: number): number {
        stats.calls++;
        const v = exp.xorshift32(state | 0) >>> 0;
        stats.prng = v;
        return v;
      },
      fnv1a(input: string): number {
        stats.calls++;
        const data = encoder.encode(input);
        mem.set(data, 0);
        const v = exp.fnv1a(0, data.length) >>> 0;
        stats.hash = v;
        return v;
      },
      fib(n: number): number {
        stats.calls++;
        return exp.fib(n | 0) >>> 0;
      },
    };
    resolved = api;
    return api;
  } catch (err) {
    console.warn("[core] wasm unavailable, using JS fallback:", err);
    const api: CoreApi = {
      status: "fallback",
      version: "1.0.3-js",
      moduleBytes: 0,
      instantiateMs: 0,
      memoryBytes: 0,
      exports: ["xorshift32", "fnv1a", "fib"],
      stats,
      xorshift(state: number): number {
        stats.calls++;
        const v = jsXorshift(state);
        stats.prng = v;
        return v;
      },
      fnv1a(input: string): number {
        stats.calls++;
        const v = jsFnv1a(input);
        stats.hash = v;
        return v;
      },
      fib(n: number): number {
        stats.calls++;
        return jsFib(n);
      },
    };
    resolved = api;
    return api;
  }
}
