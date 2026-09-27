import { useEffect, useRef, useState } from "react";
import { PROFILE, PROJECTS, SKILL_GROUPS, SYSINFO_LOGO, TERMINAL_MOTD } from "../data/profile";
import { runRace } from "../lib/bench";
import { peekCore } from "../lib/wasm";
import { currentFeed } from "../lib/posts";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import type { RainMode } from "./MatrixRain";

type Tone = "in" | "out" | "ok" | "err" | "dim" | "ice" | "amber";
interface Entry {
  text: string;
  tone: Tone;
}

const TONE_CLASS: Record<Tone, string> = {
  in: "text-phos-soft",
  out: "text-fog",
  ok: "text-phos",
  err: "text-amber",
  dim: "text-dim",
  ice: "text-ice",
  amber: "text-amber",
};

const HELP: Entry[] = [
  { text: "available commands:", tone: "out" },
  { text: "  about               who runs this machine", tone: "dim" },
  { text: "  skills              diagnostic summary", tone: "dim" },
  { text: "  projects            list case files", tone: "dim" },
  { text: "  bench               race JavaScript vs WebAssembly", tone: "dim" },
  { text: "  sysinfo             core + machine readout", tone: "dim" },
  { text: "  matrix <zen|on|off> control the rain daemon", tone: "dim" },
  { text: "  logs                list decrypted entries", tone: "dim" },
  { text: "  open <slug>         decrypt a specific log", tone: "dim" },
  { text: "  contact             uplink channels", tone: "dim" },
  { text: "  pill                choose", tone: "dim" },
  { text: "  whoami · date · uname · echo · sudo · clear", tone: "dim" },
];

