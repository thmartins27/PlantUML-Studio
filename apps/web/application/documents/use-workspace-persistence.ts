'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getActiveProject, makeWorkspaceSnapshot, useDocumentStore } from '../../state/document-store';
import { saveDocumentToDisk } from './local-file-system';
import { loadWorkspace, saveWorkspace } from './workspace-persistence';

export type PersistenceState =
  | { status: 'loading'; message: string }
  | { status: 'saving'; message: string }
  | { status: 'saved'; message: string }
  | { status: 'error'; message: string };

const AUTOSAVE_DELAY_MS = 450;

export function useWorkspacePersistence() {
  const revision = useDocumentStore(state => state.persistenceRevision);
  const hydrateWorkspace = useDocumentStore(state => state.hydrateWorkspace);
  const markInternalProjectsPersisted = useDocumentStore(state => state.markInternalProjectsPersisted);
  const markDocumentSaved = useDocumentStore(state => state.markDocumentSaved);
  const [state, setState] = useState<PersistenceState>({ status: 'loading', message: 'Carregando projetos locais…' });
  const hydrated = useRef(false);
  const active = useRef(true);
  const hydrationSequence = useRef(0);
  const saveSequence = useRef(0);

  const persistWorkspaceMetadata = useCallback(async () => {
    if (!hydrated.current) return false;
    const sequence = ++saveSequence.current;
    const snapshot = makeWorkspaceSnapshot(useDocumentStore.getState());
    setState({ status: 'saving', message: 'Salvando workspace…' });
    try {
      await saveWorkspace(snapshot);
      if (!active.current || sequence !== saveSequence.current) return true;
      markInternalProjectsPersisted(snapshot.projects);
      const project = getActiveProject(useDocumentStore.getState());
      const hasDirtyLocalFiles = project?.origin === 'local' && project.documents.some(document => document.content !== document.savedContent);
      setState({ status: 'saved', message: hasDirtyLocalFiles ? 'Alterações pendentes no disco' : project?.origin === 'local' ? 'Arquivos sincronizados com o disco' : 'Salvo no navegador' });
      return true;
    } catch (error: unknown) {
      if (!active.current || sequence !== saveSequence.current) return false;
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Falha ao salvar o workspace.' });
      return false;
    }
  }, [markInternalProjectsPersisted]);

  const saveActive = useCallback(async () => {
    const project = getActiveProject(useDocumentStore.getState());
    if (!project || project.origin === 'browser') return persistWorkspaceMetadata();
    const document = project.documents.find(candidate => candidate.id === project.activeDocumentId);
    if (!document) return false;
    if (document.content === document.savedContent) return persistWorkspaceMetadata();
    setState({ status: 'saving', message: `Salvando ${document.name} no disco…` });
    try {
      const result = await saveDocumentToDisk(document);
      markDocumentSaved(project.id, document.id, document.content, result.lastModified, document.fileHandle);
      await saveWorkspace(makeWorkspaceSnapshot(useDocumentStore.getState()));
      setState({ status: 'saved', message: 'Salvo no disco' });
      return true;
    } catch (error: unknown) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Falha ao salvar o arquivo no disco.' });
      return false;
    }
  }, [markDocumentSaved, persistWorkspaceMetadata]);

  const saveAll = useCallback(async () => {
    const project = getActiveProject(useDocumentStore.getState());
    if (!project || project.origin === 'browser') return persistWorkspaceMetadata();
    const dirtyDocuments = project.documents.filter(document => document.content !== document.savedContent);
    if (!dirtyDocuments.length) return persistWorkspaceMetadata();
    setState({ status: 'saving', message: `Salvando ${dirtyDocuments.length} arquivo(s) no disco…` });
    try {
      for (const document of dirtyDocuments) {
        const result = await saveDocumentToDisk(document);
        markDocumentSaved(project.id, document.id, document.content, result.lastModified, document.fileHandle);
      }
      await saveWorkspace(makeWorkspaceSnapshot(useDocumentStore.getState()));
      setState({ status: 'saved', message: 'Todos os arquivos foram salvos no disco' });
      return true;
    } catch (error: unknown) {
      await saveWorkspace(makeWorkspaceSnapshot(useDocumentStore.getState())).catch(() => undefined);
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Falha ao salvar os arquivos no disco.' });
      return false;
    }
  }, [markDocumentSaved, persistWorkspaceMetadata]);

  useEffect(() => {
    active.current = true;
    const sequence = ++hydrationSequence.current;
    void (async () => {
      try {
        const persisted = await loadWorkspace();
        if (!active.current || sequence !== hydrationSequence.current) return;
        if (persisted) hydrateWorkspace(persisted);
        hydrated.current = true;
        if (!persisted) await persistWorkspaceMetadata();
        else setState({ status: 'saved', message: 'Projetos recuperados' });
      } catch (error: unknown) {
        if (sequence !== hydrationSequence.current) return;
        hydrated.current = true;
        if (active.current) setState({ status: 'error', message: error instanceof Error ? error.message : 'Falha ao recuperar os projetos locais.' });
      }
    })();
    return () => { active.current = false; };
  }, [hydrateWorkspace, persistWorkspaceMetadata]);

  useEffect(() => {
    if (!hydrated.current || revision === 0) return;
    const timer = window.setTimeout(() => { void persistWorkspaceMetadata(); }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [persistWorkspaceMetadata, revision]);

  useEffect(() => {
    const flush = () => { if (hydrated.current) void saveWorkspace(makeWorkspaceSnapshot(useDocumentStore.getState())).catch(() => undefined); };
    window.addEventListener('pagehide', flush);
    return () => window.removeEventListener('pagehide', flush);
  }, []);

  return { state, ready: state.status !== 'loading', saveNow: saveActive, saveAll };
}
