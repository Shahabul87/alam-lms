#!/bin/bash

# Log the current directory
echo "Current directory: $(pwd)"

# Install all dependencies
npm install

# Run our Prisma fix script
node fix-prisma.js

# Generate Prisma client
npx prisma generate

# Build the Next.js application
npm run build 