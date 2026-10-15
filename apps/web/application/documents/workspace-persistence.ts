import type { PersistedDocument, PersistedProject, PersistedWorkspace } from '../../state/document-store';

const DATABASE_NAME = 'plantuml-studio';
const DATABASE_VERSION = 1;
const STORE_NAME = 'workspace';
const WORKSPACE_KEY = 'current';

export class WorkspacePersistenceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'WorkspacePersistenceError';
  }
}

let databasePromise: Promise<IDBDatabase> | null = null;

export async function loadWorkspace(): Promise<PersistedWorkspace | null> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const request = transaction.objectStore(STORE_NAME).get(WORKSPACE_KEY);
  const value = await requestResult<unknown>(request);
  if (value === undefined) return null;
  if (isPersistedWorkspace(value)) return value;
  if (isFlatWorkspace(value)) return migrateFlatWorkspace(value);
  if (isLegacyWorkspace(value)) return migrateLegacyWorkspace(value);
  throw new WorkspacePersistenceError('Os dados locais estão corrompidos ou usam uma versão incompatível.');
}

export async function saveWorkspace(workspace: PersistedWorkspace): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  transaction.objectStore(STORE_NAME).put(workspace, WORKSPACE_KEY);
  await transactionCompletion(transaction);
}

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;
  if (!('indexedDB' in globalThis)) return Promise.reject(new WorkspacePersistenceError('Este navegador não oferece IndexedDB.'));
  databasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME); };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => { database.close(); databasePromise = null; };
      resolve(database);
    };
    request.onerror = () => { databasePromise = null; reject(new WorkspacePersistenceError('Não foi possível abrir o armazenamento local.', { cause: request.error })); };
    request.onblocked = () => { databasePromise = null; reject(new WorkspacePersistenceError('O armazenamento local está bloqueado por outra aba.')); };
  });
  return databasePromise;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new WorkspacePersistenceError('Não foi possível ler os projetos locais.', { cause: request.error }));
  });
}

function transactionCompletion(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new WorkspacePersistenceError('Não foi possível salvar os projetos localmente.', { cause: transaction.error }));
    transaction.onabort = () => reject(new WorkspacePersistenceError('O salvamento local foi interrompido.', { cause: transaction.error }));
  });
}

function isPersistedWorkspace(value: unknown): value is PersistedWorkspace {
  if (!isRecord(value) || value.version !== 3 || !Array.isArray(value.projects) || !Array.isArray(value.openProjectIds)) return false;
  if (!value.openProjectIds.every(id => typeof id === 'string') || (value.activeProjectId !== null && typeof value.activeProjectId !== 'string')) return false;
  if (!value.projects.every(isPersistedProject)) return false;
  const projectIds = new Set(value.projects.map(project => project.id));
  return projectIds.size === value.projects.length && value.openProjectIds.every(id => projectIds.has(id)) && (value.activeProjectId === null || projectIds.has(value.activeProjectId));
}

function isPersistedProject(value: unknown): value is PersistedProject {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string' || (value.origin !== 'browser' && value.origin !== 'local')) return false;
  if (!Array.isArray(value.documents) || !value.documents.every(isPersistedDocument) || !Array.isArray(value.openDocumentIds) || !value.openDocumentIds.every(id => typeof id === 'string')) return false;
  if (value.activeDocumentId !== null && typeof value.activeDocumentId !== 'string') return false;
  if (value.mainDocumentId !== null && typeof value.mainDocumentId !== 'string') return false;
  if (value.directoryHandle !== undefined && !isHandle(value.directoryHandle, 'directory')) return false;
  const documentIds = new Set(value.documents.map(document => document.id));
  return documentIds.size === value.documents.length && value.openDocumentIds.every(id => documentIds.has(id)) && (value.activeDocumentId === null || documentIds.has(value.activeDocumentId)) && (value.mainDocumentId === null || documentIds.has(value.mainDocumentId));
}

function isPersistedDocument(value: unknown): value is PersistedDocument {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string' && typeof value.path === 'string' && typeof value.content === 'string' && typeof value.savedContent === 'string' &&
    (value.fileHandle === undefined || isHandle(value.fileHandle, 'file')) && (value.lastKnownModified === undefined || typeof value.lastKnownModified === 'number');
}

interface FlatWorkspace {
  version: 2;
  documents: Array<{ id: string; name: string; path: string; content: string }>;
  openDocumentIds: string[];
  activeDocumentId: string | null;
  mainDocumentId: string | null;
}

function isFlatWorkspace(value: unknown): value is FlatWorkspace {
  return isRecord(value) && value.version === 2 && Array.isArray(value.documents) && value.documents.every(document => isRecord(document) && typeof document.id === 'string' && typeof document.name === 'string' && typeof document.path === 'string' && typeof document.content === 'string') && Array.isArray(value.openDocumentIds) && value.openDocumentIds.every(id => typeof id === 'string') && (value.activeDocumentId === null || typeof value.activeDocumentId === 'string') && (value.mainDocumentId === null || typeof value.mainDocumentId === 'string');
}

interface LegacyWorkspace {
  version: 1;
  documents: Array<{ id: string; name: string; content: string }>;
  openDocumentIds: string[];
  activeDocumentId: string | null;
}

function isLegacyWorkspace(value: unknown): value is LegacyWorkspace {
  return isRecord(value) && value.version === 1 && Array.isArray(value.documents) && value.documents.every(document => isRecord(document) && typeof document.id === 'string' && typeof document.name === 'string' && typeof document.content === 'string') && Array.isArray(value.openDocumentIds) && value.openDocumentIds.every(id => typeof id === 'string') && (value.activeDocumentId === null || typeof value.activeDocumentId === 'string');
}

function migrateFlatWorkspace(workspace: FlatWorkspace): PersistedWorkspace {
  const projectId = 'project-migrated';
  return { version: 3, projects: [{ id: projectId, name: 'projeto', origin: 'browser', documents: workspace.documents.map(document => ({ ...document, savedContent: document.content })), openDocumentIds: workspace.openDocumentIds, activeDocumentId: workspace.activeDocumentId, mainDocumentId: workspace.mainDocumentId }], openProjectIds: [projectId], activeProjectId: projectId };
}

function migrateLegacyWorkspace(workspace: LegacyWorkspace): PersistedWorkspace {
  const documents = workspace.documents.map(document => ({ ...document, path: document.name }));
  const documentIds = new Set(documents.map(document => document.id));
  const activeDocumentId = workspace.activeDocumentId && documentIds.has(workspace.activeDocumentId) ? workspace.activeDocumentId : documents[0]?.id ?? null;
  return migrateFlatWorkspace({ version: 2, documents, openDocumentIds: workspace.openDocumentIds.filter(id => documentIds.has(id)), activeDocumentId, mainDocumentId: activeDocumentId });
}

function isHandle(value: unknown, kind: 'file' | 'directory') {
  return isRecord(value) && value.kind === kind && typeof value.name === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
