# 1) deps
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# 2) build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next build treba build-time env ako ti nešto čita env tokom build-a
ARG JWT_SECRET
ARG JWT_EXPIRES
ARG DATABASE_URL
ARG API_URL

ENV JWT_SECRET=${JWT_SECRET}
ENV JWT_EXPIRES=${JWT_EXPIRES}
ENV DATABASE_URL=${DATABASE_URL}
ENV API_URL=${API_URL}

RUN npm run build

# 3) runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Kopiramo samo ono što treba za start
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Ako koristiš next.config.ts, kopiraj oba (nekad postoji .js)
COPY --from=builder /app/next.config.* ./

EXPOSE 3000

# Drizzle push + start
CMD ["sh", "-c", "npx drizzle-kit push && node_modules/.bin/next start -H 0.0.0.0 -p ${PORT}"]