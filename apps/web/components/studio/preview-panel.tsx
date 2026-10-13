import { useEffect, useRef, useState } from 'react';
import type { DemoFile, PreviewState } from './demo-data';
import { DemoDiagram } from './demo-diagram';
import { Icon } from './icon';
import { IconButton } from './button';

interface PreviewPanelProps {
  file: DemoFile | null;
  state: PreviewState;
  onStateChange: (state: PreviewState) => void;
  onOpenExample: () => void;
}
export function PreviewPanel({ file, state, onStateChange, onOpenExample }: PreviewPanelProps) {
  const [zoom, setZoom] = useState(100);
  const [baseScale, setBaseScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasDiagram = state === 'example' && !!file?.diagram;
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === 0) return;
      setBaseScale(Math.max(0.25, Math.min(1, (entry.contentRect.width - 48) / 520, (entry.contentRect.height - 150) / 400)));
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);
  return <section id="preview-panel" className="preview-panel" aria-label="Visualização demonstrativa">
    <div className="panel-heading preview-heading"><h2>Visualização</h2><span><Icon name="image" />SVG demonstrativo</span></div>
    <div className="preview-state-bar"><label htmlFor="preview-state">Estado do preview</label><select id="preview-state" value={state} onChange={event => onStateChange(event.target.value as PreviewState)}>
      <option value="example">Exemplo</option><option value="loading">Carregando</option><option value="error">Erro</option><option value="empty">Vazio</option>
    </select></div>
    <div ref={viewportRef} className="preview-viewport" aria-busy={state === 'loading'}>
      {hasDiagram ? <div className="diagram-scroll-area"><figure className="diagram-figure"><div style={{ width: 520 * baseScale * zoom / 100, height: 400 * baseScale * zoom / 100 }}><DemoDiagram kind={file.diagram!} /></div><figcaption>Exemplo estático · sem renderização PlantUML</figcaption></figure></div> :
        <div className={`preview-message ${state === 'error' ? 'is-error' : ''}`} role={state === 'error' ? 'alert' : 'status'}>
          {state === 'loading' ? <><span className="spinner" aria-hidden="true" /><h3>Carregando demonstração</h3><p>Este estado é apenas uma simulação visual.</p></> : state === 'error' ? <><div className="state-icon"><Icon name="alert" /></div><h3>Não foi possível exibir o preview</h3><p>Erro simulado. Nenhuma requisição foi enviada.</p><button className="button secondary" onClick={onOpenExample}>Voltar ao exemplo</button></> : <><div className="state-icon"><Icon name="image" /></div><h3>Nenhum diagrama para visualizar</h3><p>Selecione um exemplo para explorar a interface.</p><button className="button secondary" onClick={onOpenExample}>Abrir exemplo</button></>}
        </div>}
    </div>
    <div className="zoom-toolbar" role="group" aria-label="Zoom do SVG demonstrativo">
      <IconButton icon="minus" label="Diminuir zoom" disabled={!hasDiagram || zoom <= 50} onClick={() => setZoom(value => Math.max(50, value - 10))} />
      <output aria-live="polite" aria-label="Zoom atual">{zoom}%</output>
      <IconButton icon="plus" label="Aumentar zoom" disabled={!hasDiagram || zoom >= 200} onClick={() => setZoom(value => Math.min(200, value + 10))} />
      <span className="toolbar-divider" /><IconButton icon="fit" label="Ajustar diagrama à área" disabled={!hasDiagram} onClick={() => setZoom(100)} />
    </div>
  </section>;
}
