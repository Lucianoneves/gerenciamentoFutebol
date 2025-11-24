import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

function detectLanIp() {
  const nets = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        candidates.push(net.address);
      }
    }
  }
  const preferred = candidates.find(ip => ip.startsWith('192.168.') || ip.startsWith('10.') || /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip));
  return preferred || candidates[0] || null;
}

async function writeMobileEnv(url) {
  const mobileEnv = path.join(process.cwd(), '..', 'mobile', '.env');
  const value = `API_URL=${url}`;
  fs.writeFileSync(mobileEnv, value + '\n');
  console.log(value);
}

async function startServer() {
  const proc = spawn('node', ['src/server.js'], { stdio: 'inherit', cwd: process.cwd() });
  return proc;
}

async function main() {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  const serverProc = await startServer();
  const ip = detectLanIp();
  if (!ip) {
    console.error('Falha ao detectar IP local. Defina API_URL manualmente.');
  } else {
    await writeMobileEnv(`http://${ip}:${PORT}/api`);
  }
  serverProc.on('exit', (code) => {
    console.log(`Servidor finalizado com código ${code}`);
    process.exit(code || 0);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
