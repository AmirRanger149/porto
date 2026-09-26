// Half-width katakana + hex + operator soup — the rain alphabet.
let set = "";
for (let i = 0x30a0; i <= 0x30ff; i++) set += String.fromCharCode(i);
export const GLYPHS = set + "0123456789ABCDEF<>/:=+*#%@¥§¦";

export function glyphFrom(seed: number): string {
  return GLYPHS[Math.abs(seed | 0) % GLYPHS.length];
}
