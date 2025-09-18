# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_PRIMARY_COLOR
ARG NEXT_PUBLIC_SECONDARY_COLOR
ARG NEXT_PUBLIC_FONT_FAMILY
ARG NEXT_PUBLIC_LOGO_URL
ARG NEXT_PUBLIC_N8N_WEBHOOK_URL
ARG NEXT_PUBLIC_ANALYTICS_ENDPOINT
ARG NEXT_PUBLIC_ANALYTICS_API_KEY
ARG NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_PRIMARY_COLOR=$NEXT_PUBLIC_PRIMARY_COLOR
ENV NEXT_PUBLIC_SECONDARY_COLOR=$NEXT_PUBLIC_SECONDARY_COLOR
ENV NEXT_PUBLIC_FONT_FAMILY=$NEXT_PUBLIC_FONT_FAMILY
ENV NEXT_PUBLIC_LOGO_URL=$NEXT_PUBLIC_LOGO_URL
ENV NEXT_PUBLIC_N8N_WEBHOOK_URL=$NEXT_PUBLIC_N8N_WEBHOOK_URL
ENV NEXT_PUBLIC_ANALYTICS_ENDPOINT=$NEXT_PUBLIC_ANALYTICS_ENDPOINT
ENV NEXT_PUBLIC_ANALYTICS_API_KEY=$NEXT_PUBLIC_ANALYTICS_API_KEY
ENV NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE=$NEXT_PUBLIC_ANALYTICS_SAMPLE_RATE

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["node", "server.js"]