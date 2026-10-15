import { create } from 'zustand';
import { MAX_PROJECT_PATH_LENGTH } from '@plantuml-studio/shared';
import { initialDocuments, newDocumentContent, type StudioDocument } from '../components/studio/demo-data';

type MutationResult = { ok: true; id: string } | { ok: false; error: string };
export type ProjectOrigin = 'browser' | 'local';
export type ImportProjectResult = { ok: true; count: number; projectId: string; mainDocumentId: string } | { ok: false; error: string };

export interface ImportedProjectFile {
  path: string;
  content: string;
  fileHandle?: FileSystemFileHandle;
  lastKnownModified?: number;
}

export interface StudioProject {
  id: string;
  name: string;
  origin: ProjectOrigin;
  directoryHandle?: FileSystemDirectoryHandle;
  documents: StudioDocument[];
  openDocumentIds: string[];
  activeDocumentId: string | null;
  mainDocumentId: string | null;
}

export interface PersistedDocument {
  id: string;
  name: string;
  path: string;
  content: string;
  savedContent: string;
  fileHandle?: FileSystemFileHandle;
  lastKnownModified?: number;
}

export interface PersistedProject {
  id: string;
  name: string;
  origin: ProjectOrigin;
  directoryHandle?: FileSystemDirectoryHandle;
  documents: PersistedDocument[];
  openDocumentIds: string[];
  activeDocumentId: string | null;
  mainDocumentId: string | null;
}

export interface PersistedWorkspace {
  version: 3;
  projects: PersistedProject[];
  openProjectIds: string[];
  activeProjectId: string | null;
}

interface DocumentStore {
  projects: StudioProject[];
  openProjectIds: string[];
  activeProjectId: string | null;
  persistenceRevision: number;
  createProject: (name: string) => MutationResult;
  switchProject: (id: string) => void;
  closeProject: (id: string) => void;
  openDocument: (id: string) => void;
  closeDocument: (id: string) => void;
  createDocument: (name: string) => MutationResult;
  importDocument: (path: string, content: string) => MutationResult;
  importProject: (name: string, files: ImportedProjectFile[], origin?: ProjectOrigin, directoryHandle?: FileSystemDirectoryHandle) => ImportProjectResult;
  renameDocument: (id: string, name: string) => MutationResult;
  deleteDocument: (id: string) => void;
  setMainDocument: (id: string) => void;
  updateDocumentContent: (id: string, content: string) => void;
  markDocumentSaved: (projectId: string, documentId: string, content: string, lastKnownModified?: number, fileHandle?: FileSystemFileHandle) => void;
  hydrateWorkspace: (workspace: PersistedWorkspace) => void;
  markInternalProjectsPersisted: (projects: PersistedProject[]) => void;
}

const initialProject: StudioProject = {
  id: 'project-default',
  name: 'projeto',
  origin: 'browser',
  documents: initialDocuments,
  openDocumentIds: ['auth'],
  activeDocumentId: 'auth',
  mainDocumentId: 'auth',
};

function normalizeName(value: string) {
  const trimmed = value.trim();
  return /\.(?:puml|plantuml|pu)$/i.test(trimmed) ? trimmed : `${trimmed}.puml`;
}

