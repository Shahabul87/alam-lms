// This script ensures proper Prisma client path resolution on Vercel
// It's intended to be called during the build process

const fs = require('fs');
const path = require('path');

console.log('Running Prisma fix for Vercel deployment...');

// Essential paths for Prisma client
const prismaClientDir = path.join(__dirname, '..', '.prisma', 'client');
const generatedDir = path.join(__dirname, 'app', 'generated', 'prisma', 'client');
const nodeModulesPrismaDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');

// Make sure all directories exist
fs.mkdirSync(prismaClientDir, { recursive: true });
fs.mkdirSync(nodeModulesPrismaDir, { recursive: true });

// Log the current state to help with debugging
console.log('Checking if Prisma client was generated at:', generatedDir);
const clientExists = fs.existsSync(generatedDir);
console.log('Generated client exists:', clientExists);

// Function to create proxy file with the correct path
function createProxyFile(targetPath, relativePath) {
  const content = `// Proxy file for Prisma client
module.exports = require('${relativePath}');`;
  
  try {
    fs.writeFileSync(targetPath, content);
    console.log(`Created proxy at: ${targetPath}`);
  } catch (error) {
    console.error(`Failed to create proxy at ${targetPath}:`, error.message);
  }
}

// Create browser-specific files that return empty objects
function createBrowserFile(targetPath) {
  const content = `// Empty module for browser environments
module.exports = {};`;
  
  try {
    fs.writeFileSync(targetPath, content);
    console.log(`Created browser file at: ${targetPath}`);
  } catch (error) {
    console.error(`Failed to create browser file at ${targetPath}:`, error.message);
  }
}

// Create proxy files in .prisma/client
createProxyFile(path.join(prismaClientDir, 'index.js'), '../prisma/app/generated/prisma/client');
createProxyFile(path.join(prismaClientDir, 'default.js'), '../prisma/app/generated/prisma/client');
createProxyFile(path.join(prismaClientDir, 'edge.js'), '../prisma/app/generated/prisma/client');

// Create browser-specific files in .prisma/client
createBrowserFile(path.join(prismaClientDir, 'index-browser.js'));
createBrowserFile(path.join(prismaClientDir, 'edge-browser.js'));

// Create proxy files in node_modules/.prisma/client
createProxyFile(path.join(nodeModulesPrismaDir, 'index.js'), '../../../prisma/app/generated/prisma/client');
createProxyFile(path.join(nodeModulesPrismaDir, 'default.js'), '../../../prisma/app/generated/prisma/client');
createProxyFile(path.join(nodeModulesPrismaDir, 'edge.js'), '../../../prisma/app/generated/prisma/client');

// Create browser-specific files in node_modules/.prisma/client
createBrowserFile(path.join(nodeModulesPrismaDir, 'index-browser.js'));
createBrowserFile(path.join(nodeModulesPrismaDir, 'edge-browser.js'));

// Also create a browser file in the @prisma/client directory
const prismaClientNodeModulesDir = path.join(__dirname, '..', 'node_modules', '@prisma', 'client');
if (fs.existsSync(prismaClientNodeModulesDir)) {
  console.log('Creating browser files in @prisma/client...');
  createBrowserFile(path.join(prismaClientNodeModulesDir, 'index-browser.js'));
  
  // Create a re-export file
  const reExportContent = `// Re-export from .prisma/client
module.exports = require('../../.prisma/client/index-browser');`;
  fs.writeFileSync(path.join(prismaClientNodeModulesDir, 'index-browser.js'), reExportContent);
  console.log(`Created browser file at: ${path.join(prismaClientNodeModulesDir, 'index-browser.js')}`);
}

console.log('Prisma fix for Vercel deployment completed successfully!'); 