FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy TypeScript files and build
COPY tsconfig.json ./
COPY src ./src

RUN npm install -g typescript && \
    npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application and dependencies
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

# Set environment variable for production
ENV NODE_ENV=production

# Run the application
CMD ["node", "build/index.js"]