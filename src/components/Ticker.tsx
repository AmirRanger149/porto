import { TICKER_ITEMS } from "../data/profile";

export function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="marquee relative overflow-hidden border-y border-line bg-panel/70">
      <div className="marquee-track flex w-max items-center py-3">
        {items.map((it, i) => (
          <span key={i} className="flex items-center">
            <span className={`px-6 text-sm tracking-[0.25em] ${i % 2 ? "text-dim" : "text-phos-soft"}`}>{it}</span>
            <span className="text-line2">▚</span>
          </span>
        ))}
      </div>
    </div>
  );
}
