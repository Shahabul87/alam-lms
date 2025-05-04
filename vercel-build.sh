#!/bin/bash

# Log the current directory
echo "Current directory: $(pwd)"

# Install all dependencies
npm install

# Generate Prisma client with verbose logging
echo "Generating Prisma client..."
npx prisma generate --verbose

# Build the Next.js application
npm run build 