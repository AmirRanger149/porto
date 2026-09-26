import { useState } from "react";
import { PROFILE } from "../data/profile";
import { copyText } from "../lib/clipboard";
import { useCore } from "../hooks/useCore";
import { Reveal } from "./Reveal";
import { Scramble } from "./Scramble";
import { SectionHeading } from "./SectionHeading";

function Channel({
  label,
  value,
  href,
  delay,
}: {
  label: string;
  value: string;
  href?: string;
  delay: number;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Reveal delay={delay}>
      <div className="row-scan group flex items-center gap-4 border-b border-line/70 px-4 py-4 last:border-0 sm:px-5">
        <span className="w-20 shrink-0 text-[10px] tracking-[0.25em] text-dim">{label}</span>
        {href ? (
          <a href={href} className="min-w-0 flex-1 truncate text-sm text-fog transition-colors hover:text-phos">
            {value}
          </a>
        ) : (
          <span className="min-w-0 flex-1 truncate text-sm text-fog">{value}</span>
        )}
        <button
          onClick={async () => {
            const ok = await copyText(value);
            setCopied(ok);
            setTimeout(() => setCopied(false), 1600);
          }}
          className={`shrink-0 border px-3 py-1 text-[10px] tracking-[0.2em] transition-all ${
            copied
              ? "border-phos bg-phos text-void"
              : "border-line2 text-dim hover:border-phos hover:text-phos"
          }`}
        >
          {copied ? "✓ COPIED" : "COPY"}
        </button>
      </div>
    </Reveal>
  );
}

export function Uplink() {
  const core = useCore();

  return (
    <section id="uplink" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 pb-10 pt-24 sm:px-6">
      <SectionHeading index="05" title="UPLINK" cmd="./connect --secure --all-channels" />

      <div className="grid gap-12 lg:grid-cols-[6fr_5fr] lg:gap-16">
        <Reveal>
          <div>
            <h3 className="font-display leading-[0.9] text-phos">
              <span className="block text-[clamp(2.6rem,6vw,4.5rem)]">
                <Scramble text="LET'S BUILD" />
              </span>
              <span className="block text-[clamp(2.6rem,6vw,4.5rem)]">
                <Scramble text="SOMETHING" delay={200} />
              </span>
              <span className="glitch block text-[clamp(2.6rem,6vw,4.5rem)] text-ice" data-text="IMPOSSIBLE.">
                IMPOSSIBLE.
              </span>
            </h3>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-fog">
              Audio engines, renderers, encrypted cores, terminals with opinions — if it needs a hot path and a
              browser, my inbox is open. Freelance missions and full-time signal both accepted.
            </p>
            <p className="mt-8 flex items-center gap-3 text-[11px] tracking-[0.25em]">
              <span className="led inline-block h-2 w-2 rounded-full bg-phos text-phos" />
              <span className="text-phos">CHANNEL OPEN</span>
              <span className="text-dim">— RESPONSE &lt; 24H, UTC+9</span>
            </p>
          </div>
        </Reveal>

        <div>
          <Reveal delay={100}>
            <div className="border border-line bg-panel/80">
              <div className="flex items-center justify-between border-b border-line bg-panel2 px-4 py-2.5">
                <span className="font-display text-lg tracking-wider text-phos">CHANNELS</span>
                <span className="text-[10px] tracking-[0.2em] text-dim">E2E · NO TRACKERS</span>
              </div>
              <Channel label="EMAIL" value={PROFILE.email} href={`mailto:${PROFILE.email}`} delay={140} />
              <Channel label="GITHUB" value={PROFILE.github} href={`https://${PROFILE.github}`} delay={200} />
              <Channel label="SIGNAL" value={PROFILE.signal} delay={260} />
              <Channel label="PGP" value="4F9F 2CAB 00FF 4100 65ED" delay={320} />
            </div>
          </Reveal>
          <Reveal delay={380}>
            <p className="mt-4 text-[11px] leading-relaxed text-dim">
              <span className="text-phos">$</span> prefer async? email wins. prefer weird? the terminal above takes
              messages via <span className="text-phos-soft">'echo …'</span> (it doesn't store them — but it listens).
            </p>
          </Reveal>
        </div>
      </div>

      <footer className="mt-24 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[11px] tracking-wider text-dim sm:flex-row sm:items-center">
        <p>
          © 2026 {PROFILE.name} · hand-built, no template was harmed
        </p>
        <p>
          core v{core?.version ?? "1.0.3"} · {core?.moduleBytes ?? 229} B wasm · 0 cookies · 0 trackers
        </p>
        <a href="#top" className="text-phos transition-colors hover:text-phos-soft">
          [ ▲ REBOOT TO TOP ]
        </a>
      </footer>
    </section>
  );
}
