'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useRenderPreview } from '../../application/rendering/use-render-preview';
import { useWorkspacePersistence } from '../../application/documents/use-workspace-persistence';
import { useDocumentStore } from '../../state/document-store';
import { EditorPanel } from './editor-panel';
import { FileExplorer } from './file-explorer';
import { PreviewPanel } from './preview-panel';
import { SplitHandle } from './split-handle';
import { Toolbar } from './toolbar';

export function WorkspaceShell() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [editorWidth, setEditorWidth] = useState(50);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'preview'>('editor');
  const [compact, setCompact] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const projects = useDocumentStore(state => state.projects);
  const activeProjectId = useDocumentStore(state => state.activeProjectId);
  const activeProject = projects.find(project => project.id === activeProjectId) ?? null;
  const documents = activeProject?.documents ?? [];
  const activeDocumentId = activeProject?.activeDocumentId ?? null;
  const mainDocumentId = activeProject?.mainDocumentId ?? null;
  const activeDocument = documents.find(document => document.id === activeDocumentId) ?? null;
  const mainDocument = documents.find(document => document.id === mainDocumentId) ?? null;
  const previewDocument = activeDocument ?? mainDocument;
  const renderProject = useMemo(() => previewDocument ? {
    entryPath: previewDocument.path,
    files: documents.map(document => ({ path: document.path, content: document.content })),
  } : undefined, [documents, previewDocument]);
  const { state: previewState, renderNow } = useRenderPreview(previewDocument?.id ?? null, previewDocument?.content ?? null, theme, renderProject);
  const persistence = useWorkspacePersistence();

  const togglePreviewExpanded = useCallback(() => {
    const preview = document.getElementById('preview-panel');
    if (!previewExpanded) {
      setPreviewExpanded(true);
      if (preview?.requestFullscreen) void preview.requestFullscreen().catch(() => undefined);
      return;
    }
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined).finally(() => setPreviewExpanded(false));
      return;
    }
    setPreviewExpanded(false);
  }, [previewExpanded]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1099px)');
    const update = () => setCompact(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (document.fullscreenElement) setPreviewExpanded(document.fullscreenElement.id === 'preview-panel');
      else setPreviewExpanded(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault();
        togglePreviewExpanded();
      } else if (event.key === 'Escape' && previewExpanded) {
        if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined).finally(() => setPreviewExpanded(false));
        else setPreviewExpanded(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [previewExpanded, togglePreviewExpanded]);

  const visibleSidebar = compact ? sidebarOpen : !sidebarHidden;
  return <div className="studio" data-theme={theme} data-mobile-panel={mobilePanel} data-preview-expanded={previewExpanded || undefined} style={{ '--sidebar-width': `${sidebarWidth}px`, '--editor-width': `${editorWidth}%` } as CSSProperties}>
    <a className="skip-link" href="#workspace-content">Ir para o conteúdo</a>
    <Toolbar theme={theme} projectName={activeProject?.name ?? null} projectOrigin={activeProject?.origin ?? null} onToggleTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} onToggleSidebar={() => compact ? setSidebarOpen(value => !value) : setSidebarHidden(value => !value)} sidebarOpen={visibleSidebar} onRender={() => { setMobilePanel('preview'); renderNow(); }} canRender={!!previewDocument} isRendering={previewState.status === 'loading'} activeDocument={activeDocument} diagramDocument={previewDocument} svg={previewState.svg} />
    <div className="mobile-panel-tabs" role="group" aria-label="Painel visível"><button aria-pressed={mobilePanel === 'editor'} onClick={() => setMobilePanel('editor')}>Código</button><button aria-pressed={mobilePanel === 'preview'} onClick={() => setMobilePanel('preview')}>Preview</button></div>
    <main id="workspace-content" tabIndex={-1} aria-busy={!persistence.ready} className={`workspace ${sidebarHidden ? 'sidebar-hidden' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`} ref={workspaceRef} onKeyDown={event => { if (event.key === 'Escape') setSidebarOpen(false); }}>
      <div className="sidebar-region"><FileExplorer onDocumentOpened={() => setSidebarOpen(false)} /></div>
      <SplitHandle className="sidebar-divider" label="Redimensionar explorador" controls="file-explorer" value={sidebarWidth} min={200} max={360} step={10} unit=" pixels" onChange={setSidebarWidth} fromPointer={x => x - (workspaceRef.current?.getBoundingClientRect().left ?? 0)} />
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Fechar explorador" onClick={() => setSidebarOpen(false)} />}
      <div className="document-panels" ref={panelsRef}>
        <EditorPanel theme={theme} persistence={persistence.state} onSave={() => { void persistence.saveNow(); }} onSaveAll={() => { void persistence.saveAll(); }} />
        <SplitHandle className="editor-divider" label="Redimensionar editor e preview" controls="editor-panel preview-panel" value={editorWidth} min={35} max={65} step={2} unit="%" onChange={setEditorWidth} fromPointer={x => { const rect = panelsRef.current?.getBoundingClientRect(); return rect ? (x - rect.left) / rect.width * 100 : editorWidth; }} />
        <PreviewPanel state={previewState} documentPath={previewDocument?.path ?? null} onRetry={renderNow} expanded={previewExpanded} onToggleExpanded={togglePreviewExpanded} />
      </div>
      {!persistence.ready && <div className="workspace-loading" role="status"><span className="spinner small" aria-hidden="true" />Carregando documentos locais…</div>}
    </main>
    <footer className="statusbar"><div className="statusbar-leading"><span className="demo-status"><span className="status-dot" />Renderização local</span><span className={`persistence-status ${persistence.state.status}`} title={persistence.state.message}><span className="status-dot" />{persistence.state.status === 'error' ? 'Erro ao salvar' : persistence.state.status === 'saving' ? 'Salvando' : persistence.state.status === 'loading' ? 'Carregando' : activeProject?.origin === 'local' ? 'Disco local' : 'Salvo'}</span></div><div><span className="line-count">{activeDocument ? `${activeDocument.content.split('\n').length} linhas` : 'Nenhum documento aberto'}</span><span>PlantUML</span><span>UTF-8</span></div></footer>
  </div>;
}
