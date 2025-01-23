# Use Node.js Alpine as base image
FROM node:20-alpine

# Install necessary tools
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps
RUN npm install -g prisma

# Copy prisma schema and generate client
COPY prisma ./prisma/

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000

# Start the application with migrations
CMD ["npm", "run", "docker:init"] 