export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>(() =>
    TERMINAL_MOTD.map((t, i) => ({ text: t, tone: (i === 0 ? "dim" : "ok") as Tone }))
  );
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  const say = (lines: Entry[]) => setEntries((prev) => [...prev, ...lines]);

  const exec = async (raw: string) => {
    const line = raw.trim();
    say([{ text: `guest@wasm:~$ ${raw}`, tone: "in" }]);
    if (!line) return;
    setHistory((h) => [...h, line]);
    setHistIdx(-1);

    const [cmd, ...args] = line.split(/\s+/);

    switch (cmd.toLowerCase()) {
      case "help":
        say(HELP);
        break;
      case "clear":
        setEntries([]);
        break;
      case "whoami":
        say([
          { text: "guest — you, the operator.", tone: "out" },
          { text: `(the machine belongs to ${PROFILE.name.toLowerCase()} · handle ${PROFILE.handle})`, tone: "dim" },
        ]);
        break;
      case "about":
        say([
          ...PROFILE.bio.map((p, i) => ({ text: p, tone: (i === 0 ? "out" : "dim") as Tone })),
          { text: `status: ${PROFILE.status}`, tone: "ok" },
        ]);
        break;
      case "skills":
        say(
          SKILL_GROUPS.flatMap((g) => [
            { text: `[${g.group.toLowerCase()}]`, tone: "ice" as Tone },
            ...g.skills.map((s) => ({
              text: `  ${s.name.padEnd(14, " ")} ${String(s.pct).padStart(3)}%  [${s.grade}]`,
              tone: "dim" as Tone,
            })),
          ])
        );
        break;
      case "projects":
      case "builds":
      case "ls":
        say([
          ...PROJECTS.map((p) => ({
            text: `  ${p.id}  ${p.name.padEnd(14)} ${p.year}  ·  ${p.status.toLowerCase()}  ·  ${p.tags.join("/")}`,
            tone: "out" as Tone,
          })),
          { text: "decrypt a file from the BUILDS section above ▲", tone: "dim" },
        ]);
        break;
      case "bench": {
        if (busy) break;
        setBusy(true);
        say([
          { text: "workload: fib(30) recursive · 3 runs per engine · median", tone: "dim" },
          { text: "racing… keep this tab visible", tone: "amber" },
        ]);
        const r = await runRace(30, 3);
        say([
          { text: `  javascript   ${r.js.ms.toFixed(2).padStart(9)} ms`, tone: "err" },
          { text: `  webassembly  ${r.wasm.ms.toFixed(2).padStart(9)} ms   ← core.wasm, 229 B`, tone: "ok" },
          { text: `▲ wasm ×${r.speedup.toFixed(1)} faster · outputs agree: ${r.wasm.value.toLocaleString()} ✓`, tone: "ok" },
        ]);
        setBusy(false);
        break;
      }
      case "sysinfo":
      case "neofetch": {
        const core = peekCore();
        say([
          ...SYSINFO_LOGO.map((l) => ({ text: l, tone: "ice" as Tone })),
          { text: "", tone: "out" },
          {
            text: `  core      v${core?.version ?? "…"} · ${core?.moduleBytes ?? "…"} B · instantiated in ${
              core ? core.instantiateMs.toFixed(1) : "…"
            } ms`,
            tone: "ok",
          },
          { text: `  exports   ${core?.exports.join(", ") ?? "…"}`, tone: "dim" },
          { text: `  memory    ${core ? core.memoryBytes.toLocaleString() : "…"} B linear`, tone: "dim" },
          { text: `  invocations since boot: ${core?.stats.calls.toLocaleString() ?? "…"}`, tone: "dim" },
          { text: `  host      ${navigator.platform || "web"} · ${navigator.language}`, tone: "dim" },
        ]);
        break;
      }
      case "matrix": {
        const arg = (args[0] ?? "").toLowerCase();
        const mode: RainMode = arg === "zen" ? "zen" : arg === "off" ? "off" : "ambient";
        window.dispatchEvent(new CustomEvent<RainMode>("matrix-mode", { detail: mode }));
        say([
          {
            text:
              mode === "zen"
                ? "rain daemon → ZEN: faster fall, slower fade. breathe."
                : mode === "off"
                  ? "rain daemon → killed. (type 'matrix on' to resurrect)"
                  : "rain daemon → ambient. welcome back.",
            tone: "ok",
          },
        ]);
        break;
      }
      case "logs":
      case "posts": {
        const feed = currentFeed();
        say([
          { text: `source: ${feed.source === "cms" ? "django-cms (live)" : "bundled markdown"}`, tone: "dim" },
          ...feed.posts.map((p, i) => ({
            text: `  0x${String(feed.posts.length - i).padStart(2, "0")}  ${p.slug.padEnd(14)} ${p.date}  ·  ${p.title}`,
            tone: "out" as Tone,
          })),
          { text: "type 'open <slug>' to decrypt one — e.g. open rain-entropy", tone: "dim" },
        ]);
        break;
      }
      case "open": {
        const feed = currentFeed();
        const slug = args[0];
        const target = slug ? feed.posts.find((p) => p.slug === slug) : undefined;
        if (target) {
          window.location.hash = `#/log/${target.slug}`;
          say([{ text: `decrypting "${target.title}" …`, tone: "ok" }]);
        } else {
          say([
            { text: `log not found: ${slug ?? "(none)"}`, tone: "err" },
            { text: `available: ${feed.posts.map((p) => p.slug).join(", ")}`, tone: "dim" },
          ]);
        }
        break;
      }
      case "contact":
      case "uplink":
        say([
          { text: `  email    ${PROFILE.email}`, tone: "out" },
          { text: `  github   ${PROFILE.github}`, tone: "out" },
          { text: `  signal   ${PROFILE.signal}`, tone: "out" },
          { text: "channels open — see UPLINK below ▼", tone: "dim" },
        ]);
        break;
      case "pill":
        say([
          { text: "You take the red pill — you stay in Wonderland,", tone: "amber" },
          { text: "and I show you how deep the borrow checker goes.", tone: "amber" },
        ]);
        break;
      case "date":
        say([{ text: new Date().toString(), tone: "out" }]);
        break;
      case "uname":
        say([{ text: "WASM/JS hybrid · browser kernel · wasm32 · phosphor", tone: "out" }]);
        break;
      case "echo":
        say([{ text: args.join(" ") || "", tone: "out" }]);
        break;
      case "sudo":
        say([
          { text: `${PROFILE.handle} is not in the sudoers file.`, tone: "err" },
          { text: "This incident will be reported to the machines.", tone: "dim" },
        ]);
        break;
      default:
        say([{ text: `command not found: ${cmd} — try 'help'`, tone: "err" }]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      void exec(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const idx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(history[idx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx < 0) return;
      const idx = histIdx + 1;
      if (idx >= history.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(history[idx]);
      }
    }
  };

  return (
    <section id="tty" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeading index="05" title="TERMINAL" cmd="ssh guest@nakamura.dev -t /bin/tty1" />

      <Reveal>
        <div className="border border-line bg-panel/90 shadow-[0_0_60px_rgba(0,255,65,0.05)]">
          <div className="flex items-center gap-2 border-b border-line bg-panel2 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-line2" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-phos" />
            <span className="ml-3 text-[11px] tracking-wider text-dim">tty1 — guest@wasm · this terminal is real, type in it</span>
          </div>

          <div
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            className="h-[420px] cursor-text overflow-y-auto px-4 py-4 text-[13px] leading-relaxed"
          >
            {entries.map((e, i) => (
              <p key={i} className={`whitespace-pre-wrap break-words ${TONE_CLASS[e.tone]}`}>
                {e.text || "\u00A0"}
              </p>
            ))}
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-phos">
                guest@wasm<span className="text-dim">:~$</span>
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                className="min-w-0 flex-1 bg-transparent text-fog caret-phos outline-none"
                spellCheck={false}
                autoComplete="off"
                aria-label="terminal input"
              />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <p className="mt-4 text-[11px] tracking-wider text-dim">
          <span className="text-phos">tip:</span> try <span className="text-phos-soft">'bench'</span> ·{" "}
          <span className="text-phos-soft">'matrix zen'</span> · <span className="text-phos-soft">'sysinfo'</span> ·{" "}
          <span className="text-phos-soft">'pill'</span> — ↑/↓ recalls history
        </p>
      </Reveal>
    </section>
  );
}
