import { marked } from "marked";

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO yyyy-mm-dd
  tags: string[];
  abstract: string;
  html: string;
  readMin: number;
}

export type PostSource = "cms" | "embedded";

export interface PostFeed {
  posts: Post[];
  source: PostSource;
}

/* ────────────────────────── embedded feed ──────────────────────────
 * Compiled from src/content/posts/*.md at build time. This is the
 * fallback (and the seed source for the CMS itself).
 */

const modules = import.meta.glob("../content/posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

marked.setOptions({ gfm: true });

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      meta[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^"(.*)"$/, "$1");
    }
  }
  return { meta, body: m[2] };
}

export const EMBEDDED_POSTS: Post[] = Object.entries(modules)
  .map(([path, raw]) => {
    const slug = (path.split("/").pop() ?? "log").replace(/\.md$/, "");
    const { meta, body } = parseFrontmatter(raw);
    const words = body.split(/\s+/).filter(Boolean).length;
    return {
      slug,
      title: meta.title ?? slug,
      date: meta.date ?? "1970-01-01",
      tags: meta.tags ? meta.tags.replace(/^\[|\]$/g, "").split(",").map((t) => t.trim()) : [],
      abstract: meta.abstract ?? "",
      html: marked.parse(body) as string,
      readMin: Math.max(1, Math.round(words / 200)),
    };
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

/* ─────────────────────────── remote feed ───────────────────────────
 * Django + DRF at /api (proxied by nginx under compose). Falls back to
 * the embedded feed on any failure — the site never goes empty.
 */

const API_BASE: string =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) || "/api";

interface RemotePost {
  slug: string;
  title: string;
  date: string;
  tags: string[] | null;
  abstract: string;
  body: string;
  read_min?: number;
}

export async function fetchRemotePosts(timeoutMs = 2500): Promise<Post[]> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/posts/`, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as RemotePost[];
    if (!Array.isArray(data)) throw new Error("unexpected payload");
    return data
      .map((rp) => ({
        slug: rp.slug,
        title: rp.title,
        date: rp.date,
        tags: Array.isArray(rp.tags) ? rp.tags : [],
        abstract: rp.abstract ?? "",
        html: marked.parse(rp.body ?? "") as string,
        readMin:
          rp.read_min ?? Math.max(1, Math.round(((rp.body ?? "").split(/\s+/).length || 1) / 200)),
      }))
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  } finally {
    clearTimeout(timer);
  }
}

/* ─────────────────────────── shared state ────────────────────────── */

let feedPromise: Promise<PostFeed> | null = null;
let cache: PostFeed = { posts: EMBEDDED_POSTS, source: "embedded" };

export function loadFeed(): Promise<PostFeed> {
  if (!feedPromise) {
    feedPromise = fetchRemotePosts()
      .then((posts) => {
        cache = { posts, source: "cms" };
        return cache;
      })
      .catch(() => {
        cache = { posts: EMBEDDED_POSTS, source: "embedded" };
        return cache;
      });
  }
  return feedPromise;
}

/** Synchronous snapshot — embedded until the remote feed resolves. */
export function currentFeed(): PostFeed {
  return cache;
}
