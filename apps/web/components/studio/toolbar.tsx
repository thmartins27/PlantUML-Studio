import { Icon } from './icon';
import { IconButton } from './button';

interface ToolbarProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onSimulate: () => void;
  canSimulate: boolean;
}
export function Toolbar({ theme, onToggleTheme, onToggleSidebar, sidebarOpen, onSimulate, canSimulate }: ToolbarProps) {
  return <header className="app-toolbar">
    <Icon name="code" className="brand-icon" /><h1>PlantUML Studio</h1>
    <span className="project-name">Workspace de exemplo</span>
    <div className="app-actions">
      <IconButton icon="panel" label="Alternar explorador" aria-controls="file-explorer" aria-expanded={sidebarOpen} onClick={onToggleSidebar} />
      <IconButton icon={theme === 'dark' ? 'sun' : 'moon'} label={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} onClick={onToggleTheme} />
      <span className="export-action" title="Exportação não disponível nesta fase"><button className="button secondary" disabled><Icon name="export" />Exportar</button></span>
      <button className="button primary simulate-button" onClick={onSimulate} disabled={!canSimulate} title="Simular carregamento de um SVG estático; sem integração PlantUML"><Icon name="play" /><span>Simular preview</span></button>
    </div>
  </header>;
}
