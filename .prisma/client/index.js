// This file serves as a proxy to the actual Prisma client
// It's necessary to solve the "Can't resolve '.prisma/client/default'" issue
// during the build process

module.exports = require('../../prisma/app/generated/prisma/client'); 