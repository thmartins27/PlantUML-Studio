import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const webRequire = createRequire(new URL('apps/web/package.json', root));

async function availablePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function start(t, args, cwd) {
  const port = await availablePort();
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  let spawnError;
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  child.on('error', error => { spawnError = error; });
  t.after(async () => {
    if (child.exitCode !== null || child.signalCode !== null || spawnError) return;
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
    try { await exited; } finally { clearTimeout(timer); }
  });
  const url = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    if (spawnError) throw spawnError;
    assert.equal(child.exitCode, null, output);
    try {
      await fetch(url, { signal: AbortSignal.timeout(1000) });
      return url;
    } catch { await delay(100); }
  }
  assert.fail(`Server startup timed out: ${output}`);
}

test('production web serves the foundation page', { timeout: 60000 }, async t => {
  const url = await start(t, [webRequire.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1'], fileURLToPath(new URL('apps/web', root)));
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(await response.text(), /<h1>PlantUML Studio<\/h1>/);
});

test('production API exposes health and no editor route', { timeout: 60000 }, async t => {
  const url = await start(t, ['dist/main.js'], fileURLToPath(new URL('apps/api', root)));
  const response = await fetch(`${url}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  assert.equal((await fetch(`${url}/render`)).status, 404);
});
