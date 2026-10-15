import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { RenderErrorCode, RenderFailure, RenderSuccess } from '@plantuml-studio/shared';
import { sanitizeSvg } from './svg-sanitizer';

const DEFAULT_RENDER_TIMEOUT_MS = 5_000;
const MAX_RENDERER_RESPONSE_BYTES = 2_000_000;

@Injectable()
export class RenderingService {
  private readonly rendererUrl = this.readRendererUrl();
  private readonly timeoutMs = this.readTimeout();

  async render(source: string, theme: 'dark' | 'light'): Promise<RenderSuccess> {
    const startedAt = performance.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.rendererUrl}/svg`, {
        method: 'POST',
        headers: {
          'content-type': 'text/plain;charset=UTF-8',
          accept: 'image/svg+xml',
          'x-preferred-color-mapper': theme === 'dark' ? 'LIGTHNESS_INVERSE' : 'IDENTITY',
        },
        body: source,
        redirect: 'follow',
        signal: controller.signal,
      });
      const svg = await this.readLimitedBody(response);

      if (!response.ok) {
        const lineHeader = response.headers.get('x-plantuml-diagram-error-line');
        const line = lineHeader ? Number.parseInt(lineHeader, 10) + 1 : undefined;
        const message = response.headers.get('x-plantuml-diagram-error') ?? 'O código PlantUML contém um erro de sintaxe.';
        this.fail(HttpStatus.UNPROCESSABLE_ENTITY, 'SYNTAX_ERROR', message, Number.isFinite(line) ? line : undefined);
      }

      let sanitized: string;
      try {
        sanitized = sanitizeSvg(svg);
      } catch {
        this.fail(HttpStatus.BAD_GATEWAY, 'UNSAFE_SVG', 'O renderizador retornou um SVG inválido ou inseguro.');
      }

      return {
        ok: true,
        svg: sanitized!,
        durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
      };
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (controller.signal.aborted) {
        this.fail(HttpStatus.GATEWAY_TIMEOUT, 'RENDER_TIMEOUT', `A renderização excedeu o limite de ${this.timeoutMs} ms.`);
      }
      this.fail(HttpStatus.BAD_GATEWAY, 'RENDERER_UNAVAILABLE', 'O motor PlantUML está indisponível.');
    } finally {
      clearTimeout(timeout);
    }
  }

  private async readLimitedBody(response: Response): Promise<string> {
    const declaredLength = Number(response.headers.get('content-length') ?? 0);
    if (declaredLength > MAX_RENDERER_RESPONSE_BYTES) {
      this.fail(HttpStatus.BAD_GATEWAY, 'RENDER_FAILED', 'O SVG excedeu o limite de resposta permitido.');
    }
    if (!response.body) {
      this.fail(HttpStatus.BAD_GATEWAY, 'RENDER_FAILED', 'O renderizador retornou uma resposta vazia.');
    }

    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_RENDERER_RESPONSE_BYTES) {
        await reader.cancel();
        this.fail(HttpStatus.BAD_GATEWAY, 'RENDER_FAILED', 'O SVG excedeu o limite de resposta permitido.');
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks, totalBytes).toString('utf8');
  }

  private fail(status: HttpStatus, code: RenderErrorCode, message: string, line?: number): never {
    const error: RenderFailure = { ok: false, error: { code, message, ...(line === undefined ? {} : { line }) } };
    throw new HttpException(error, status);
  }

  private readRendererUrl(): string {
    const value = process.env.PLANTUML_RENDERER_URL ?? 'http://127.0.0.1:8080';
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('PLANTUML_RENDERER_URL must use http or https');
    return value.replace(/\/$/, '');
  }

  private readTimeout(): number {
    const value = Number(process.env.RENDER_TIMEOUT_MS ?? DEFAULT_RENDER_TIMEOUT_MS);
    if (!Number.isInteger(value) || value < 100 || value > 30_000) {
      throw new Error('RENDER_TIMEOUT_MS must be an integer between 100 and 30000');
    }
    return value;
  }
}
