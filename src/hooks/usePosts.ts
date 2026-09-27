import { useEffect, useState } from "react";
import { currentFeed, loadFeed, type PostFeed } from "../lib/posts";

export interface PostsState extends PostFeed {
  loading: boolean;
}

/**
 * Resolves the post feed: Django CMS first, embedded markdown fallback.
 * Starts from the synchronous embedded snapshot so direct #/log/<slug>
 * links render instantly, then upgrades to the live feed when it lands.
 */
export function usePosts(): PostsState {
  const [feed, setFeed] = useState<PostFeed>(() => currentFeed());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    loadFeed().then((f) => {
      if (!alive) return;
      setFeed(f);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  return { ...feed, loading };
}
