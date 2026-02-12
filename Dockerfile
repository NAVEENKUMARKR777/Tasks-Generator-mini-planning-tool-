# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/

# Copy entire client directory (excluding node_modules via .dockerignore)
COPY client/ ./client/

# Install dependencies
RUN npm ci --only=production
RUN cd client && npm install --include=dev

# Copy remaining source code (excluding client which is already copied)
COPY server/ ./server/

# Build the React app
WORKDIR /app/client
RUN npm run build
RUN echo "Build completed, checking directory contents:"
RUN ls -la
RUN echo "Checking if build directory exists:"
RUN ls -la build/ || echo "Build directory not found"
WORKDIR /app

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]
