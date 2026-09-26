import { useEffect, useRef, useState } from "react";
import { getCore, type CoreApi } from "../lib/wasm";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const pad = (s: string, n: number) => (s.length >= n ? s : s + " ".repeat(n - s.length));

function buildScript(core: CoreApi): string[] {
  const ok = core.status === "online" ? "OK" : "DEGRADED → JS MIRROR";
  const bytes = core.moduleBytes > 0 ? `${core.moduleBytes} B` : "—— B";
  const ms = core.instantiateMs > 0 ? `${core.instantiateMs.toFixed(1)} ms` : "—— ms";
  return [
    "WASMBIOS v3.7.1 — cold boot · phosphor display initialized",
    `${pad("mem check", 34)} 64 KiB linear memory ${pad("", 10)} OK`,
    `${pad(`mount /core.wasm [${bytes}]`, 34)} ${pad("", 12)} ${ok}`,
    `${pad(`WebAssembly.instantiate() · ${ms}`, 34)} ${pad("", 4)} OK`,
    `exports[5] → ${core.exports.join(" · ")}`,
    `${pad("rain daemon", 34)} columns seeded from xorshift32 ${pad("", 2)} OK`,
    `${pad("scramble fx", 34)} bound to fnv1a digest ${pad("", 11)} OK`,
    "portfolio.sys mounted → rendering guest session",
  ];
}

/**
 * Cold-boot sequence. Lines are typed while the real core.wasm is being
 * fetched + instantiated — the numbers it prints are the real numbers.
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);
  const doneRef = useRef(false);
  const skipRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const onSkip = () => {
      skipRef.current = true;
    };
    window.addEventListener("keydown", onSkip);
    window.addEventListener("pointerdown", onSkip);

    const finish = () => {
      if (doneRef.current || cancelled) return;
      doneRef.current = true;
      setFading(true);
      window.setTimeout(onDone, 480);
    };

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      const timeout = new Promise<null>((r) => setTimeout(() => r(null), 2600));
      const core = ((await Promise.race([getCore(), timeout])) ?? {
        status: "booting",
        moduleBytes: 0,
        instantiateMs: 0,
        exports: ["…"],
      }) as CoreApi;
      if (cancelled) return;

      const script = buildScript(core);

      if (reduced || skipRef.current) {
        setLines(script);
        setProgress(script.length);
        await sleep(reduced ? 500 : 350);
        finish();
        return;
      }

      for (let i = 0; i < script.length; i++) {
        if (cancelled) return;
        if (skipRef.current) {
          setLines(script);
          setProgress(script.length);
          await sleep(300);
          finish();
          return;
        }
        const line = script[i];
        let shown = "";
        setLines((prev) => [...prev, ""]);
        for (let c = 0; c <= line.length; c++) {
          if (cancelled) return;
          if (skipRef.current) break;
          shown = line.slice(0, c);
          const snapshot = shown;
          setLines((prev) => {
            const next = [...prev];
            next[next.length - 1] = snapshot;
            return next;
          });
          await sleep(line.startsWith("exports") ? 4 : 7);
        }
        const idx = i;
        setLines((prev) => {
          const next = [...prev];
          next[next.length - 1] = line;
          return next;
        });
        setProgress(idx + 1);
        await sleep(110);
      }
      await sleep(420);
      finish();
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("keydown", onSkip);
      window.removeEventListener("pointerdown", onSkip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = 8;
  const filled = Math.round((progress / total) * 26);

  return (
    <div
      className={`fixed inset-0 z-[80] bg-void transition-opacity duration-500 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-label="Booting portfolio"
    >
      <div className="mx-auto h-full max-w-3xl px-6 pt-16 sm:pt-24">
        <p className="mb-6 font-display text-2xl tracking-wider text-dim">
          ▚ NAKAMURA SYSTEMS — BOOT LOADER
        </p>
        <div className="min-h-[280px] space-y-1.5 text-[13px] leading-relaxed text-phos-soft sm:text-sm">
          {lines.map((line, i) => (
            <p key={i} className="whitespace-pre-wrap break-all">
              <span className="mr-2 select-none text-dim">{String(i).padStart(2, "0")}</span>
              {line}
            </p>
          ))}
        </div>
        <div className="mt-8 text-sm text-phos">
          <span className="text-dim">[</span>
          <span className="text-phos">{"▓".repeat(filled)}</span>
          <span className="text-line2">{"░".repeat(Math.max(0, 26 - filled))}</span>
          <span className="text-dim">]</span>
          <span className="ml-3 text-dim">
            {progress}/{total}
          </span>
        </div>
        <p className="mt-10 text-xs tracking-[0.25em] text-dim">
          <span className="blink text-phos">▊</span> CLICK OR PRESS ANY KEY TO SKIP
        </p>
      </div>
    </div>
  );
}
