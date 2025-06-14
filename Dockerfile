# Install dependencies only when needed
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app
ARG DB_HOST=db
ARG DB_PORT=3306
ARG DB_NAME=flights
ARG DB_USER=flight_bot
ARG DB_PASS=secret
ENV DB_HOST=$DB_HOST \
    DB_PORT=$DB_PORT \
    DB_NAME=$DB_NAME \
    DB_USER=$DB_USER \
    DB_PASS=$DB_PASS
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run generate-schedule
RUN npm run build

# Production image, copy necessary files
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/flights ./flights

EXPOSE 3000
CMD ["npm", "start"]
