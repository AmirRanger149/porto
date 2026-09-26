import { useEffect, useRef, useState } from "react";
import { getCore, peekCore, type CoreApi } from "../lib/wasm";
import { glyphFrom } from "../lib/glyphs";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

export type RainMode = "ambient" | "zen" | "off";

/**
 * The rain. Column advancement and glyph selection are driven by the
 * WASM xorshift32 export — the same core shown in the source viewer.
 * A tiny LCG keeps the effect alive before the module resolves.
 */
export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = usePrefersReducedMotion();
  const [mode, setMode] = useState<RainMode>("ambient");

  useEffect(() => {
    const onMode = (e: Event) => {
      const detail = (e as CustomEvent<RainMode>).detail;
      if (detail === "ambient" || detail === "zen" || detail === "off") setMode(detail);
    };
    window.addEventListener("matrix-mode", onMode);
    return () => window.removeEventListener("matrix-mode", onMode);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mode === "off") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    getCore(); // warm it
    const FS = 15;
    let w = 0;
    let h = 0;
    let cols = 0;
    let y: Float32Array = new Float32Array(0);
    let speed: Float32Array = new Float32Array(0);
    let seed: Uint32Array = new Uint32Array(0);
    let raf = 0;
    let last = 0;

    const zen = mode === "zen";

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.ceil(w / FS);
      const prevCols = y.length;
      const ny = new Float32Array(cols);
      const ns = new Float32Array(cols);
      const nd = new Uint32Array(cols);
      for (let i = 0; i < cols; i++) {
        ny[i] = i < prevCols ? y[i] : -Math.random() * 40;
        ns[i] = i < prevCols ? speed[i] : 0.55 + Math.random() * 1.1;
        nd[i] = i < prevCols ? seed[i] : (Math.random() * 0xffffffff) >>> 0;
      }
      y = ny;
      speed = ns;
      seed = nd;
      ctx.fillStyle = "#030805";
      ctx.fillRect(0, 0, w, h);
    };

    const step = (core: CoreApi | null, bright: boolean) => {
      for (let i = 0; i < cols; i++) {
        const s = core
          ? core.xorshift(seed[i])
          : ((seed[i] = (Math.imul(seed[i], 1664525) + 1013904223) >>> 0));
        seed[i] = s;
        const row = Math.floor(y[i]);
        const x = i * FS;
        ctx.fillStyle = bright ? "#eafff0" : "#d8ffe3";
        ctx.fillText(glyphFrom(s), x, row * FS);
        if ((s & 7) === 0) {
          ctx.fillStyle = "rgba(0,255,65,0.45)";
          ctx.fillText(glyphFrom(s >>> 8), x, (row - 2) * FS);
        }
        y[i] += speed[i] * (zen ? 1.7 : 1);
        if (row * FS > h && (s & 15) === 0) {
          y[i] = -((s >>> 4) % 24);
          speed[i] = 0.55 + ((s & 0xffff) / 65535) * 1.1;
        }
      }
    };

    resize();
    ctx.font = `${FS}px "IBM Plex Mono", monospace`;
    window.addEventListener("resize", resize);

    if (reduced) {
      // one calm, static frame of glyphs — no loop
      ctx.fillStyle = "#030805";
      ctx.fillRect(0, 0, w, h);
      const core = peekCore();
      ctx.fillStyle = "rgba(0,255,65,0.28)";
      for (let i = 0; i < cols; i++) {
        const n = 4 + (i % 5);
        for (let k = 0; k < n; k++) {
          const s = core ? core.xorshift(seed[i] + k * 7919) : (i * 2654435761 + k * 97) >>> 0;
          ctx.fillText(glyphFrom(s), i * FS, ((k * 7 + i * 3) % Math.max(1, Math.floor(h / FS))) * FS);
        }
      }
      return () => window.removeEventListener("resize", resize);
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 34) return; // ~30fps is plenty for phosphor
      last = t;
      ctx.fillStyle = zen ? "rgba(3,8,5,0.1)" : "rgba(3,8,5,0.16)";
      ctx.fillRect(0, 0, w, h);
      step(peekCore(), zen);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [mode, reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 z-0 h-full w-full transition-opacity duration-700 ${
        mode === "off" ? "opacity-0" : mode === "zen" ? "opacity-55" : "opacity-30"
      }`}
    />
  );
}
