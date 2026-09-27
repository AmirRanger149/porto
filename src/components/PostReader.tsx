import { useEffect, useState } from "react";
import { usePosts } from "../hooks/usePosts";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { Scramble } from "./Scramble";

const BOOT_LINES = [
  (s: string) => `> fetch /api/posts/${s}/ ......... 200 OK`,
  () => "> xchacha20 handshake ............ verified",
  () => "> rendering phosphor ............. done",
];

/**
 * Full-screen decrypt overlay, hash-routed at #/log/<slug>.
 * Reads from the live feed (Django CMS → bundled fallback).
 * Back button, ESC, backdrop click and [CLOSE] all dismiss it.
 */
export function PostReader() {
  const reduced = usePrefersReducedMotion();
  const { posts } = usePosts();
  const [slug, setSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // hash → slug sync (also fires on back/forward)
  useEffect(() => {
    const sync = () => {
      const m = window.location.hash.match(/^#\/log\/(.+)$/);
      setSlug(m ? decodeURIComponent(m[1]) : null);
      if (m) setReady(reduced);
    };
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [reduced]);

  const post = slug ? (posts.find((p) => p.slug === slug) ?? null) : null;
  const postKey = post?.slug ?? "";

  // decrypt theatrics — quick boot lines, then the article
  useEffect(() => {
    if (!postKey || reduced) return;
    const t = setTimeout(() => setReady(true), 720);
    return () => clearTimeout(t);
  }, [postKey, reduced]);

  // ESC + scroll lock
  useEffect(() => {
    if (!postKey) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postKey]);

  const close = () => {
    history.pushState("", document.title, window.location.pathname + window.location.search);
    setSlug(null);
  };

  if (!post) return null;

  const idx = posts.findIndex((p) => p.slug === post.slug);
  const prev = posts[idx + 1];
  const next = posts[idx - 1];

  return (
    <div
      className="fixed inset-0 z-[75] overflow-y-auto bg-void/[0.985]"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label={post.title}
    >
      <div
        className="mx-auto min-h-full max-w-3xl border-x border-line bg-panel/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* title bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-panel2 px-4 py-3">
          <span className="flex items-center gap-3 text-[11px] tracking-wider text-dim">
            <span className="h-2 w-2 rounded-full bg-phos" />
            LOG_VIEWER —{" "}
            <span className="text-phos-soft">
              0x{String(posts.length - idx).padStart(2, "0")} {post.slug}
            </span>
          </span>
          <button
            onClick={close}
            className="border border-line2 px-3 py-1 text-[10px] tracking-[0.2em] text-dim transition-colors hover:border-phos hover:text-phos"
          >
            [ ESC ] ×
          </button>
        </div>

        <div className="px-5 py-10 sm:px-10">
          {!ready ? (
            <div className="min-h-[60vh] space-y-2 text-[13px] text-phos-soft">
              {BOOT_LINES.map((line, i) => (
                <p key={i} className="rise" style={{ animationDelay: `${i * 160}ms` }}>
                  {line(post.slug)}
                </p>
              ))}
              <p className="blink mt-4 inline-block h-4 w-2.5 bg-phos" />
            </div>
          ) : (
            <article className="rise">
              <p className="mb-4 text-[10px] tracking-[0.25em] text-dim">
                {post.date} · {post.tags.join(" / ")} · {post.readMin} MIN READ
              </p>
              <h1 className="font-display text-4xl leading-[0.95] text-phos sm:text-6xl">
                <Scramble text={post.title} onView={false} />
              </h1>
              <blockquote className="mt-6 border-l-2 border-ice pl-4 text-sm italic leading-relaxed text-fog">
                {post.abstract}
              </blockquote>
              <div className="post-body mt-8" dangerouslySetInnerHTML={{ __html: post.html }} />

              <div className="mt-14 border-t border-line pt-6">
                <p className="mb-5 text-center text-[10px] tracking-[0.35em] text-dim">— END OF LOG —</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {prev ? (
                    <a
                      href={`#/log/${prev.slug}`}
                      className="border border-line2 px-4 py-2 font-display text-lg text-fog transition-colors hover:border-phos hover:text-phos"
                    >
                      ◂ {prev.title}
                    </a>
                  ) : (
                    <span className="text-[10px] tracking-widest text-line2">OLDEST ENTRY</span>
                  )}
                  <button
                    onClick={close}
                    className="border border-phos px-4 py-2 font-display text-lg text-phos transition-colors hover:bg-phos hover:text-void"
                  >
                    [ CLOSE READER ]
                  </button>
                  {next ? (
                    <a
                      href={`#/log/${next.slug}`}
                      className="border border-line2 px-4 py-2 font-display text-lg text-fog transition-colors hover:border-ice hover:text-ice"
                    >
                      {next.title} ▸
                    </a>
                  ) : (
                    <span className="text-[10px] tracking-widest text-line2">NEWEST ENTRY</span>
                  )}
                </div>
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
