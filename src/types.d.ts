declare module "*.rs?raw" {
  const src: string;
  export default src;
}

declare module "*.wat?raw" {
  const src: string;
  export default src;
}

declare module "*.md?raw" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob(
    pattern: string,
    options?: { query?: string; import?: string; eager?: boolean }
  ): Record<string, unknown>;
}
