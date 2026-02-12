# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json files first for better caching
COPY package*.json ./

# Copy source files
COPY src ./src/
COPY public ./public/
COPY tsconfig.json ./
COPY server/ ./server/

# Install dependencies
RUN npm install

# Copy remaining source code
COPY server/ ./server/

# Build the React app
RUN npm run build

# Expose port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "run", "start:server"]
