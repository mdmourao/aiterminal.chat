# syntax=docker.io/docker/dockerfile:1.4

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/ ./
RUN chown -R nodejs:nodejs /app
USER nodejs
EXPOSE 3003
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://localhost:3003/ || exit 1
CMD ["node", "app.js"]