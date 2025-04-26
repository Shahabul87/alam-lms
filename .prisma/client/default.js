// This is a proxy file to resolve the '.prisma/client/default' import issue
// It exports an object with all the Prisma client exports

// First get the actual generated client
const client = require('../../prisma/app/generated/prisma/client');

// Export everything from the client as individual properties
module.exports = client;