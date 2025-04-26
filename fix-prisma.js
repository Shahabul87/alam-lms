// This script ensures that the .prisma/client directory is generated
// Run this before the build process with: node fix-prisma.js

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking for Prisma client directory...');

// Check if .prisma/client directory exists
const prismaClientDir = path.join(__dirname, '.prisma', 'client');
const exists = fs.existsSync(prismaClientDir);

if (!exists) {
  console.log('.prisma/client directory not found. Creating directory structure...');
  
  // Create the necessary directory structure
  try {
    fs.mkdirSync(path.join(__dirname, '.prisma'), { recursive: true });
    fs.mkdirSync(prismaClientDir, { recursive: true });
    
    // Create a simple index.js file that re-exports from the generated client
    const indexContent = `
// Re-export from the generated Prisma client
module.exports = require('./prisma/app/generated/prisma/client');
`;
    
    fs.writeFileSync(path.join(prismaClientDir, 'index.js'), indexContent);
    console.log('Created proxy index.js in .prisma/client directory');
    
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
    });
  } catch (err) {
    console.error('Error creating Prisma client directory:', err);
  }
} else {
  console.log('.prisma/client directory already exists. No action needed.');
} 