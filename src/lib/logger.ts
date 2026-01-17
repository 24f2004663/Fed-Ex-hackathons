import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'fedex-smart-recovery' },
    transports: [
        new winston.transports.Console({
            format:
                process.env.NODE_ENV === 'production'
                    ? winston.format.json()
                    : winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    ),
        }),
    ],
});

export { logger };
