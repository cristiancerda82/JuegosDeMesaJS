# Servidor de salas. Se construye desde la raíz del monorepo:
#   docker build -f packages/server/Dockerfile -t juegos-servidor .
#   docker run -p 8787:8787 -e ORIGENES=https://mi-dominio.example juegos-servidor
FROM node:24-alpine AS construir
WORKDIR /app
RUN corepack enable
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.base.json ./
COPY packages/engine/package.json packages/engine/
COPY packages/server/package.json packages/server/
RUN pnpm install --frozen-lockfile --filter @juegos/server...
COPY packages/engine packages/engine
COPY packages/server packages/server
RUN pnpm --filter @juegos/server build && pnpm --filter @juegos/server deploy --prod --legacy /salida

FROM node:24-alpine
WORKDIR /app
COPY --from=construir /salida/node_modules node_modules
COPY --from=construir /app/packages/server/dist dist
ENV PUERTO=8787
EXPOSE 8787
USER node
CMD ["node", "dist/main.js"]
