import { posix } from 'node:path';
import {
  MAX_PROJECT_PATH_LENGTH,
  MAX_PROJECT_TOTAL_BYTES,
  type ProjectFile,
  type RenderErrorCode,
} from '@plantuml-studio/shared';

const INCLUDE_PATTERN = /^\s*!(include_once|include_many|include)\s+(?:"([^"]+)"|'([^']+)'|(\S+))\s*$/;
const MAX_EXPANDED_SOURCE_BYTES = 1_000_000;

export class ProjectResolutionError extends Error {
  constructor(
    readonly code: Extract<RenderErrorCode, 'PROJECT_FILE_MISSING' | 'PROJECT_CIRCULAR_INCLUDE' | 'PROJECT_PATH_INVALID' | 'SOURCE_TOO_LARGE'>,
    message: string,
    readonly path?: string,
    readonly includeStack?: string[],
  ) {
    super(message);
    this.name = 'ProjectResolutionError';
  }
}

export function resolveProjectSource(entryPath: string, files: ProjectFile[]): string {
  const normalizedEntry = normalizeProjectPath(entryPath);
  const fileMap = new Map<string, string>();

  for (const file of files) {
    const path = normalizeProjectPath(file.path);
    if (fileMap.has(path)) {
      throw new ProjectResolutionError('PROJECT_PATH_INVALID', `O projeto contém mais de um arquivo em “${path}”.`, path);
    }
    fileMap.set(path, file.content);
  }

  if (!fileMap.has(normalizedEntry)) {
    throw new ProjectResolutionError('PROJECT_FILE_MISSING', `O arquivo principal “${normalizedEntry}” não foi encontrado.`, normalizedEntry);
  }

  const includedOnce = new Set<string>();
  let expandedBytes = 0;

  const expand = (path: string, stack: string[]): string => {
    if (stack.includes(path)) {
      const cycle = [...stack.slice(stack.indexOf(path)), path];
      throw new ProjectResolutionError('PROJECT_CIRCULAR_INCLUDE', `Dependência circular: ${cycle.join(' → ')}.`, path, cycle);
    }
    const content = fileMap.get(path);
    if (content === undefined) {
      throw new ProjectResolutionError('PROJECT_FILE_MISSING', `O arquivo importado “${path}” não foi encontrado.`, path, stack);
    }

    const nextStack = [...stack, path];
    const directory = posix.dirname(path);
    const expanded = content.split(/\r?\n/).map((line, index) => {
      const match = line.match(INCLUDE_PATTERN);
      if (!match) return line;

      const directive = match[1];
      const requestedPath = match[2] ?? match[3] ?? match[4];
      let includedPath: string;
      try {
        includedPath = normalizeProjectPath(posix.join(directory, requestedPath));
      } catch {
        throw new ProjectResolutionError('PROJECT_PATH_INVALID', `Include inválido em “${path}”, linha ${index + 1}: ${requestedPath}.`, path, nextStack);
      }

      if (directive !== 'include_many' && includedOnce.has(includedPath)) return `' include_once ignorado: ${includedPath}`;
      if (directive !== 'include_many') includedOnce.add(includedPath);
      const nested = expand(includedPath, nextStack);
      return `' início include: ${includedPath}\n${nested}\n' fim include: ${includedPath}`;
    }).join('\n');

    expandedBytes += Buffer.byteLength(expanded, 'utf8');
    if (expandedBytes > MAX_EXPANDED_SOURCE_BYTES) {
      throw new ProjectResolutionError('SOURCE_TOO_LARGE', 'O projeto expandido excede o limite seguro de renderização.', path, nextStack);
    }
    return expanded;
  };

  return expand(normalizedEntry, []);
}

export function normalizeProjectPath(value: string): string {
  const candidate = value.trim().replaceAll('\\', '/');
  if (!candidate || candidate.length > MAX_PROJECT_PATH_LENGTH || candidate.startsWith('/') || /^[a-z]+:/i.test(candidate) || candidate.includes('\0') || candidate.split('/').some(part => /[:*?"<>|]/.test(part))) {
    throw new ProjectResolutionError('PROJECT_PATH_INVALID', `Caminho de projeto inválido: “${value}”.`, value);
  }
  const normalized = posix.normalize(candidate).replace(/^\.\//, '');
  if (!normalized || normalized === '.' || normalized === '..' || normalized.startsWith('../')) {
    throw new ProjectResolutionError('PROJECT_PATH_INVALID', `O caminho “${value}” sai da raiz isolada do projeto.`, value);
  }
  return normalized;
}

export function projectByteLength(files: ProjectFile[]): number {
  const total = files.reduce((sum, file) => sum + Buffer.byteLength(file.path, 'utf8') + Buffer.byteLength(file.content, 'utf8'), 0);
  if (total > MAX_PROJECT_TOTAL_BYTES) {
    throw new ProjectResolutionError('SOURCE_TOO_LARGE', `O projeto excede o limite de ${MAX_PROJECT_TOTAL_BYTES} bytes.`);
  }
  return total;
}
