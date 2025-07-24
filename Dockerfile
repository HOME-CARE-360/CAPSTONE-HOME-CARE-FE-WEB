# Multi-stage build for Next.js application
FROM node:18-alpine3.18 AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --ignore-scripts

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code after dependencies
COPY . .

# Set environment variables
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL_BACKEND
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_API_URL_BACKEND=${NEXT_PUBLIC_API_URL_BACKEND}

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

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

USER nextjs

EXPOSE ${PORT}

ENV PORT=${PORT}
ENV HOSTNAME="0.0.0.0"

# Use the standalone server directly
CMD ["node", "server.js"]

# Development stage
FROM base AS development
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --ignore-scripts

# Copy source code after dependencies
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start development server
CMD ["npm", "run", "dev"]