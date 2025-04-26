// This script ensures that the .prisma/client directory is generated
// Run this before the build process with: node fix-prisma.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up Prisma client directory structure...');

// Define paths
const prismaClientDir = path.join(__dirname, '.prisma', 'client');
const exists = fs.existsSync(prismaClientDir);

// Create necessary directories
if (!exists) {
  console.log('.prisma/client directory not found. Creating directory structure...');
  fs.mkdirSync(path.join(__dirname, '.prisma'), { recursive: true });
  fs.mkdirSync(prismaClientDir, { recursive: true });
} else {
  console.log('.prisma/client directory already exists.');
}

// Create or update the index.js file
const indexContent = `// This file serves as a proxy to the actual Prisma client
// It's necessary to solve the "Can't resolve '.prisma/client'" issue

// First, get the actual client from the generated location
const generatedClient = require('../../prisma/app/generated/prisma/client');

// Just re-export everything
module.exports = generatedClient;`;

fs.writeFileSync(path.join(prismaClientDir, 'index.js'), indexContent);
console.log('Created/updated proxy index.js in .prisma/client directory');

// Create or update the default.js file
const defaultContent = `// This is a proxy file to resolve the '.prisma/client/default' import issue
// It exports an object with all the Prisma client exports

// First get the actual generated client
const client = require('../../prisma/app/generated/prisma/client');

// Export everything from the client as individual properties
module.exports = client;`;

fs.writeFileSync(path.join(prismaClientDir, 'default.js'), defaultContent);
console.log('Created/updated proxy default.js in .prisma/client directory');

// Also create a edge.js file which might be needed
const edgeContent = `// This is a proxy file to resolve potential edge runtime imports
module.exports = require('../../prisma/app/generated/prisma/client');`;

fs.writeFileSync(path.join(prismaClientDir, 'edge.js'), edgeContent);
console.log('Created/updated proxy edge.js in .prisma/client directory');

// Run Prisma generate to ensure client is generated
console.log('Running prisma generate...');
exec('npx prisma generate', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error running prisma generate: ${error}`);
    return;
  }
  console.log(stdout);
  if (stderr) console.error(stderr);
  console.log('Prisma client generation completed successfully.');
  
  // Create a dummy node_modules/.prisma/client directory as well
  // This helps with some build configurations
  const nodeModulesPrismaDir = path.join(__dirname, 'node_modules', '.prisma', 'client');
  
  try {
    fs.mkdirSync(path.join(__dirname, 'node_modules', '.prisma'), { recursive: true });
    fs.mkdirSync(nodeModulesPrismaDir, { recursive: true });
    
    // Link the same files
    fs.copyFileSync(path.join(prismaClientDir, 'index.js'), path.join(nodeModulesPrismaDir, 'index.js'));
    fs.copyFileSync(path.join(prismaClientDir, 'default.js'), path.join(nodeModulesPrismaDir, 'default.js'));
    fs.copyFileSync(path.join(prismaClientDir, 'edge.js'), path.join(nodeModulesPrismaDir, 'edge.js'));
    
    console.log('Created proxy files in node_modules/.prisma/client as well');
  } catch (err) {
    console.warn('Warning: Could not create proxy files in node_modules/.prisma/client:', err.message);
  }
}); 