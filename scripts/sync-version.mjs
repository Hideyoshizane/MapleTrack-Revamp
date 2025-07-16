import fs from 'fs';
import pkg from '../package.json' assert { type: 'json' };

const envPath = '.env.local';
const version = pkg.version;

const content = `APP_VERSION=${version}\n`;

fs.writeFileSync(envPath, content);
console.log(`Synced version ${version} to .env.local`);
