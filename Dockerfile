# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
#  KAI NAKAMURA — rust → wasm portfolio
#  3 stages: compile the core → build the site → serve it
# ─────────────────────────────────────────────────────────────

# ── stage 1 · core ───────────────────────────────────────────
# Recompiles the WebAssembly core from source (core.wat → core.wasm → core.b64.ts)
# so the image never depends on a checked-in binary.
FROM node:22-alpine AS core
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY scripts/ scripts/
COPY src/wasm/ src/wasm/
RUN node scripts/build-wasm.mjs

# ── stage 2 · build ──────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# fresh core from stage 1 (text embed — what the bundler actually imports)
COPY --from=core /app/src/wasm/core.b64.ts src/wasm/core.b64.ts
COPY --from=core /app/src/wasm/core.wasm  src/wasm/core.wasm
RUN npm run build

# ── stage 3 · serve ──────────────────────────────────────────
FROM nginx:alpine AS serve
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
