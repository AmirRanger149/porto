import { useEffect, useState } from "react";
import { useCore } from "../hooks/useCore";

const NAV = [
  { num: "01", label: "about", href: "#about" },
  { num: "02", label: "builds", href: "#builds" },
  { num: "03", label: "systems", href: "#systems" },
  { num: "04", label: "tty", href: "#tty" },
  { num: "05", label: "uplink", href: "#uplink" },
];

function fmtUptime(s: number): string {
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

export function Header() {
  const core = useCore();
  const [up, setUp] = useState(0);

  useEffect(() => {
    const iv = setInterval(() => setUp((u) => u + 1), 1000);
    return () => clearInterval(iv);
  }, []);

  const status = core?.status ?? "booting";
  const ledClass =
    status === "online" ? "bg-phos text-phos" : status === "fallback" ? "bg-amber text-amber" : "bg-dim text-dim";
  const statusLabel =
    status === "online" ? "CORE:ONLINE" : status === "fallback" ? "CORE:JS-MIRROR" : "CORE:BOOTING";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-line bg-void/95">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="group flex shrink-0 items-center gap-2 text-sm text-fog">
          <span className="text-phos transition-colors group-hover:text-phos-soft">
            k4i@wasm<span className="text-dim">:</span>~<span className="text-dim">$</span>
          </span>
          <span className="blink font-display text-lg text-phos">▊</span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="group px-3 py-1.5 text-[13px] text-dim transition-colors hover:text-phos"
            >
              <span className="mr-1 inline-block w-0 overflow-hidden text-phos opacity-0 transition-all duration-200 group-hover:w-3 group-hover:opacity-100">
                &gt;
              </span>
              ./{n.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 text-[11px] tracking-wider">
          <span className={`led inline-block h-2 w-2 rounded-full ${ledClass}`} />
          <span className={status === "online" ? "text-phos" : status === "fallback" ? "text-amber" : "text-dim"}>
            {statusLabel}
          </span>
          {core && <span className="hidden text-dim lg:inline">v{core.version}</span>}
          <span className="hidden border-l border-line pl-3 text-dim sm:inline">{fmtUptime(up)}</span>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-line px-4 py-2 md:hidden">
        {NAV.map((n) => (
          <a key={n.href} href={n.href} className="shrink-0 px-3 py-1 text-xs text-dim transition-colors hover:text-phos">
            ./{n.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
