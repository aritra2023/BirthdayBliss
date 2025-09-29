# Dockerfile for Koyeb deployment
FROM node:20-alpine

# Install system dependencies and curl for health check
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including build tools in dependencies)
# Use --production=false to ensure all deps are installed for build
RUN npm ci --production=false --verbose --no-audit || (echo "Failed to install dependencies" && exit 1)

# Copy source code
COPY . .

# Build the application with error handling
RUN npm run build || (echo "Build failed - checking logs..." && ls -la && exit 1)

# Verify build output exists
RUN ls -la dist/ || (echo "Build output missing" && exit 1)

# Remove dev dependencies after build to reduce image size
RUN npm prune --production || echo "Warning: Failed to prune dev dependencies"

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 5000

# Health check with better error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=5 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]