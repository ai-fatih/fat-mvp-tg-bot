import fs from 'fs'
const LOG_PATH = './logs/queries.log';

function logQuery(obj) {
  fs.mkdirSync('./logs', { recursive: true });
  const line = JSON.stringify({ ts: new Date().toISOString(), ...obj });
  fs.appendFileSync(LOG_PATH, line + '\n');
}

export { logQuery };