import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { createServer as createHttpServer } from 'node:http';
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

async function start(t, args, cwd, env = {}) {
  const port = await availablePort();
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', NEXT_TELEMETRY_DISABLED: '1', ...env },
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

async function startMockRenderer(t) {
  const colorMappers = [];
  const server = createHttpServer((request, response) => {
    colorMappers.push(request.headers['x-preferred-color-mapper']);
    let body = '';
    request.setEncoding('utf8');
    request.on('data', chunk => { body += chunk; });
    request.on('end', () => {
      const source = body;
      response.setHeader('content-type', 'image/svg+xml');
      if (source.includes('syntax-error')) {
        response.statusCode = 400;
        response.setHeader('x-plantuml-diagram-error', 'Syntax Error?');
        response.setHeader('x-plantuml-diagram-error-line', '2');
      }
      response.end('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" onload="alert(1)"><script>alert(1)</script><rect width="20" height="20" fill="#fff" /></svg>');
    });
  });
  const port = await availablePort();
  server.listen(port, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  return { url: `http://127.0.0.1:${port}`, colorMappers };
}

test('production web serves the foundation page', { timeout: 60000 }, async t => {
  const url = await start(t, [webRequire.resolve('next/dist/bin/next'), 'start', '--hostname', '127.0.0.1'], fileURLToPath(new URL('apps/web', root)));
  const response = await fetch(url);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(await response.text(), /<h1>PlantUML Studio<\/h1>/);
});

test('production API exposes health and renders sanitized SVG', { timeout: 60000 }, async t => {
  const renderer = await startMockRenderer(t);
  const url = await start(t, ['dist/main.js'], fileURLToPath(new URL('apps/api', root)), { PLANTUML_RENDERER_URL: renderer.url });
  const response = await fetch(`${url}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
  assert.equal((await fetch(`${url}/render`)).status, 404);

  const renderResponse = await fetch(`${url}/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source: '@startuml\nAlice -> Bob\n@enduml' }),
  });
  assert.equal(renderResponse.status, 200);
  const rendered = await renderResponse.json();
  assert.equal(rendered.ok, true);
  assert.match(rendered.svg, /^<svg/);
  assert.doesNotMatch(rendered.svg, /script|onload/i);
  assert.equal(renderer.colorMappers.at(-1), 'IDENTITY');

  const darkRenderResponse = await fetch(`${url}/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source: '@startuml\nAlice -> Bob\n@enduml', theme: 'dark' }),
  });
  assert.equal(darkRenderResponse.status, 200);
  assert.equal(renderer.colorMappers.at(-1), 'LIGTHNESS_INVERSE');

  const syntaxResponse = await fetch(`${url}/render`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ source: '@startuml\nsyntax-error\n@enduml' }),
  });
  assert.equal(syntaxResponse.status, 422);
  assert.deepEqual(await syntaxResponse.json(), {
    ok: false,
    error: { code: 'SYNTAX_ERROR', message: 'Syntax Error?', line: 3 },
  });
});
