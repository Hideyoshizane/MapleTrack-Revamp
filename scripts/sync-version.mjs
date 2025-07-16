import fs from 'fs';
import path from 'path';

const pkgPath = path.resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const envPath = '.env.local';
const version = pkg.version;

const content = `APP_VERSION=${version}\n`;

fs.writeFileSync(envPath, content);
console.log(`Synced version ${version} to .env.local`);
