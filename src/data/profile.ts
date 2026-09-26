export const PROFILE = {
  name: "KAI NAKAMURA",
  handle: "k4i",
  role: "SYSTEMS ENGINEER // CREATIVE TECHNOLOGIST",
  tagline:
    "I ship native-speed systems to the browser — compiled from Rust, running as WebAssembly, glowing like it's 1999.",
  location: "TOKYO — UTC+9",
  status: "OPEN TO MISSIONS",
  email: "kai@nakamura.dev",
  github: "github.com/kainakamura",
  signal: "@k4i.07",
  bio: [
    "Seven years ago I wrote my first line of Rust to make a synthesizer that wouldn't crackle. The browser said no. I compiled it to WebAssembly anyway — and it hasn't crackled since.",
    "I live in the gap between the metal and the DOM: audio engines, renderers, crypto cores, and the occasional terminal that thinks it's alive. If it has a hot path, I want it in a .wasm module.",
    "Off the clock: mechanical keyboards, CRT monitors, and teaching machines to rain green.",
  ],
  facts: [
    ["BASE", "Tokyo / remote, UTC±4"],
    ["FOCUS", "Rust → WASM engines for the web"],
    ["CURRENTLY", "Staff engineer @ Signalframe"],
    ["SIDE QUEST", "termcraft — TUI kit for browsers"],
  ],
  counters: [
    { label: "YEARS IN THE GRID", value: 7, suffix: "+", decimals: 0 },
    { label: "SYSTEMS SHIPPED", value: 42, suffix: "", decimals: 0 },
    { label: "CRATES PUBLISHED", value: 6, suffix: "", decimals: 0 },
    { label: "WASM BYTES SERVED", value: 1.8, suffix: "MB", decimals: 1 },
  ] as { label: string; value: number; suffix: string; decimals: number }[],
};

export interface Project {
  id: string;
  name: string;
  year: string;
  status: "SHIPPED" | "ACTIVE" | "R&D";
  tags: string[];
  desc: string;
  metric: string;
  stack: string[];
  repo: string;
}

export const PROJECTS: Project[] = [
  {
    id: "01",
    name: "WASM-SYNTH",
    year: "2025",
    status: "ACTIVE",
    tags: ["RUST", "WASM", "WEBAUDIO"],
    desc: "A 16-voice polyphonic synthesizer with the entire DSP graph compiled from Rust to WebAssembly and scheduled from an AudioWorklet. Zero allocations on the render thread, wavetable morphing, and a sequencer that survives tab throttling.",
    metric: "3.1ms render callback @ 48kHz — zero underruns in 6 months of live use",
    stack: ["Rust", "wasm-bindgen", "Web Audio API", "AudioWorklet", "React"],
    repo: "ssh://git@nakamura.dev/~/wasm-synth",
  },
  {
    id: "02",
    name: "RAYCASTER.95",
    year: "2024",
    status: "SHIPPED",
    tags: ["RUST", "WASM", "CANVAS"],
    desc: "A Wolfenstein-style raycaster with the trace loop in WASM and a 320×200 framebuffer blitted to canvas. DDA traversal, textured walls, and a CRT shader pass — because authenticity matters.",
    metric: "60fps locked on a 2014 laptop — 1.9M rays/sec",
    stack: ["Rust", "no_std", "Canvas 2D", "TypeScript"],
    repo: "ssh://git@nakamura.dev/~/raycaster95",
  },
  {
    id: "03",
    name: "CIPHER.PAD",
    year: "2024",
    status: "SHIPPED",
    tags: ["RUST", "WASM", "CRYPTO"],
    desc: "End-to-end encrypted notes. XChaCha20-Poly1305 and Argon2id run inside a WASM sandbox; keys never touch JavaScript memory. The server sees ciphertext and nothing else.",
    metric: "0 bytes of plaintext observed outside the wasm linear memory",
    stack: ["Rust", "chacha20poly1305", "argon2", "IndexedDB", "SvelteKit"],
    repo: "ssh://git@nakamura.dev/~/cipherpad",
  },
  {
    id: "04",
    name: "PACKET//STORM",
    year: "2023",
    status: "SHIPPED",
    tags: ["TYPESCRIPT", "WEBGL", "RUST"],
    desc: "Realtime network telemetry visualizer — 100k packets rendered as a particle storm in WebGL, with the aggregation pass in WASM. Built for a NOC dashboard that needed to feel like mission control.",
    metric: "100k particles @ 60fps, aggregation pass 11× faster than JS",
    stack: ["TypeScript", "WebGL2", "GLSL", "Rust", "WebSockets"],
    repo: "ssh://git@nakamura.dev/~/packet-storm",
  },
  {
    id: "05",
    name: "TERMCRAFT",
    year: "2023",
    status: "ACTIVE",
    tags: ["RUST", "OSS", "TUI"],
    desc: "A rataturo-inspired TUI component kit that renders into the DOM: windows, panes, tables, and a focus system — all styled like a phosphor terminal. Open source and quietly used by people who should know better.",
    metric: "1.4k★ on GitHub · 38k downloads · 12 contributors",
    stack: ["Rust", "WASM", "TypeScript", "CSS"],
    repo: "ssh://git@nakamura.dev/~/termcraft",
  },
  {
    id: "06",
    name: "GLITCHGRID",
    year: "2022",
    status: "R&D",
    tags: ["RUST", "WASM", "GENERATIVE"],
    desc: "Procedural glitch-art plotter. A wasm xorshift field drives cell decay across a 128×128 grid; frames export as print-ready SVG. The entropy for this very site's rain comes from the same core.",
    metric: "2²⁴ unique frames before the PRNG repeats",
    stack: ["Rust", "WASM", "SVG", "Canvas"],
    repo: "ssh://git@nakamura.dev/~/glitchgrid",
  },
];

