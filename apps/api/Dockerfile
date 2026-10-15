FROM node:24.19.0-bookworm-slim

ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
WORKDIR /workspace

RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY packages/shared packages/shared
RUN pnpm --filter @plantuml-studio/shared build && pnpm --filter @plantuml-studio/api build

USER node
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
