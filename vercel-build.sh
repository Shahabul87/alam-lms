#!/bin/bash

# Install all dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build the Next.js application
next build 