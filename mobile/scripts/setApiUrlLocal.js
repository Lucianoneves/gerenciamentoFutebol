const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function detectIp() {
  try {
    const out = execSync('ipconfig', { encoding: 'utf8' });
    const matches = Array.from(out.matchAll(/IPv4[^:]*:\s*(\d+\.\d+\.\d+\.\d+)/g)).map(m => m[1]);
    const preferred = matches.find(ip => /^192\.168\.|^10\./.test(ip));
    return preferred || matches[0] || null;
  } catch (e) {
    return null;
  }
}

const ip = detectIp();
if (!ip) {
  console.error('Falha ao detectar IP local');
  process.exit(1);
}

const envPath = path.join(__dirname, '..', '.env');
const value = `API_URL=http://${ip}:3000/api\n`;
fs.writeFileSync(envPath, value);
console.log(value.trim());
