# Multi-stage production Dockerfile for BookLeaf API (NestJS + Prisma)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for building
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

RUN npm ci --workspace=apps/api

# Copy source and prisma schema
COPY apps/api ./apps/api

# Generate Prisma client and compile TypeScript
WORKDIR /app/apps/api
RUN npx prisma generate
RUN npm run build

# Production Runner stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

RUN npm ci --workspace=apps/api --only=production

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

EXPOSE 3001

WORKDIR /app/apps/api
CMD ["node", "dist/src/main"]
