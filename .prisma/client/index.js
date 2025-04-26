// This file serves as a proxy to the actual Prisma client
// It's necessary to solve the "Can't resolve '.prisma/client'" issue

// First, get the actual client from the generated location
const generatedClient = require('../../prisma/app/generated/prisma/client');

// Just re-export everything
module.exports = generatedClient;