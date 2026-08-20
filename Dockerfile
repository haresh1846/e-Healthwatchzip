# Production image for Fly.io. Vercel still builds from api/index.js for the
# dev/test deployment and does not use this file.
FROM node:22-slim AS base
ENV NODE_ENV=production

WORKDIR /app

# Dependencies first, so a code-only change reuses the cached layer.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

# Run unprivileged. The node image ships a `node` user for exactly this.
USER node

# Matches internal_port in fly.toml.
ENV PORT=8080
EXPOSE 8080

# server.js listens only when run directly, which is what happens here.
CMD ["node", "server.js"]
