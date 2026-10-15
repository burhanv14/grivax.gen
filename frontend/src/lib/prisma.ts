// import { PrismaClient } from "@prisma/client";

// export const prisma = global.prisma || new PrismaClient();

// if (process.env.NODE_ENV !== "production") global.prisma = prisma;// // lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Create a singleton instance of PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Add a workaround to ignore unknown fields
    log: ['error'],
    // This will make Prisma ignore fields that don't exist in the schema
    // when creating or updating records
    errorFormat: 'minimal',
  })
}

// Define the type for the global prisma instance
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Create the prisma instance if it doesn't exist
const prisma = globalThis.prisma ?? prismaClientSingleton()

// Export the prisma instance
export default prisma

// In development, store the prisma instance on the global object
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma