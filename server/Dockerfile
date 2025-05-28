# BUILD STAGE
FROM node:23-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# PRODUCTION STAGE
FROM node:23-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy templates folder (important for generator service)
COPY --from=builder /app/templates ./templates

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 5000

# Expose port (NestJS default is 3000, but we'll use 3001 to avoid conflicts)
EXPOSE 3001

# Start the application
CMD ["node", "dist/main"]