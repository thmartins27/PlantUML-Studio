import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import {
  MAX_PLANTUML_SOURCE_BYTES,
  MAX_PROJECT_FILES,
  type ProjectRenderRequest,
  type RenderFailure,
  type RenderRequest,
  type RenderResponse,
  type SourceRenderRequest,
} from '@plantuml-studio/shared';
import { projectByteLength, ProjectResolutionError, resolveProjectSource } from './project-source-resolver';
import { RenderingService } from './rendering.service';

@Controller('render')
export class RenderingController {
  constructor(private readonly renderingService: RenderingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async render(@Body() body: unknown): Promise<RenderResponse> {
    if (!this.isRequest(body)) {
      this.fail(HttpStatus.BAD_REQUEST, 'INVALID_REQUEST', 'Envie código PlantUML ou um projeto com entryPath e files.');
    }

    let source: string;
    try {
      if (this.isSourceRequest(body)) {
        if (Buffer.byteLength(body.source, 'utf8') > MAX_PLANTUML_SOURCE_BYTES) {
          this.fail(HttpStatus.PAYLOAD_TOO_LARGE, 'SOURCE_TOO_LARGE', `O código excede o limite de ${MAX_PLANTUML_SOURCE_BYTES} bytes.`);
        }
        source = body.source;
      } else {
        projectByteLength(body.files);
        source = resolveProjectSource(body.entryPath, body.files);
      }
    } catch (error: unknown) {
      if (error instanceof HttpException) throw error;
      if (error instanceof ProjectResolutionError) {
        this.fail(HttpStatus.UNPROCESSABLE_ENTITY, error.code, error.message, error.path, error.includeStack);
      }
      throw error;
    }

    return this.renderingService.render(source, body.theme ?? 'light');
  }

  private isRequest(body: unknown): body is RenderRequest {
    if (!this.hasValidTheme(body)) return false;
    if (this.isSourceRequest(body)) return body.source.trim().length > 0;
    return this.isProjectRequest(body);
  }

  private isSourceRequest(body: RenderRequest | unknown): body is SourceRenderRequest {
    return typeof body === 'object' && body !== null && 'source' in body && typeof (body as { source?: unknown }).source === 'string';
  }

  private isProjectRequest(body: unknown): body is ProjectRenderRequest {
    if (typeof body !== 'object' || body === null || !('entryPath' in body) || !('files' in body)) return false;
    const request = body as { entryPath?: unknown; files?: unknown };
    return typeof request.entryPath === 'string' && request.entryPath.trim().length > 0 &&
      Array.isArray(request.files) && request.files.length > 0 && request.files.length <= MAX_PROJECT_FILES &&
      request.files.every(file => typeof file === 'object' && file !== null &&
        typeof (file as { path?: unknown }).path === 'string' &&
        typeof (file as { content?: unknown }).content === 'string');
  }

  private hasValidTheme(body: unknown): boolean {
    return typeof body === 'object' && body !== null &&
      (!('theme' in body) || (body as { theme?: unknown }).theme === 'dark' || (body as { theme?: unknown }).theme === 'light');
  }

  private fail(status: HttpStatus, code: RenderFailure['error']['code'], message: string, path?: string, includeStack?: string[]): never {
    const response: RenderFailure = { ok: false, error: { code, message, ...(path ? { path } : {}), ...(includeStack ? { includeStack } : {}) } };
    throw new HttpException(response, status);
  }
}