export function normalizeDocumentPath(value: string) {
  const raw = value.trim().replaceAll('\\', '/');
  if (raw.startsWith('/') || /^[a-z]+:/i.test(raw) || raw.length > MAX_PROJECT_PATH_LENGTH) throw new Error('Use um caminho relativo dentro do projeto.');
  const parts: string[] = [];
  for (const part of raw.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (!parts.length) throw new Error('O caminho sai da raiz do projeto.');
      parts.pop();
      continue;
    }
    if (part.includes('\0') || /[:*?"<>|]/.test(part)) throw new Error('O caminho contém caracteres reservados.');
    parts.push(part);
  }
  if (!parts.length) throw new Error('Informe um caminho para o documento.');
  parts[parts.length - 1] = normalizeName(parts[parts.length - 1]);
  return parts.join('/');
}

function basename(path: string) { return path.slice(path.lastIndexOf('/') + 1); }
function dirname(path: string) { const separator = path.lastIndexOf('/'); return separator < 0 ? '' : path.slice(0, separator); }

function validatePath(documents: StudioDocument[], value: string, currentId?: string) {
  let path: string;
  try { path = normalizeDocumentPath(value); }
  catch (error: unknown) { return { ok: false as const, error: error instanceof Error ? error.message : 'Caminho inválido.' }; }
  const name = basename(path);
  if (name === '.puml') return { ok: false as const, error: 'Informe um nome para o documento.' };
  if (documents.some(document => document.id !== currentId && document.path.toLocaleLowerCase() === path.toLocaleLowerCase())) return { ok: false as const, error: 'Já existe um documento nesse caminho.' };
  return { ok: true as const, name, path };
}

function validateProjectName(projects: StudioProject[], value: string) {
  const name = value.trim();
  if (!name) return { ok: false as const, error: 'Informe um nome para o projeto.' };
  if (projects.some(project => project.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return { ok: false as const, error: 'Já existe um projeto com esse nome.' };
  return { ok: true as const, name };
}

function nextActiveDocument(openDocumentIds: string[], closedId: string, activeId: string | null) {
  if (activeId !== closedId) return activeId;
  const closedIndex = openDocumentIds.indexOf(closedId);
  const remaining = openDocumentIds.filter(id => id !== closedId);
  return remaining[Math.min(closedIndex, remaining.length - 1)] ?? null;
}

function createId(prefix: string, offset = 0) { return `${prefix}-${Date.now()}-${offset}-${Math.random().toString(36).slice(2, 8)}`; }

function updateActiveProject(state: Pick<DocumentStore, 'projects' | 'activeProjectId'>, update: (project: StudioProject) => StudioProject) {
  if (!state.activeProjectId) return state.projects;
  return state.projects.map(project => project.id === state.activeProjectId ? update(project) : project);
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  projects: [initialProject],
  openProjectIds: [initialProject.id],
  activeProjectId: initialProject.id,
  persistenceRevision: 0,
  createProject: value => {
    const validation = validateProjectName(get().projects, value);
    if (!validation.ok) return validation;
    const projectId = createId('project');
    const documentId = createId('document');
    const document: StudioDocument = { id: documentId, name: 'main.puml', path: 'main.puml', content: newDocumentContent, savedContent: '' };
    const project: StudioProject = { id: projectId, name: validation.name, origin: 'browser', documents: [document], openDocumentIds: [documentId], activeDocumentId: documentId, mainDocumentId: documentId };
    set(state => ({ projects: [...state.projects, project], openProjectIds: [...state.openProjectIds, projectId], activeProjectId: projectId, persistenceRevision: state.persistenceRevision + 1 }));
    return { ok: true, id: projectId };
  },
  switchProject: id => set(state => !state.projects.some(project => project.id === id) ? state : ({ openProjectIds: state.openProjectIds.includes(id) ? state.openProjectIds : [...state.openProjectIds, id], activeProjectId: id, persistenceRevision: state.persistenceRevision + 1 })),
  closeProject: id => set(state => {
    const openProjectIds = state.openProjectIds.filter(projectId => projectId !== id);
    return { openProjectIds, activeProjectId: state.activeProjectId === id ? openProjectIds.at(-1) ?? null : state.activeProjectId, persistenceRevision: state.persistenceRevision + 1 };
  }),
  openDocument: id => set(state => ({ projects: updateActiveProject(state, project => !project.documents.some(document => document.id === id) ? project : ({ ...project, openDocumentIds: project.openDocumentIds.includes(id) ? project.openDocumentIds : [...project.openDocumentIds, id], activeDocumentId: id })), persistenceRevision: state.persistenceRevision + 1 })),
  closeDocument: id => set(state => ({ projects: updateActiveProject(state, project => ({ ...project, openDocumentIds: project.openDocumentIds.filter(openId => openId !== id), activeDocumentId: nextActiveDocument(project.openDocumentIds, id, project.activeDocumentId) })), persistenceRevision: state.persistenceRevision + 1 })),
  createDocument: value => {
    const project = getActiveProject(get());
    if (!project) return { ok: false, error: 'Abra um projeto antes de criar documentos.' };
    if (project.origin === 'local') return { ok: false, error: 'Criação de arquivos no disco ainda não está disponível; edite os arquivos existentes.' };
    const validation = validatePath(project.documents, value);
    if (!validation.ok) return validation;
    const id = createId('document');
    const document: StudioDocument = { id, name: validation.name, path: validation.path, content: newDocumentContent, savedContent: '' };
    set(state => ({ projects: updateActiveProject(state, current => ({ ...current, documents: [...current.documents, document], openDocumentIds: [...current.openDocumentIds, id], activeDocumentId: id, mainDocumentId: current.mainDocumentId ?? id })), persistenceRevision: state.persistenceRevision + 1 }));
    return { ok: true, id };
  },
  importDocument: (value, content) => {
    const project = getActiveProject(get());
    if (!project) return { ok: false, error: 'Abra um projeto antes de importar documentos.' };
    if (project.origin === 'local') return { ok: false, error: 'Importe documentos somente em projetos internos do navegador.' };
    const validation = validatePath(project.documents, value);
    if (!validation.ok) return validation;
    const id = createId('document');
    const document: StudioDocument = { id, name: validation.name, path: validation.path, content, savedContent: '' };
    set(state => ({ projects: updateActiveProject(state, current => ({ ...current, documents: [...current.documents, document], openDocumentIds: [...current.openDocumentIds, id], activeDocumentId: id, mainDocumentId: current.mainDocumentId ?? id })), persistenceRevision: state.persistenceRevision + 1 }));
    return { ok: true, id };
  },
  importProject: (value, files, origin = 'browser', directoryHandle) => {
    const validation = validateProjectName(get().projects, value);
    if (!validation.ok) return validation;
    if (!files.length) return { ok: false, error: 'A pasta não contém arquivos PlantUML compatíveis.' };
    const prepared: StudioDocument[] = [];
    for (const [index, file] of files.entries()) {
      const pathValidation = validatePath(prepared, file.path);
      if (!pathValidation.ok) return { ok: false, error: `${file.path}: ${pathValidation.error}` };
      prepared.push({ id: createId('document', index), name: pathValidation.name, path: pathValidation.path, content: file.content, savedContent: file.content, fileHandle: file.fileHandle, lastKnownModified: file.lastKnownModified });
    }
    const preferredMain = prepared.find(document => /^main\.(?:puml|plantuml|pu)$/i.test(document.name)) ?? prepared[0];
    const projectId = createId('project');
    const project: StudioProject = { id: projectId, name: validation.name, origin, directoryHandle, documents: prepared, openDocumentIds: [preferredMain.id], activeDocumentId: preferredMain.id, mainDocumentId: preferredMain.id };
    set(state => ({ projects: [...state.projects, project], openProjectIds: [...state.openProjectIds, projectId], activeProjectId: projectId, persistenceRevision: state.persistenceRevision + 1 }));
    return { ok: true, count: prepared.length, projectId, mainDocumentId: preferredMain.id };
  },
  renameDocument: (id, value) => {
    const project = getActiveProject(get());
    if (!project) return { ok: false, error: 'Projeto não encontrado.' };
    if (project.origin === 'local') return { ok: false, error: 'Renomeie arquivos locais pelo sistema operacional e reabra a pasta.' };
    const current = project.documents.find(document => document.id === id);
    if (!current) return { ok: false, error: 'Documento não encontrado.' };
    const path = [dirname(current.path), value].filter(Boolean).join('/');
    const validation = validatePath(project.documents, path, id);
    if (!validation.ok) return validation;
    set(state => ({ projects: updateActiveProject(state, active => ({ ...active, documents: active.documents.map(document => document.id === id ? { ...document, name: validation.name, path: validation.path } : document) })), persistenceRevision: state.persistenceRevision + 1 }));
    return { ok: true, id };
  },
  deleteDocument: id => set(state => ({ projects: updateActiveProject(state, project => {
    if (project.origin === 'local') return project;
    const remainingDocuments = project.documents.filter(document => document.id !== id);
    return { ...project, documents: remainingDocuments, openDocumentIds: project.openDocumentIds.filter(openId => openId !== id), activeDocumentId: nextActiveDocument(project.openDocumentIds, id, project.activeDocumentId), mainDocumentId: project.mainDocumentId === id ? remainingDocuments[0]?.id ?? null : project.mainDocumentId };
  }), persistenceRevision: state.persistenceRevision + 1 })),
  setMainDocument: id => set(state => ({ projects: updateActiveProject(state, project => project.mainDocumentId === id || !project.documents.some(document => document.id === id) ? project : ({ ...project, mainDocumentId: id })), persistenceRevision: state.persistenceRevision + 1 })),
  updateDocumentContent: (id, content) => set(state => ({ projects: updateActiveProject(state, project => ({ ...project, documents: project.documents.map(document => document.id === id && document.content !== content ? { ...document, content } : document) })), persistenceRevision: state.persistenceRevision + 1 })),
  markDocumentSaved: (projectId, documentId, content, lastKnownModified, fileHandle) => set(state => ({ projects: state.projects.map(project => project.id !== projectId ? project : ({ ...project, documents: project.documents.map(document => document.id !== documentId || document.content !== content ? document : ({ ...document, savedContent: content, lastKnownModified: lastKnownModified ?? document.lastKnownModified, fileHandle: fileHandle ?? document.fileHandle })) })) })),
  hydrateWorkspace: workspace => set({ projects: workspace.projects.map(project => ({ ...project, documents: project.documents.map(document => ({ ...document })) })), openProjectIds: workspace.openProjectIds, activeProjectId: workspace.activeProjectId, persistenceRevision: 0 }),
  markInternalProjectsPersisted: persistedProjects => set(state => {
    const persistedByProject = new Map(persistedProjects.filter(project => project.origin === 'browser').map(project => [project.id, new Map(project.documents.map(document => [document.id, document.content]))]));
    return { projects: state.projects.map(project => {
      const contents = persistedByProject.get(project.id);
      return !contents ? project : ({ ...project, documents: project.documents.map(document => contents.get(document.id) === document.content ? { ...document, savedContent: document.content } : document) });
    }) };
  }),
}));

export function getActiveProject(state: Pick<DocumentStore, 'projects' | 'activeProjectId'>) {
  return state.projects.find(project => project.id === state.activeProjectId) ?? null;
}

export function makeWorkspaceSnapshot(state: Pick<DocumentStore, 'projects' | 'openProjectIds' | 'activeProjectId'>): PersistedWorkspace {
  return {
    version: 3,
    projects: state.projects.map(project => ({
      id: project.id,
      name: project.name,
      origin: project.origin,
      directoryHandle: project.directoryHandle,
      documents: project.documents.map(({ id, name, path, content, savedContent, fileHandle, lastKnownModified }) => ({ id, name, path, content, savedContent: project.origin === 'browser' ? content : savedContent, fileHandle, lastKnownModified })),
      openDocumentIds: project.openDocumentIds,
      activeDocumentId: project.activeDocumentId,
      mainDocumentId: project.mainDocumentId,
    })),
    openProjectIds: state.openProjectIds,
    activeProjectId: state.activeProjectId,
  };
}
