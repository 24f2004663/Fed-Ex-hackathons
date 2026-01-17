import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execAsync = util.promisify(exec);

const connection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
};

const JOB_QUEUES = {
    ALLOCATION: 'allocation-queue',
    INGESTION: 'ingestion-queue',
};

async function executePythonScript(scriptName: string, args: string[] = []) {
    try {
        const scriptPath = path.resolve(process.cwd(), scriptName);
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        
        // Construct args string safely
        // In a real app we'd use spawn for better safety, but for this demo:
        const argsStr = args.map(a => `"${a}"`).join(' '); // Simple quoting
        
        console.log(`Starting background job: ${scriptName} [${argsStr}]`);
        
        const { stdout, stderr } = await execAsync(`${pythonCommand} "${scriptPath}" ${argsStr}`, {
            env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL || "postgresql://admin:adminpassword@localhost:5432/fedex_recovery" }
        });
        
        if (stderr) {
            console.warn(`Script stderr: ${stderr}`);
        }
        
        console.log(`Job completed: ${scriptName}`);
        return stdout;
    } catch (error) {
        console.error(`Job failed: ${scriptName}`, error);
        throw error;
    }
}

// Worker for Allocation Jobs
export const allocationWorker = new Worker(
    JOB_QUEUES.ALLOCATION,
    async (job: Job) => {
        console.log(`Processing Allocation Job ${job.id}`);
        // Extract args from job
        const args = job.data.args || [];
        await executePythonScript('Allocation.py', args);
        return { status: 'completed' };
    },
    { connection }
);

// Worker for Ingestion Jobs
export const ingestionWorker = new Worker(
    JOB_QUEUES.INGESTION,
    async (job: Job) => {
        console.log(`Processing Ingestion Job ${job.id}`);
        const args = job.data.args || [];
        // Ingestion also maps to Allocation.py --mode ingest for this project
        await executePythonScript('Allocation.py', args);
        return { status: 'ingested' };
    },
    { connection }
);
