import type { StudioDocument } from './demo-data';
import { ExportMenu } from './export-menu';
import { Icon } from './icon';
import { IconButton } from './button';

interface ToolbarProps {
  theme: 'dark' | 'light';
  projectName: string | null;
  projectOrigin: 'browser' | 'local' | null;
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onRender: () => void;
  canRender: boolean;
  isRendering: boolean;
  activeDocument: StudioDocument | null;
  diagramDocument: StudioDocument | null;
  svg: string | null;
}
export function Toolbar({ theme, projectName, projectOrigin, onToggleTheme, onToggleSidebar, sidebarOpen, onRender, canRender, isRendering, activeDocument, diagramDocument, svg }: ToolbarProps) {
  return <header className="app-toolbar">
    <Icon name="code" className="brand-icon" /><h1>PlantUML Studio</h1>
    <span className="project-name">{projectName ? `${projectName} · ${projectOrigin === 'local' ? 'pasta local' : 'navegador'}` : 'Nenhum projeto aberto'}</span>
    <div className="app-actions">
      <IconButton icon="panel" label="Alternar explorador" aria-controls="file-explorer" aria-expanded={sidebarOpen} onClick={onToggleSidebar} />
      <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={onToggleTheme} />
      <ExportMenu document={activeDocument} diagramDocument={diagramDocument} svg={svg} />
      <button className="button primary simulate-button" onClick={onRender} disabled={!canRender || isRendering} title="Renderizar o documento ativo agora"><Icon name="play" /><span>{isRendering ? 'Renderizando' : 'Renderizar'}</span></button>
    </div>
  </header>;
}
