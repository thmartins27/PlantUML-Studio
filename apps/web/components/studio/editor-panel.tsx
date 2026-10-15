import dynamic from 'next/dynamic';
import { useDocumentStore } from '../../state/document-store';
import { Icon } from './icon';
import { IconButton } from './button';
import type { PersistenceState } from '../../application/documents/use-workspace-persistence';

const MonacoCodeEditor = dynamic(() => import('./monaco-code-editor').then(module => module.MonacoCodeEditor), {
  ssr: false,
  loading: () => <div className="editor-loading" role="status">Carregando editor…</div>,
});

export function EditorPanel({ theme, persistence, onSave, onSaveAll }: { theme: 'dark' | 'light'; persistence: PersistenceState; onSave: () => void; onSaveAll: () => void }) {
  const projects = useDocumentStore(state => state.projects);
  const activeProjectId = useDocumentStore(state => state.activeProjectId);
  const project = projects.find(candidate => candidate.id === activeProjectId) ?? null;
  const documents = project?.documents ?? [];
  const openDocumentIds = project?.openDocumentIds ?? [];
  const activeDocumentId = project?.activeDocumentId ?? null;
  const openDocument = useDocumentStore(state => state.openDocument);
  const closeDocument = useDocumentStore(state => state.closeDocument);
  const updateDocumentContent = useDocumentStore(state => state.updateDocumentContent);
  const openDocuments = openDocumentIds.flatMap(id => {
    const document = documents.find(candidate => candidate.id === id);
    return document ? [document] : [];
  });
  const activeDocument = documents.find(document => document.id === activeDocumentId) ?? null;
  const isDirty = activeDocument ? activeDocument.content !== activeDocument.savedContent : false;
  const dirtyCount = documents.filter(document => document.content !== document.savedContent).length;
  const persistenceLabel = persistence.status === 'error' ? 'Falha ao salvar' : persistence.status === 'saving' ? 'Salvando…' : isDirty ? project?.origin === 'local' ? 'Alterado no editor' : 'Salvando…' : persistence.message;

  return <section id="editor-panel" className="editor-panel" aria-label="Editor de código PlantUML">
    <div className="panel-heading editor-tabs" role="tablist" aria-label="Documentos abertos">{openDocuments.length ? openDocuments.map(document => {
      const dirty = document.content !== document.savedContent;
      const active = document.id === activeDocumentId;
      return <div className="file-tab" data-active={active} key={document.id}>
        <button type="button" className="file-tab-select" role="tab" aria-selected={active} aria-controls="editor-content" onClick={() => openDocument(document.id)}><Icon name="file" /><span>{document.name}</span>{dirty && <span className="dirty-dot" title="Alterações não salvas"><span className="visually-hidden">Alterações não salvas</span></span>}</button>
        <IconButton icon="close" label={`Fechar ${document.name}`} onClick={() => closeDocument(document.id)} />
      </div>;
    }) : <span className="panel-title">Código</span>}</div>
    {activeDocument ? <>
      <div className="editor-breadcrumb"><span>{project?.name ?? 'projeto'} <span className="breadcrumb-slash">/</span> {activeDocument.path}</span><span className="editor-document-status"><span className={`persistence-label ${persistence.status}`}>{persistenceLabel}</span>{project?.origin === 'local' && <button type="button" className="save-all-button" disabled={!dirtyCount || persistence.status === 'saving'} onClick={onSaveAll}>Salvar todos</button>}<IconButton icon="save" label="Salvar agora (Ctrl+S)" disabled={persistence.status === 'loading' || persistence.status === 'saving' || (!isDirty && persistence.status !== 'error')} onClick={onSave} /></span></div>
      <div id="editor-content" className="editor-content" role="tabpanel">
        <MonacoCodeEditor document={activeDocument} theme={theme} onChange={content => updateDocumentContent(activeDocument.id, content)} onSave={onSave} />
      </div>
    </> : <div className="editor-empty"><Icon name="code" /><p>Selecione um arquivo</p><span>Abra ou crie um documento no explorador.</span></div>}
    <div className={`panel-note ${persistence.status === 'error' ? 'persistence-error' : ''}`} role="status"><Icon name={persistence.status === 'error' ? 'alert' : project?.origin === 'local' ? 'folder' : 'info'} /><span>{persistence.status === 'error' ? persistence.message : project?.origin === 'local' ? 'Ctrl+S grava no arquivo original · metadados no IndexedDB' : 'Salvamento automático no navegador · IndexedDB'}</span></div>
  </section>;
}
