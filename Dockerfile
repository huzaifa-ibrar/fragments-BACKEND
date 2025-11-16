# Stage 1: Dependencies and Testing
FROM node:20-alpine AS deps

# Set working directory
WORKDIR /app

# Install dependencies required for node-gyp
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Stage 2: Testing
FROM deps AS builder

# Copy source code
COPY . .

# Run linting and tests
RUN npm run lint && npm run test

# Stage 3: Production
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set Node.js to production mode
ENV NODE_ENV=production
ENV PORT=8080

# Create non-root user and group
RUN addgroup -S nodejs && adduser -S fragments -G nodejs

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    # Clean npm cache
    npm cache clean --force && \
    # Remove unnecessary files
    rm -rf /root/.npm /root/.node-gyp /tmp/*

# Copy source code
COPY --chown=fragments:nodejs src/ ./src/

# Switch to non-root user
USER fragments

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start the application
CMD ["npm", "start"]
