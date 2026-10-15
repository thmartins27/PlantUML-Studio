export const MAX_PLANTUML_SOURCE_BYTES = 50_000;
export const MAX_PROJECT_FILES = 200;
export const MAX_PROJECT_TOTAL_BYTES = 500_000;
export const MAX_PROJECT_PATH_LENGTH = 240;

export type RenderErrorCode =
  | 'INVALID_REQUEST'
  | 'SOURCE_TOO_LARGE'
  | 'PROJECT_FILE_MISSING'
  | 'PROJECT_CIRCULAR_INCLUDE'
  | 'PROJECT_PATH_INVALID'
  | 'SYNTAX_ERROR'
  | 'RENDER_TIMEOUT'
  | 'RENDERER_UNAVAILABLE'
  | 'UNSAFE_SVG'
  | 'RENDER_FAILED';

export interface ProjectFile {
  path: string;
  content: string;
}

export interface SourceRenderRequest {
  source: string;
  theme?: 'dark' | 'light';
}

export interface ProjectRenderRequest {
  entryPath: string;
  files: ProjectFile[];
  theme?: 'dark' | 'light';
}

export type RenderRequest = SourceRenderRequest | ProjectRenderRequest;

export interface RenderSuccess {
  ok: true;
  svg: string;
  durationMs: number;
}

export interface RenderFailure {
  ok: false;
  error: {
    code: RenderErrorCode;
    message: string;
    line?: number;
    path?: string;
    includeStack?: string[];
  };
}

export type RenderResponse = RenderSuccess | RenderFailure;
