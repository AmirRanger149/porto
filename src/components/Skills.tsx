import { SKILL_GROUPS, type SkillGroup } from "../data/profile";
import { useInView } from "../hooks/useInView";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const CELLS = 22;

const GRADE_COLOR: Record<"S" | "A" | "B", string> = {
  S: "#00ff41",
  A: "#5ee8ff",
  B: "#ffc857",
};

function GroupPanel({ group, delay }: { group: SkillGroup; delay: number }) {
  const [ref, inView] = useInView<HTMLDivElement>(0.25);

  return (
    <Reveal delay={delay}>
      <div ref={ref} className="border border-line bg-panel/80 transition-colors hover:border-line2">
        <div className="border-b border-line bg-panel2 px-4 py-3">
          <h3 className="font-display text-xl tracking-wider text-phos">{group.group}</h3>
          <p className="text-[10px] tracking-[0.2em] text-dim">{group.note}</p>
        </div>
        <div className="space-y-4 px-4 py-4">
          {group.skills.map((s) => {
            const on = Math.round((s.pct / 100) * CELLS);
            const color = GRADE_COLOR[s.grade];
            return (
              <div key={s.name}>
                <div className="flex items-baseline justify-between text-[11px] tracking-wider">
                  <span className="text-fog">{s.name}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-display text-base leading-none" style={{ color }}>
                      {s.grade}
                    </span>
                    <span className="text-dim">{s.pct}%</span>
                  </span>
                </div>
                <div className="mt-1.5 flex gap-[3px]" role="img" aria-label={`${s.name} ${s.pct}%`}>
                  {Array.from({ length: CELLS }, (_, i) => (
                    <span
                      key={i}
                      className="seg h-3 flex-1"
                      style={{
                        transitionDelay: `${i * 24}ms`,
                        backgroundColor: inView && i < on ? color : "rgba(22,56,35,0.35)",
                        boxShadow: inView && i < on ? `0 0 7px ${color}44` : "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}

const READOUTS: [string, string][] = [
  ["KERNEL", "wasm32 · browser-hosted"],
  ["FLAGS", "+simd · +sign-ext · +bulk-memory"],
  ["ALLOCATOR", "arena — zero malloc on hot paths"],
  ["PANIC", "abort (there is nowhere to unwind)"],
];

export function Skills() {
  return (
    <section id="systems" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeading index="03" title="SYSTEMS" cmd="./diagnose --all --verbose" />

      <Reveal>
        <div className="mb-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {READOUTS.map(([k, v]) => (
            <div key={k} className="bg-panel px-4 py-3 transition-colors hover:bg-panel2">
              <p className="text-[9px] tracking-[0.25em] text-dim">{k}</p>
              <p className="mt-1 text-[12px] text-fog">{v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {SKILL_GROUPS.map((g, i) => (
          <GroupPanel key={g.group} group={g} delay={i * 90} />
        ))}
      </div>

      <Reveal delay={150}>
        <p className="mt-8 text-[11px] leading-relaxed text-dim">
          <span className="text-phos">$</span> diagnostics complete — 12 modules probed, 0 degraded. grades:{" "}
          <span className="text-phos">S</span> = ships at 3am and holds, <span className="text-ice">A</span> = production
          fluent, <span className="text-amber">B</span> = dangerous with docs open.
        </p>
      </Reveal>
    </section>
  );
}
