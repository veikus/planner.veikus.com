# Install dependencies only when needed
FROM node:22.16.0-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
# Install dev deps too (tailwind/postcss) even if NODE_ENV=production is set by the build environment.
RUN npm ci --include=dev

# Rebuild the source code only when needed
FROM node:22.16.0-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG DB_USER
ARG DB_PASS
ENV DB_HOST=$DB_HOST \
    DB_PORT=$DB_PORT \
    DB_NAME=$DB_NAME \
    DB_USER=$DB_USER \
    DB_PASS=$DB_PASS
RUN npm run build
RUN npm prune --omit=dev

# Production image, copy necessary files
FROM node:22.16.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
