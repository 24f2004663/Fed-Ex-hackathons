import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

const env = envSchema.safeParse(process.env);

if (!env.success) {
    console.error('❌ Invalid environment variables:', env.error.format());
    throw new Error('Invalid environment variables');
}

export const config = env.data;
