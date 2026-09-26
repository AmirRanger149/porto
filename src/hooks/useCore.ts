import { useEffect, useState } from "react";
import { getCore, peekCore, type CoreApi } from "../lib/wasm";

/** Reactive handle on the WASM core — resolves once the module is instantiated. */
export function useCore(): CoreApi | null {
  const [core, setCore] = useState<CoreApi | null>(() => peekCore());
  useEffect(() => {
    let alive = true;
    getCore().then((c) => {
      if (alive) setCore(c);
    });
    return () => {
      alive = false;
    };
  }, []);
  return core;
}
