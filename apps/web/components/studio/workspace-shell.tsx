'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { demoFiles, type DemoId, type PreviewState } from './demo-data';
import { EditorPanel } from './editor-panel';
import { FileExplorer } from './file-explorer';
import { PreviewPanel } from './preview-panel';
import { SplitHandle } from './split-handle';
import { Toolbar } from './toolbar';

export function WorkspaceShell() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [selected, setSelected] = useState<DemoId | null>('auth');
  const [previewState, setPreviewState] = useState<PreviewState>('example');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [editorWidth, setEditorWidth] = useState(50);
  const [mobilePanel, setMobilePanel] = useState<'editor' | 'preview'>('editor');
  const [compact, setCompact] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const file = demoFiles.find(item => item.id === selected) ?? null;

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1099px)');
    const update = () => setCompact(media.matches);
    update(); media.addEventListener('change', update);
    return () => { media.removeEventListener('change', update); if (timer.current) clearTimeout(timer.current); };
  }, []);

  function changePreview(state: PreviewState) {
    if (timer.current) clearTimeout(timer.current);
    setPreviewState(state);
  }
  function selectFile(id: DemoId) {
    setSelected(id);
    changePreview(id === 'new' ? 'empty' : 'example');
    setSidebarOpen(false);
  }
  function simulatePreview() {
    changePreview('loading');
    setMobilePanel('preview');
    timer.current = setTimeout(() => setPreviewState('example'), 900);
  }
  const visibleSidebar = compact ? sidebarOpen : !sidebarHidden;
  return <div className="studio" data-theme={theme} data-mobile-panel={mobilePanel} style={{ '--sidebar-width': `${sidebarWidth}px`, '--editor-width': `${editorWidth}%` } as CSSProperties}>
    <a className="skip-link" href="#workspace-content">Ir para o conteúdo</a>
    <Toolbar theme={theme} onToggleTheme={() => setTheme(value => value === 'dark' ? 'light' : 'dark')} onToggleSidebar={() => compact ? setSidebarOpen(value => !value) : setSidebarHidden(value => !value)} sidebarOpen={visibleSidebar} onSimulate={simulatePreview} canSimulate={!!file?.diagram && previewState !== 'loading'} />
    <div className="mobile-panel-tabs" role="group" aria-label="Painel visível"><button aria-pressed={mobilePanel === 'editor'} onClick={() => setMobilePanel('editor')}>Código</button><button aria-pressed={mobilePanel === 'preview'} onClick={() => setMobilePanel('preview')}>Preview</button></div>
    <main id="workspace-content" tabIndex={-1} className={`workspace ${sidebarHidden ? 'sidebar-hidden' : ''} ${sidebarOpen ? 'sidebar-open' : ''}`} ref={workspaceRef} onKeyDown={event => { if (event.key === 'Escape') { setSidebarOpen(false); } }}>
      <div className="sidebar-region"><FileExplorer selected={selected} onSelect={selectFile} /></div>
      <SplitHandle className="sidebar-divider" label="Redimensionar explorador" controls="file-explorer" value={sidebarWidth} min={200} max={360} step={10} unit=" pixels" onChange={setSidebarWidth} fromPointer={x => x - (workspaceRef.current?.getBoundingClientRect().left ?? 0)} />
      {sidebarOpen && <button className="sidebar-backdrop" aria-label="Fechar explorador" onClick={() => setSidebarOpen(false)} />}
      <div className="document-panels" ref={panelsRef}>
        <EditorPanel file={file} onClose={() => { setSelected(null); changePreview('empty'); }} />
        <SplitHandle className="editor-divider" label="Redimensionar editor e preview" controls="editor-panel preview-panel" value={editorWidth} min={35} max={65} step={2} unit="%" onChange={setEditorWidth} fromPointer={x => { const rect = panelsRef.current?.getBoundingClientRect(); return rect ? (x - rect.left) / rect.width * 100 : editorWidth; }} />
        <PreviewPanel key={selected ?? 'closed'} file={file} state={previewState} onStateChange={changePreview} onOpenExample={() => selectFile('auth')} />
      </div>
    </main>
    <footer className="statusbar"><span className="demo-status"><span className="status-dot" />Modo demonstração</span><div><span className="line-count">{file ? `${file.lines.length} linhas de exemplo` : 'Nenhum arquivo aberto'}</span><span>PlantUML</span><span>UTF-8</span></div></footer>
  </div>;
}
