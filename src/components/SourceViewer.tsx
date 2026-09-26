import { useState, type ReactNode } from "react";
import rustSource from "../wasm/core.rs?raw";
import watSource from "../wasm/core.wat?raw";

const TOKEN_RE =
  /(\/\/.*|;;.*)|("(?:[^"\\]|\\.)*")|(#\[.*?\]|#!\[.*?\])|\b(fn|pub|extern|let|mut|if|else|loop|block|local|param|result|call|br_if|br|return|use|crate|unsafe|mod|for|in|as|const|static|true|false|type|trait|module|memory|export|then|no_std|no_mangle|panic_handler)\b|\b(i32|u32|u8|i64|f32|f64|usize)\b|(\b0x[0-9a-fA-F][0-9a-fA-F_]*\b|\b\d[\d_]*\b)/g;

function highlight(line: string): ReactNode[] {
  const re = new RegExp(TOKEN_RE.source, "g");
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    let cls = "";
    if (m[1]) cls = "italic text-dim";
    else if (m[2]) cls = "text-amber";
    else if (m[3]) cls = "text-ice";
    else if (m[4]) cls = "text-phos";
    else if (m[5]) cls = "text-ice";
    else if (m[6]) cls = "text-phos-soft";
    out.push(
      <span key={k++} className={cls}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** The actual source of the module running this page — rs and wat, tabbed. */
export function SourceViewer() {
  const [tab, setTab] = useState<"rs" | "wat">("rs");
  const source = tab === "rs" ? rustSource : watSource;
  const lines = source.replace(/\n$/, "").split("\n");

  return (
    <div className="border border-line bg-panel">
      <div className="flex items-center border-b border-line bg-panel2">
        {(
          [
            ["rs", "core.rs", "RUST SOURCE"],
            ["wat", "core.wat", "WAT MODULE"],
          ] as const
        ).map(([key, file, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`group flex items-center gap-2 border-r border-line px-4 py-2.5 text-[11px] tracking-wider transition-colors ${
              tab === key ? "bg-panel text-phos" : "text-dim hover:text-fog"
            }`}
          >
            <span>{file}</span>
            <span className={`hidden sm:inline ${tab === key ? "text-line2" : "text-line2/60"}`}>{label}</span>
          </button>
        ))}
        <span className="ml-auto pr-4 text-[10px] tracking-[0.2em] text-line2">
          {lines.length}L · {tab === "rs" ? "semantics ≡ wasm" : "compiles → core.wasm"}
        </span>
      </div>
      <pre className="max-h-80 overflow-auto px-0 py-3 text-[11.5px] leading-[1.65]">
        {lines.map((line, i) => (
          <div key={i} className="flex px-3 transition-colors hover:bg-panel2/70">
            <span className="w-8 shrink-0 select-none pr-3 text-right text-line2">{i + 1}</span>
            <code className="whitespace-pre text-fog">{highlight(line)}</code>
          </div>
        ))}
      </pre>
    </div>
  );
}
