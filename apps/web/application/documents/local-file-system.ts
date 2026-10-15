import { MAX_PLANTUML_SOURCE_BYTES, MAX_PROJECT_FILES, MAX_PROJECT_TOTAL_BYTES } from '@plantuml-studio/shared';
import type { ImportedProjectFile } from '../../state/document-store';
import type { StudioDocument } from '../../components/studio/demo-data';

type PermissionMode = 'read' | 'readwrite';
type PermissionCapableHandle = FileSystemHandle & {
  queryPermission?: (options: { mode: PermissionMode }) => Promise<PermissionState>;
  requestPermission?: (options: { mode: PermissionMode }) => Promise<PermissionState>;
};
type IterableDirectoryHandle = FileSystemDirectoryHandle & {
  entries: () => AsyncIterableIterator<[string, FileSystemHandle]>;
};
type DirectoryPickerWindow = Window & typeof globalThis & {
  showDirectoryPicker?: (options?: { id?: string; mode?: PermissionMode }) => Promise<FileSystemDirectoryHandle>;
};

export interface OpenedLocalProject {
  name: string;
  directoryHandle: FileSystemDirectoryHandle;
  files: ImportedProjectFile[];
}

export class LocalFileSystemError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'LocalFileSystemError';
  }
}

export function supportsDirectoryPicker() {
  if (typeof window === 'undefined') return false;
  return typeof (window as DirectoryPickerWindow).showDirectoryPicker === 'function';
}

export async function openLocalProject(): Promise<OpenedLocalProject> {
  const picker = (window as DirectoryPickerWindow).showDirectoryPicker;
  if (!picker) throw new LocalFileSystemError('Este navegador não oferece acesso direto a pastas. Use Importar Pasta para criar um projeto interno.');

  let directoryHandle: FileSystemDirectoryHandle;
  try {
    directoryHandle = await picker({ id: 'plantuml-studio-project', mode: 'readwrite' });
  } catch (error: unknown) {
    if (isAbort(error)) throw new LocalFileSystemError('A abertura da pasta foi cancelada.');
    if (isPermissionDenied(error)) throw new LocalFileSystemError('A permissão para acessar a pasta foi negada.');
    throw new LocalFileSystemError('Não foi possível abrir a pasta selecionada.', { cause: error });
  }

  const files: ImportedProjectFile[] = [];
  await readDirectory(directoryHandle, '', files);
  if (!files.length) throw new LocalFileSystemError('A pasta não contém arquivos .puml, .plantuml ou .pu.');
  if (files.length > MAX_PROJECT_FILES) throw new LocalFileSystemError(`A pasta excede o limite de ${MAX_PROJECT_FILES} arquivos PlantUML.`);
  const totalBytes = files.reduce((sum, file) => sum + new TextEncoder().encode(file.content).byteLength, 0);
  if (totalBytes > MAX_PROJECT_TOTAL_BYTES) throw new LocalFileSystemError('A pasta excede o limite seguro de tamanho do projeto.');
  return { name: directoryHandle.name, directoryHandle, files };
}

export async function saveDocumentToDisk(document: StudioDocument) {
  const handle = document.fileHandle;
  if (!handle) throw new LocalFileSystemError(`O arquivo ${document.path} perdeu o vínculo com o disco. Reabra a pasta.`);
  await ensurePermission(handle, 'readwrite');

  let currentFile: File;
  try {
    currentFile = await handle.getFile();
  } catch (error: unknown) {
    throw new LocalFileSystemError(`O arquivo ${document.path} foi removido ou não está mais acessível.`, { cause: error });
  }

  if (document.lastKnownModified !== undefined && currentFile.lastModified !== document.lastKnownModified) {
    const diskContent = await currentFile.text();
    if (diskContent !== document.savedContent) {
      throw new LocalFileSystemError(`${document.path} foi alterado fora do Studio. Reabra a pasta antes de salvar para não sobrescrever mudanças externas.`);
    }
  }

  try {
    const writable = await handle.createWritable();
    await writable.write(document.content);
    await writable.close();
    const savedFile = await handle.getFile();
    return { lastModified: savedFile.lastModified };
  } catch (error: unknown) {
    if (isPermissionDenied(error)) throw new LocalFileSystemError(`Sem permissão para gravar ${document.path}.`, { cause: error });
    throw new LocalFileSystemError(`Não foi possível salvar ${document.path} no disco.`, { cause: error });
  }
}

async function readDirectory(directory: FileSystemDirectoryHandle, prefix: string, files: ImportedProjectFile[]) {
  const iterable = directory as IterableDirectoryHandle;
  for await (const [name, handle] of iterable.entries()) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === 'directory') {
      await readDirectory(handle as FileSystemDirectoryHandle, path, files);
      continue;
    }
    if (!isPlantUmlFile(name)) continue;
    const fileHandle = handle as FileSystemFileHandle;
    const file = await fileHandle.getFile();
    if (file.size > MAX_PLANTUML_SOURCE_BYTES) throw new LocalFileSystemError(`${path} excede ${MAX_PLANTUML_SOURCE_BYTES / 1000} KB.`);
    files.push({ path, content: await file.text(), fileHandle, lastKnownModified: file.lastModified });
  }
}

async function ensurePermission(handle: FileSystemHandle, mode: PermissionMode) {
  const permissionHandle = handle as PermissionCapableHandle;
  if (!permissionHandle.queryPermission || !permissionHandle.requestPermission) return;
  if (await permissionHandle.queryPermission({ mode }) === 'granted') return;
  if (await permissionHandle.requestPermission({ mode }) !== 'granted') throw new LocalFileSystemError('A permissão de leitura e gravação foi negada.');
}

function isPlantUmlFile(name: string) { return /\.(?:puml|plantuml|pu)$/i.test(name); }
function isAbort(error: unknown) { return error instanceof DOMException && error.name === 'AbortError'; }
function isPermissionDenied(error: unknown) { return error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError'); }
