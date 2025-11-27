import fs from 'fs';
import path from 'path';

const logFile = path.resolve('./logs.txt');

export const logger = {
    debug: (...args) => process.env.DEBUG === 'true' && console.log('[DEBUG]', ...args),
    info: (...args) => {
        console.log('[INFO]', ...args);
        fs.appendFileSync(logFile, `[INFO] ${new Date().toISOString()} ${args.join(' ')}\n`);
    },
    warn: (...args) => {
        console.warn('[WARN]', ...args);
        fs.appendFileSync(logFile, `[WARN] ${new Date().toISOString()} ${args.join(' ')}\n`);
    },
    error: (...args) => {
        console.error('[ERROR]', ...args);
        fs.appendFileSync(logFile, `[ERROR] ${new Date().toISOString()} ${args.join(' ')}\n`);
    },
    cleanup: (...args) => console.log('[CLEANUP]', ...args),
};