export interface SkillGroup {
  group: string;
  note: string;
  skills: { name: string; pct: number; grade: "S" | "A" | "B" }[];
}

export const SKILL_GROUPS: SkillGroup[] = [
  {
    group: "CORE LANGUAGES",
    note: "what the core is written in",
    skills: [
      { name: "RUST", pct: 92, grade: "S" },
      { name: "TYPESCRIPT", pct: 88, grade: "A" },
      { name: "C / C++", pct: 72, grade: "A" },
      { name: "PYTHON", pct: 64, grade: "B" },
    ],
  },
  {
    group: "RUNTIME & SYSTEMS",
    note: "where the core executes",
    skills: [
      { name: "WEBASSEMBLY", pct: 90, grade: "S" },
      { name: "NODE / BUN", pct: 84, grade: "A" },
      { name: "LINUX / SHELL", pct: 86, grade: "A" },
      { name: "WASI", pct: 70, grade: "B" },
    ],
  },
  {
    group: "GRAPHICS & SIGNAL",
    note: "what the core feeds",
    skills: [
      { name: "WEBGL / GLSL", pct: 76, grade: "A" },
      { name: "CANVAS 2D", pct: 88, grade: "A" },
      { name: "WEB AUDIO", pct: 82, grade: "A" },
      { name: "SVG / PLOTTING", pct: 68, grade: "B" },
    ],
  },
];

export const TICKER_ITEMS = [
  "RUST",
  "WEBASSEMBLY",
  "TYPESCRIPT",
  "NO_STD",
  "WEBGL",
  "GLSL",
  "WEB AUDIO",
  "WASI",
  "AUDIOWORKLET",
  "LINUX",
  "XCHACHA20",
  "RAYCASTING",
  "TUI",
  "PHOSPHOR",
];

export const TERMINAL_MOTD = [
  "WASMBIOS terminal — tty1 (guest session)",
  "core online · type 'help' to list commands",
];

export const SYSINFO_LOGO = [
  " ██╗  ██╗ █████╗ ██╗",
  " ██║ ██╔╝██╔══██╗██║",
  " █████╔╝ ███████║██║",
  " ██╔═██╗ ██╔══██║██║",
  " ██║  ██╗██║  ██║██║",
  " ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝",
];
