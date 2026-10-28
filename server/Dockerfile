# --- Stage 1: Dependencies & Production Image ---
FROM node:20-alpine AS runner

# Create app directory
WORKDIR /usr/src/app

# Install dumb-init for proper signal forwarding and graceful shutdown
RUN apk add --no-cache dumb-init

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy package descriptors
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy source code and config
COPY src ./src
COPY uploads ./uploads

# Create unprivileged user and ensure directory ownership
RUN chown -R node:node /usr/src/app

# Switch to non-root user for security
USER node

# Expose API port
EXPOSE 5000

# Container healthcheck using built-in node fetch
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1))"

# Use dumb-init to handle SIGINT/SIGTERM properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start server
CMD ["node", "src/server.js"]
