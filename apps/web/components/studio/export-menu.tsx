'use client';

import { useEffect, useRef, useState } from 'react';
import {
  exportPlantUmlSource,
  exportPng,
  exportSvg,
  type PngScale,
} from '../../application/export/document-export';
import type { StudioDocument } from './demo-data';
import { Icon } from './icon';

interface ExportMenuProps {
  document: StudioDocument | null;
  diagramDocument: StudioDocument | null;
  svg: string | null;
}

type ExportKind = 'source' | 'svg' | 'png';

export function ExportMenu({ document, diagramDocument, svg }: ExportMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [pngScale, setPngScale] = useState<PngScale>(2);
  const [working, setWorking] = useState<ExportKind | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      const details = detailsRef.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) details.open = false;
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && detailsRef.current?.open) {
        detailsRef.current.open = false;
        detailsRef.current.querySelector('summary')?.focus();
      }
    };
    window.addEventListener('pointerdown', closeOnOutsideClick);
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('pointerdown', closeOnOutsideClick);
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  async function runExport(kind: ExportKind) {
    if (!document || working) return;
    setWorking(kind);
    setError(null);
    try {
      if (kind === 'source') exportPlantUmlSource(document);
      if (kind === 'svg') exportSvg(svg ?? '', diagramDocument?.name ?? document.name);
      if (kind === 'png') await exportPng(svg ?? '', diagramDocument?.name ?? document.name, pngScale);
      if (detailsRef.current) detailsRef.current.open = false;
    } catch (exportError: unknown) {
      setError(exportError instanceof Error ? exportError.message : 'Não foi possível exportar o arquivo.');
    } finally {
      setWorking(null);
    }
  }

  const disabled = document === null;
  const diagramDisabled = svg === null;
  return <details className="export-menu export-action" ref={detailsRef}>
    <summary
      className="button secondary"
      aria-disabled={disabled}
      onClick={event => { if (disabled) event.preventDefault(); }}
      title={disabled ? 'Abra um documento para exportar' : 'Exportar documento ou diagrama'}
    >
      <Icon name="export" /><span>Exportar</span>
    </summary>
    <div className="export-popover" aria-label="Opções de exportação">
      <div className="export-popover-heading"><strong>Exportar</strong><span>Somente o arquivo ou diagrama</span></div>
      <button type="button" className="export-option" disabled={disabled || working !== null} onClick={() => { void runExport('source'); }}>
        <Icon name="code" /><span><strong>Código PlantUML</strong><small>.puml original</small></span>
      </button>
      <button type="button" className="export-option" disabled={diagramDisabled || working !== null} onClick={() => { void runExport('svg'); }}>
        <Icon name="image" /><span><strong>Diagrama SVG</strong><small>Vetor sanitizado</small></span>
      </button>
      <div className="png-export-row">
        <button type="button" className="export-option" disabled={diagramDisabled || working !== null} onClick={() => { void runExport('png'); }}>
          <Icon name="image" /><span><strong>{working === 'png' ? 'Gerando PNG…' : 'Diagrama PNG'}</strong><small>Imagem em escala</small></span>
        </button>
        <label>Escala<select aria-label="Escala do PNG" value={pngScale} onChange={event => setPngScale(Number(event.target.value) as PngScale)}>
          <option value={1}>1×</option><option value={2}>2×</option><option value={3}>3×</option><option value={4}>4×</option>
        </select></label>
      </div>
      {diagramDisabled && <p className="export-hint">Renderize um diagrama válido para exportar SVG ou PNG.</p>}
      {error && <p className="export-error" role="alert">{error}</p>}
    </div>
  </details>;
}
