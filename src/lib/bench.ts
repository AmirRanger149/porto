import { getCore } from "./wasm";

export interface EngineResult {
  engine: "JavaScript" | "WebAssembly";
  ms: number;
  value: number;
}

export interface RaceOutcome {
  js: EngineResult;
  wasm: EngineResult;
  speedup: number;
  n: number;
  runs: number;
}

function jsFib(n: number): number {
  return n <= 1 ? n : jsFib(n - 1) + jsFib(n - 2);
}

const nextTick = () => new Promise<void>((r) => setTimeout(r, 0));

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/**
 * Races the recursive-fib workload: interpreter vs compiled core.
 * Each run is chunked onto its own tick so the UI stays responsive.
 */
export async function runRace(n: number, runs: number): Promise<RaceOutcome> {
  const core = await getCore();

  const jsTimes: number[] = [];
  let jsValue = 0;
  for (let i = 0; i < runs; i++) {
    await nextTick();
    const t0 = performance.now();
    jsValue = jsFib(n);
    jsTimes.push(performance.now() - t0);
  }

  const wasmTimes: number[] = [];
  let wasmValue = 0;
  for (let i = 0; i < runs; i++) {
    await nextTick();
    const t0 = performance.now();
    wasmValue = core.fib(n);
    wasmTimes.push(performance.now() - t0);
  }

  const js = { engine: "JavaScript" as const, ms: median(jsTimes), value: jsValue };
  const wasm = { engine: "WebAssembly" as const, ms: median(wasmTimes), value: wasmValue };

  return {
    js,
    wasm,
    speedup: wasm.ms > 0 ? js.ms / wasm.ms : 0,
    n,
    runs,
  };
}
