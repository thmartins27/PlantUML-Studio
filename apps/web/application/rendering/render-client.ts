import type { ProjectFile, RenderFailure, RenderRequest, RenderSuccess } from '@plantuml-studio/shared';

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001').replace(/\/$/, '');

export async function requestRender(
  source: string,
  theme: 'dark' | 'light',
  signal: AbortSignal,
  project?: { entryPath: string; files: ProjectFile[] },
): Promise<RenderSuccess> {
  let response: Response;
  const request: RenderRequest = project ? { ...project, theme } : { source, theme };
  try {
    response = await fetch(`${apiBaseUrl}/render`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw renderFailure('RENDERER_UNAVAILABLE', 'Não foi possível conectar à API de renderização.');
  }

  const payload: unknown = await response.json().catch(() => null);
  if (isSuccess(payload) && response.ok) return payload;
  if (isFailure(payload)) throw payload;
  throw renderFailure('RENDER_FAILED', 'A API retornou uma resposta de renderização inválida.');
}

function isSuccess(value: unknown): value is RenderSuccess {
  return typeof value === 'object' && value !== null &&
    (value as { ok?: unknown }).ok === true &&
    typeof (value as { svg?: unknown }).svg === 'string' &&
    typeof (value as { durationMs?: unknown }).durationMs === 'number';
}

function isFailure(value: unknown): value is RenderFailure {
  if (typeof value !== 'object' || value === null || (value as { ok?: unknown }).ok !== false) return false;
  const error = (value as { error?: unknown }).error;
  return typeof error === 'object' && error !== null &&
    typeof (error as { code?: unknown }).code === 'string' &&
    typeof (error as { message?: unknown }).message === 'string';
}

function renderFailure(code: RenderFailure['error']['code'], message: string): RenderFailure {
  return { ok: false, error: { code, message } };
}

export function asRenderFailure(error: unknown): RenderFailure {
  return isFailure(error) ? error : renderFailure('RENDER_FAILED', 'Falha inesperada ao renderizar o diagrama.');
}
