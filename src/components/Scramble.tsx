import { useEffect, useRef, useState } from "react";
import { getCore, peekCore } from "../lib/wasm";
import { glyphFrom } from "../lib/glyphs";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

interface ScrambleProps {
  text: string;
  className?: string;
  /** start when element scrolls into view (default true) */
  onView?: boolean;
  delay?: number;
}

/**
 * Decodes `text` out of glyph noise. Unresolved characters are picked by
 * the WASM fnv1a core (hash of text+index+frame), so the "noise" is
 * deterministic — the same core that hashes strings in cipher.pad.
 */
export function Scramble({ text, className = "", onView = true, delay = 0 }: ScrambleProps) {
  const reduced = usePrefersReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      setOut(text);
      return;
    }
    getCore(); // warm the core so frames never wait on it

    let raf = 0;
    let frame = 0;

    const run = () => {
      const start = () => {
        if (started.current) return;
        started.current = true;
        const tick = () => {
          frame++;
          const locked = Math.floor(frame / 2.2);
          if (locked >= text.length) {
            setOut(text);
            return;
          }
          const core = peekCore();
          let next = text.slice(0, locked);
          for (let i = locked; i < text.length; i++) {
            const ch = text[i];
            if (ch === " ") {
              next += " ";
              continue;
            }
            const seed = core ? core.fnv1a(`${text}:${i}:${frame}`) : (i * 2654435761 + frame * 97) >>> 0;
            next += glyphFrom(seed);
          }
          setOut(next);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      };

      if (!onView) {
        setTimeout(start, delay);
        return;
      }
      const el = ref.current;
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect();
            setTimeout(start, delay);
          }
        },
        { threshold: 0.4 }
      );
      io.observe(el);
    };

    run();
    return () => cancelAnimationFrame(raf);
  }, [text, reduced, onView, delay]);

  return (
    <span ref={ref} className={className} aria-label={text}>
      {out || "\u00A0"}
    </span>
  );
}
