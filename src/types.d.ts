declare module "*.rs?raw" {
  const src: string;
  export default src;
}

declare module "*.wat?raw" {
  const src: string;
  export default src;
}
