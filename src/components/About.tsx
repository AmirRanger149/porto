import { useEffect, useState } from "react";
import { PROFILE } from "../data/profile";
import { runRace, type RaceOutcome } from "../lib/bench";
import { useInView } from "../hooks/useInView";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { SourceViewer } from "./SourceViewer";

function CountUp({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const reduced = usePrefersReducedMotion();
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const [v, setV] = useState(reduced ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setV(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 950);
      setV(value * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, reduced]);

  return (
    <span ref={ref}>
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/** The whole thesis in one widget: race the interpreter against the compiled core. */
function BenchRace() {
  const [state, setState] = useState<"idle" | "running" | "done">("idle");
  const [race, setRace] = useState<RaceOutcome | null>(null);

  const run = async () => {
    if (state === "running") return;
    setState("running");
    const r = await runRace(30, 5);
    setRace(r);
    setState("done");
  };

  const max = race ? Math.max(race.js.ms, race.wasm.ms) : 1;
  const bar = (ms: number) => `${Math.max(2, (ms / max) * 100)}%`;

  return (
    <div className="border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line bg-panel2 px-4 py-2.5">
        <span className="font-display text-lg tracking-wider text-phos">BENCH.RACE</span>
        <span className="text-[10px] tracking-[0.2em] text-dim">fib(30) · recursive · median of 5</span>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] tracking-wider">
            <span className="text-fog">JAVASCRIPT <span className="text-dim">(interpreted)</span></span>
            <span className="text-amber">{race ? `${race.js.ms.toFixed(2)} ms` : "——"}</span>
          </div>
          <div className="h-3 border border-line bg-void">
            <div
              className="h-full bg-amber transition-[width] duration-700 ease-out"
              style={{ width: race ? bar(race.js.ms) : "0%" }}
            />
          </div>
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] tracking-wider">
            <span className="text-fog">
              WEBASSEMBLY <span className="text-dim">(core.wasm, 229 B)</span>
            </span>
            <span className="text-phos">{race ? `${race.wasm.ms.toFixed(2)} ms` : "——"}</span>
          </div>
          <div className="h-3 border border-line bg-void">
            <div
              className="h-full bg-phos transition-[width] duration-700 ease-out"
              style={{ width: race ? bar(race.wasm.ms) : "0%" }}
            />
          </div>
        </div>

        <div className="min-h-[3.5rem] border-t border-line/70 pt-3 text-[12px] leading-relaxed">
          {state === "idle" && <p className="text-dim">// both engines compute the same 832,040 additions. one of them brought a compiler.</p>}
          {state === "running" && (
            <p className="text-phos">
              <span className="blink">▊</span> running workload… keep this tab visible
            </p>
          )}
          {state === "done" && race && (
            <p className="rise">
              <span className="text-phos">▲ wasm wins ×{race.speedup.toFixed(1)}</span>
              <span className="text-dim"> · outputs agree: {race.wasm.value.toLocaleString()} ✓ · your engine, this silicon, this moment</span>
            </p>
          )}
        </div>

        <button
          onClick={run}
          disabled={state === "running"}
          className="group flex w-full items-center justify-between border border-phos px-4 py-2.5 font-display text-lg tracking-wide text-phos transition-colors duration-200 hover:bg-phos hover:text-void disabled:cursor-wait disabled:opacity-60"
        >
          <span>{state === "running" ? "[ RACING… ]" : state === "done" ? "[ RACE AGAIN ]" : "[ START RACE ]"}</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">▸▸</span>
        </button>
      </div>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeading index="01" title="ABOUT" cmd="cat ~/about.txt --verbose" />

      <div className="grid gap-10 lg:grid-cols-[5fr_6fr] lg:gap-14">
        <div>
          <Reveal>
            <div className="border border-line bg-panel/80 p-5">
              {PROFILE.bio.map((p, i) => (
                <p key={i} className="mb-4 text-sm leading-relaxed text-fog last:mb-0">
                  <span className="mr-2 select-none text-line2">//</span>
                  {p}
                </p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <dl className="mt-6 border border-line bg-panel/80">
              {PROFILE.facts.map(([k, v]) => (
                <div
                  key={k}
                  className="row-scan flex items-baseline justify-between gap-4 border-b border-line/70 px-4 py-3 text-[13px] last:border-0"
                >
                  <dt className="text-[10px] tracking-[0.25em] text-dim">{k}</dt>
                  <dd className="text-right text-fog">{v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={180}>
            <div className="mt-6 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-4">
              {PROFILE.counters.map((c) => (
                <div key={c.label} className="bg-panel px-3 py-4 transition-colors hover:bg-panel2">
                  <p className="font-display text-3xl text-phos sm:text-4xl">
                    <CountUp value={c.value} suffix={c.suffix} decimals={c.decimals ?? 0} />
                  </p>
                  <p className="mt-1 text-[9px] tracking-[0.2em] text-dim">{c.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="space-y-8">
          <Reveal delay={120}>
            <BenchRace />
          </Reveal>
          <Reveal delay={200}>
            <div>
              <p className="mb-3 text-[10px] tracking-[0.25em] text-dim">
                THE CORE — 229 BYTES OF COMPILED RUST, RUNNING THIS PAGE RIGHT NOW
              </p>
              <SourceViewer />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
