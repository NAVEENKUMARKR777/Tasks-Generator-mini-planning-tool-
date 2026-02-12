# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/

# Copy client directory structure
COPY client/ ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd client && npm ci

# Copy remaining source code (excluding client which is already copied)
COPY server/ ./server/

# Build the React app
WORKDIR /app/client
RUN node_modules/.bin/react-scripts build
WORKDIR /app

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]
