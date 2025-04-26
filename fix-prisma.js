// This script ensures that the Prisma client is properly generated and linked
// Run this before the build process with: node fix-prisma.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up Prisma client directory structure...');

// Run prisma generate first to ensure the client is generated
console.log('Running prisma generate...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('Prisma client generation completed successfully.');
} catch (error) {
  console.error('Error generating Prisma client:', error);
  process.exit(1);
}

// Now run the Vercel-specific fix
console.log('Running Vercel-specific fixes...');
try {
  // Run the specialized script
  require('./prisma/fix-prisma-vercel.js');
} catch (error) {
  console.error('Error running Vercel-specific fixes:', error);
}

console.log('Prisma client setup completed successfully.'); 