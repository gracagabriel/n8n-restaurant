"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// https://docs.nestjs.com/recipes/prisma
const client_1 = require("@prisma/client");
// Global prisma instance
let prisma;
if (process.env.NODE_ENV === 'production') {
    prisma = new client_1.PrismaClient();
}
else {
    let globalWithPrisma = global;
    if (!globalWithPrisma.prisma) {
        globalWithPrisma.prisma = new client_1.PrismaClient();
    }
    prisma = globalWithPrisma.prisma;
}
exports.default = prisma;
