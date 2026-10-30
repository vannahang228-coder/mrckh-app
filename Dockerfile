# MRC KH - Cloud Deployment Dockerfile
FROM node:20-bullseye-slim

WORKDIR /app

# Install build dependencies for better-sqlite3 native compilation
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy application files
COPY . .

# Environment Defaults
ENV PORT=3000
ENV NODE_ENV=production
ENV DATA_DIR=/data

# Create data directory for SQLite persistence
RUN mkdir -p /data

EXPOSE 3000

# Start Express Production Server
CMD ["node", "server.js"]

