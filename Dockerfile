FROM node:22-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/voice-gateway/package.json apps/voice-gateway/
COPY packages/mcp/package.json packages/mcp/
COPY packages/api/package.json packages/api/
COPY packages/db/package.json packages/db/
COPY packages/shared-types/package.json packages/shared-types/

RUN pnpm install --frozen-lockfile
RUN npm install -g tsx

# Copy source code
COPY apps/ apps/
COPY packages/ packages/

# Default command is overridden per service in docker-compose
CMD ["echo", "Use docker-compose to start services"]
