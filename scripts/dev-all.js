const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const net = require('net');

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

function writeMobileEnv(url) {
  const mobileEnv = path.join(process.cwd(), 'mobile', '.env');
  const value = `API_URL=${url}`;
  fs.writeFileSync(mobileEnv, value + '\n');
  console.log(`[dev-all] ${value}`);
}

function startBackend() {
  const cwd = path.join(process.cwd(), 'backend');
  console.log('[dev-all] Iniciando backend em', cwd);
  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const proc = spawn(cmd, ['run', 'start'], { cwd, stdio: 'inherit', shell: true });
  proc.on('exit', (code) => console.log(`[dev-all] Backend finalizado: ${code}`));
  return proc;
}

function findFreePort(start = 8083, limit = 8099) {
  return new Promise((resolve) => {
    let p = start;
    const tryListen = () => {
      if (p > limit) return resolve(start);
      const srv = net.createServer();
      srv.once('error', () => {
        p += 1;
        tryListen();
      });
      srv.once('listening', () => {
        const port = p;
        srv.close(() => resolve(port));
      });
      srv.listen(p, '127.0.0.1');
    };
    tryListen();
  });
}

function startExpoWeb(port = 8083) {
  const cwd = path.join(process.cwd(), 'mobile');
  console.log('[dev-all] Iniciando Expo Web em', cwd, 'porta', port);
  const args = ['expo', 'start', '--web', '--port', String(port)];
  const env = { ...process.env, CI: '1' };
  const proc = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', args, { cwd, stdio: 'inherit', shell: true, env });
  proc.on('exit', (code) => console.log(`[dev-all] Expo finalizado: ${code}`));
  return proc;
}

async function main() {
  const ip = detectLanIp();
  const apiPort = process.env.PORT ? Number(process.env.PORT) : 3000;
  const useLan = process.argv.includes('--lan') || process.env.USE_LAN === '1';
  const usePublic = process.argv.includes('--public') || process.env.USE_PUBLIC === '1';
  const baseUrl = useLan && ip ? `http://${ip}:${apiPort}/api` : `http://localhost:${apiPort}/api`;
  startBackend();

  if (usePublic) {
    console.log('[dev-all] Iniciando localtunnel para porta', apiPort);
    const lt = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['localtunnel', '--port', String(apiPort)], {
      cwd: path.join(process.cwd(), 'backend'), stdio: ['ignore', 'pipe', 'inherit'], shell: true
    });
    let wrote = false;
    lt.stdout.on('data', async (buf) => {
      const s = buf.toString();
      const m = s.match(/your url is: (https:\/\/[^\s]+)/i);
      if (m && !wrote) {
        wrote = true;
        const publicUrl = m[1] + '/api';
        writeMobileEnv(publicUrl);
        const port = await findFreePort(8083, 8099);
        startExpoWeb(port);
      }
    });
    lt.on('exit', (code) => console.log('[dev-all] localtunnel finalizado:', code));
  } else {
    writeMobileEnv(baseUrl);
    const port = await findFreePort(8083, 8099);
    startExpoWeb(port);
  }
}

main().catch(err => {
  console.error('[dev-all] Erro', err);
  process.exit(1);
});
