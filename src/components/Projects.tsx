import { useState } from "react";
import { PROJECTS, type Project } from "../data/profile";
import { copyText } from "../lib/clipboard";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STATUS_TONE: Record<Project["status"], string> = {
  SHIPPED: "border-phos/50 text-phos",
  ACTIVE: "border-ice/50 text-ice",
  "R&D": "border-amber/50 text-amber",
};

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        const ok = await copyText(text);
        setCopied(ok);
        setTimeout(() => setCopied(false), 1600);
      }}
      className={`shrink-0 border px-3 py-1 text-[10px] tracking-[0.2em] transition-colors ${
        copied ? "border-phos bg-phos text-void" : "border-line2 text-dim hover:border-phos hover:text-phos"
      }`}
    >
      {copied ? "✓ COPIED" : "COPY"}
    </button>
  );
}

function CaseFile({ p, open, onToggle }: { p: Project; open: boolean; onToggle: () => void }) {
  return (
    <Reveal as="li" className="border-b border-line first:border-t">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className={`row-scan group grid w-full grid-cols-[2.6rem_1fr_auto] items-center gap-3 px-3 py-4 text-left transition-colors sm:grid-cols-[3.2rem_1fr_auto_auto_5.5rem] sm:px-5 ${
          open ? "bg-panel2/70" : "hover:bg-panel/80"
        }`}
      >
        <span className="font-display text-2xl text-line2 transition-colors group-hover:text-dim sm:text-3xl">
          {p.id}
        </span>
        <span>
          <span
            className={`font-display text-2xl leading-tight transition-colors sm:text-3xl ${
              open ? "text-phos" : "text-fog group-hover:text-phos"
            }`}
          >
            {p.name}
          </span>
          <span className="mt-1 block text-[10px] tracking-[0.2em] text-dim md:hidden">{p.tags.join(" · ")}</span>
        </span>
        <span className="hidden items-center gap-1.5 md:flex">
          {p.tags.map((t) => (
            <span key={t} className="border border-line px-1.5 py-0.5 text-[9px] tracking-widest text-dim">
              {t}
            </span>
          ))}
        </span>
        <span className="hidden text-xs text-dim sm:inline">{p.year}</span>
        <span className="flex items-center justify-end gap-3">
          <span className={`hidden border px-2 py-0.5 text-[9px] tracking-[0.2em] sm:inline ${STATUS_TONE[p.status]}`}>
            {p.status}
          </span>
          <span
            className={`font-display text-xl text-dim transition-transform duration-300 group-hover:text-phos ${
              open ? "rotate-90 text-phos" : ""
            }`}
          >
            ▸
          </span>
        </span>
      </button>

      {open && (
        <div className="rise border-l-2 border-phos bg-panel/60 px-5 py-5 sm:px-8">
          <p className="max-w-3xl text-sm leading-relaxed text-fog">{p.desc}</p>
          <p className="mt-3 text-[12px] text-phos">
            <span className="mr-2 text-dim">▸</span>
            {p.metric}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <span key={s} className="border border-line bg-void/60 px-2 py-0.5 text-[10px] tracking-wider text-phos-soft">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <code className="overflow-x-auto whitespace-nowrap border border-line bg-void px-3 py-1.5 text-[11px] text-fog">
              <span className="text-dim">$ </span>git clone {p.repo}
            </code>
            <CopyBtn text={`git clone ${p.repo}`} />
          </div>
        </div>
      )}
    </Reveal>
  );
}

export function Projects() {
  const [open, setOpen] = useState<string | null>("01");

  return (
    <section id="builds" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeading index="02" title="BUILDS" cmd="ls -la ~/builds --sort=year" />

      <Reveal>
        <p className="mb-6 hidden text-[10px] tracking-[0.25em] text-dim sm:block">
          6 CASE FILES · CLICK TO DECRYPT · EVERY HOT PATH COMPILED
        </p>
      </Reveal>

      <ul>
        {PROJECTS.map((p) => (
          <CaseFile
            key={p.id}
            p={p}
            open={open === p.id}
            onToggle={() => setOpen(open === p.id ? null : p.id)}
          />
        ))}
      </ul>
    </section>
  );
}
