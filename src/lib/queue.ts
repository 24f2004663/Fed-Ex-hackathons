import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const JOB_QUEUES = {
    ALLOCATION: 'allocation-queue',
    INGESTION: 'ingestion-queue',
};

// Create Queues
export const allocationQueue = new Queue(JOB_QUEUES.ALLOCATION, { connection });
export const ingestionQueue = new Queue(JOB_QUEUES.INGESTION, { connection });
