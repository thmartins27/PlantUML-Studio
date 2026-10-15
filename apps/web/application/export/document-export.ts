import type { StudioDocument } from '../../components/studio/demo-data';

export type PngScale = 1 | 2 | 3 | 4;

const MAX_PNG_DIMENSION = 16_384;
const MAX_PNG_AREA = 67_108_864;

export class DocumentExportError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DocumentExportError';
  }
}

export function exportPlantUmlSource(document: StudioDocument) {
  downloadBlob(new Blob([document.content], { type: 'text/plain;charset=utf-8' }), withExtension(document.name, 'puml'));
}

export function exportSvg(svg: string, documentName: string) {
  if (!svg.trim()) throw new DocumentExportError('Não há SVG válido para exportar.');
  downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), withExtension(documentName, 'svg'));
}

export async function exportPng(svg: string, documentName: string, scale: PngScale) {
  if (!svg.trim()) throw new DocumentExportError('Não há SVG válido para exportar.');
  const sourceUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = await loadImage(sourceUrl);
    const width = Math.round(image.naturalWidth * scale);
    const height = Math.round(image.naturalHeight * scale);
    if (!width || !height) throw new DocumentExportError('O SVG não informou dimensões válidas para o PNG.');
    if (width > MAX_PNG_DIMENSION || height > MAX_PNG_DIMENSION || width * height > MAX_PNG_AREA) {
      throw new DocumentExportError(`O PNG em ${scale}× excede o limite seguro de exportação.`);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new DocumentExportError('O navegador não conseguiu preparar a exportação PNG.');
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, width, height);
    const png = await canvasBlob(canvas);
    downloadBlob(png, withExtension(documentName, 'png'));
  } catch (error: unknown) {
    if (error instanceof DocumentExportError) throw error;
    throw new DocumentExportError('Não foi possível converter o SVG para PNG.', { cause: error });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new DocumentExportError('Não foi possível ler o SVG para exportação.'));
    image.src = url;
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new DocumentExportError('O navegador não conseguiu gerar o PNG.')), 'image/png');
  });
}

function downloadBlob(blob: Blob, filename: string) {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  } catch (error: unknown) {
    throw new DocumentExportError('O navegador bloqueou o download do arquivo.', { cause: error });
  }
}

function withExtension(filename: string, extension: 'puml' | 'svg' | 'png') {
  const base = filename.replace(/\.(?:puml|plantuml|pu)$/i, '') || 'diagrama';
  return `${base}.${extension}`;
}
