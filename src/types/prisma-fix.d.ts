import { PrismaClient } from '@prisma/client';

declare module '@prisma/client' {
    interface PrismaClient {
        agency: any;
        agencyPerformance: any;
    }
}
