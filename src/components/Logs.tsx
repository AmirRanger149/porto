import { usePosts } from "../hooks/usePosts";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Logs() {
  const { posts, source, loading } = usePosts();

  return (
    <section id="logs" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeading index="04" title="LOGS" cmd="ls ~/logs --decrypt --sort=date" />

      <Reveal>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[10px] tracking-[0.25em] text-dim">
          <span>
            {loading ? "LINKING…" : `${posts.length} ENTRIES`} · MARKDOWN ROOTED · CLICK TO DECRYPT ·{" "}
            <span className="text-phos-soft">'logs'</span> IN THE TTY
          </span>
          <span
            className={`flex items-center gap-2 border px-2.5 py-1 ${
              loading
                ? "border-line text-dim"
                : source === "cms"
                  ? "border-phos/50 text-phos"
                  : "border-amber/50 text-amber"
            }`}
          >
            <span
              className={`led h-1.5 w-1.5 rounded-full ${
                loading ? "bg-dim text-dim" : source === "cms" ? "bg-phos text-phos" : "bg-amber text-amber"
              }`}
            />
            {loading ? "SOURCE:LINKING" : source === "cms" ? "SOURCE:DJANGO-CMS/LIVE" : "SOURCE:BUNDLED/FALLBACK"}
          </span>
        </div>
      </Reveal>

      {loading ? (
        <div className="space-y-0 border-t border-line" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-6 border-b border-line px-3 py-5 sm:px-5">
              <span className="h-6 w-14 bg-line/60" />
              <span className="hidden h-4 w-20 bg-line/40 sm:block" />
              <span className="h-7 flex-1 bg-line/50" />
              <span className="h-5 w-5 bg-line/40" />
            </div>
          ))}
          <p className="px-3 py-4 text-[11px] tracking-wider text-dim sm:px-5">
            <span className="blink text-phos">▊</span> decrypting log index from cms…
          </p>
        </div>
      ) : (
        <div className="border-t border-line">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={i * 60}>
              <button
                onClick={() => {
                  window.location.hash = `#/log/${p.slug}`;
                }}
                className="row-scan group grid w-full grid-cols-[4.2rem_1fr_auto] items-center gap-3 border-b border-line px-3 py-5 text-left transition-colors hover:bg-panel/80 sm:grid-cols-[5.5rem_6.5rem_1fr_auto] sm:px-5"
              >
                <span className="flex items-center gap-2">
                  <span className="font-display text-xl text-line2 transition-colors group-hover:text-phos sm:text-2xl">
                    0x{String(posts.length - i).padStart(2, "0")}
                  </span>
                  {i === 0 && <span className="led h-1.5 w-1.5 rounded-full bg-phos text-phos" />}
                </span>
                <span className="hidden text-xs text-dim sm:inline">{p.date}</span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-2xl leading-tight text-fog transition-colors group-hover:text-phos sm:text-3xl">
                    {p.title}
                  </span>
                  <span className="mt-1 block text-[10px] tracking-[0.2em] text-dim">
                    {p.tags.join(" · ")} — {p.readMin} MIN READ
                  </span>
                </span>
                <span className="font-display text-xl text-dim transition-all duration-300 group-hover:translate-x-1 group-hover:text-phos">
                  ▸
                </span>
              </button>
            </Reveal>
          ))}
          {posts.length === 0 && (
            <p className="px-5 py-8 text-sm text-dim">// no logs published — write one in the admin or drop a .md in src/content/posts</p>
          )}
        </div>
      )}
    </section>
  );
}
