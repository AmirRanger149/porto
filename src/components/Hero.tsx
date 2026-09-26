import { useEffect, useRef, useState, type ReactNode } from "react";
import { PROFILE } from "../data/profile";
import { useCore } from "../hooks/useCore";
import { peekCore, type CoreApi } from "../lib/wasm";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Scramble } from "./Scramble";

const WHOAMI = [
  { prompt: "$ whoami", out: "kai nakamura — systems engineer, rust evangelist (reformed)" },
  { prompt: "$ uname -m", out: "wasm32 · rust core v1.0.3 · 64 KiB linear memory" },
  { prompt: "$ uptime", out: "7+ years in the grid · 42 systems shipped · 0 segfaults (knock on wood)" },
];

function useStepped(total: number, active: boolean, reduced: boolean, stepMs = 420): number {
  const [n, setN] = useState(reduced ? total : 0);
  useEffect(() => {
    if (reduced || !active) {
      if (reduced) setN(total);
      return;
    }
    let i = 0;
    const iv = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= total) clearInterval(iv);
    }, stepMs);
    return () => clearInterval(iv);
  }, [total, active, reduced, stepMs]);
  return n;
}

function CoreMonitor({ core }: { core: CoreApi | null }) {
  const [prngHex, setPrngHex] = useState("0x--------");
  const [calls, setCalls] = useState(0);
  const seedRef = useRef(0x9e3779b9);
  const trailRef = useRef<number[]>([]);
  const sparkRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const iv = setInterval(() => {
      const c = peekCore();
      if (!c) return;
      seedRef.current = c.xorshift(seedRef.current);
      trailRef.current = [...trailRef.current.slice(-59), seedRef.current & 0xff];
      setPrngHex("0x" + seedRef.current.toString(16).padStart(8, "0").toUpperCase());
      setCalls(c.stats.calls);
    }, 220);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const cv = sparkRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const W = (cv.width = cv.clientWidth);
    const H = (cv.height = cv.clientHeight);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(0,255,65,0.25)";
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();
    const trail = trailRef.current;
    if (trail.length < 2) return;
    ctx.strokeStyle = "#00ff41";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    trail.forEach((v, i) => {
      const x = (i / (trail.length - 1)) * W;
      const y = H - (v / 255) * (H - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  });

  const status = core?.status ?? "booting";
  const row = (label: string, value: ReactNode, tone = "text-fog") => (
    <div className="flex items-baseline justify-between gap-4 border-b border-line/60 py-2 text-[13px] last:border-0">
      <span className="text-dim">{label}</span>
      <span className={`text-right ${tone}`}>{value}</span>
    </div>
  );

  return (
    <div className="border border-line bg-panel">
      <div className="flex items-center justify-between border-b border-line bg-panel2 px-4 py-2.5">
        <span className="font-display text-lg tracking-wider text-phos">CORE_MONITOR</span>
        <span className="flex items-center gap-2 text-[10px] tracking-[0.2em] text-dim">
          <span className={`led h-1.5 w-1.5 rounded-full ${status === "online" ? "bg-phos text-phos" : status === "fallback" ? "bg-amber text-amber" : "bg-dim text-dim"}`} />
          LIVE
        </span>
      </div>
      <div className="px-4 py-3">
        {row(
          "STATUS",
          status === "online" ? "ONLINE" : status === "fallback" ? "JS MIRROR" : "BOOTING…",
          status === "online" ? "text-phos" : status === "fallback" ? "text-amber" : "text-dim"
        )}
        {row("PIPELINE", "rustc → wasm32-unknown-unknown")}
        {row("CORE VERSION", core ? `v${core.version}` : "—", "text-ice")}
        {row("MODULE SIZE", core ? `${core.moduleBytes} bytes` : "—")}
        {row("INSTANTIATE", core ? `${core.instantiateMs.toFixed(1)} ms` : "—")}
        {row("LINEAR MEMORY", core ? `${core.memoryBytes.toLocaleString()} B` : "—")}
        {row("XORSHIFT32 →", <span className="text-phos">{prngHex}</span>)}
        {row("CORE INVOCATIONS", calls.toLocaleString(), "text-phos-soft")}
      </div>
      <div className="border-t border-line px-4 py-3">
        <p className="mb-2 text-[10px] tracking-[0.25em] text-dim">PRNG SIGNAL — LOW BYTE</p>
        <canvas ref={sparkRef} className="h-14 w-full" aria-hidden="true" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(core?.exports ?? ["memory", "core_version", "xorshift32", "fnv1a", "fib"]).map((e) => (
            <span key={e} className="border border-line px-2 py-0.5 text-[10px] tracking-wider text-dim transition-colors hover:border-phos hover:text-phos">
              {e}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Hero({ active }: { active: boolean }) {
  const core = useCore();
  const reduced = usePrefersReducedMotion();
  const step = useStepped(WHOAMI.length * 2, active, reduced);

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6 md:pt-36">
      <p className="mb-8 text-[11px] tracking-[0.3em] text-dim">
        [ GUEST ACCESS GRANTED — UID 1000 — {PROFILE.location} ]
      </p>

      <div className="grid gap-10 lg:grid-cols-[7fr_5fr] lg:gap-14">
        <div>
          {/* terminal readout */}
          <div className="mb-10 border border-line bg-panel/90">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-line2" />
              <span className="h-2 w-2 rounded-full bg-line2" />
              <span className="h-2 w-2 rounded-full bg-phos" />
              <span className="ml-3 text-[11px] tracking-wider text-dim">guest@wasm: ~</span>
            </div>
            <div className="space-y-2 px-4 py-4 text-[13px] leading-relaxed">
              {WHOAMI.map((line, i) => {
                const promptAt = i * 2;
                const outAt = i * 2 + 1;
                return (
                  <div key={line.prompt}>
                    {step >= promptAt && (
                      <p className="text-phos">
                        <span className="text-dim">guest@wasm</span>
                        <span className="text-line2">:~$ </span>
                        {line.prompt.slice(2)}
                      </p>
                    )}
                    {step >= outAt && <p className="rise pl-2 text-fog">{line.out}</p>}
                  </div>
                );
              })}
              {step >= WHOAMI.length * 2 && <span className="blink inline-block h-4 w-2.5 translate-y-0.5 bg-phos" />}
            </div>
          </div>

          <h1 className="font-display leading-[0.85] text-phos">
            <span className="glitch block text-[clamp(3.2rem,9vw,6rem)]" data-text="KAI">
              KAI
            </span>
            <span className="glitch block text-[clamp(3.2rem,9vw,6rem)]" data-text="NAKAMURA">
              NAKAMURA
            </span>
          </h1>

          <p className="mt-5 text-sm tracking-[0.18em] text-ice sm:text-base">
            <Scramble text={PROFILE.role} />
          </p>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-fog sm:text-[15px]">{PROFILE.tagline}</p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#builds"
              className="group inline-flex items-center gap-3 border border-phos px-5 py-3 font-display text-xl tracking-wide text-phos transition-colors duration-200 hover:bg-phos hover:text-void"
            >
              [ RUN ./BUILDS ]
              <span className="transition-transform duration-200 group-hover:translate-x-1.5">▸</span>
            </a>
            <a
              href="#tty"
              className="inline-flex items-center gap-3 border border-line2 px-5 py-3 font-display text-xl tracking-wide text-fog transition-colors duration-200 hover:border-ice hover:text-ice"
            >
              [ OPEN TTY ]
            </a>
          </div>
        </div>

        <div className="lg:pt-16">
          <CoreMonitor core={core} />
        </div>
      </div>

      <div className="mt-20 flex items-center gap-4 text-[11px] tracking-[0.3em] text-dim">
        <span className="blink text-phos">▼</span> SCROLL TO DECRYPT
        <span className="h-px flex-1 bg-line" />
        <span>SIG:0x4F9F2CAB</span>
      </div>
    </section>
  );
}
