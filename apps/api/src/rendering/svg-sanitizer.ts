import sanitizeHtml from 'sanitize-html';

const safeStyleValue = /^(?!.*(?:url\s*\(|expression\s*\(|@import|javascript:))[-#(),.%\w\s'\"]+$/i;

const svgTags = [
  'svg', 'g', 'defs', 'desc', 'title', 'path', 'rect', 'line', 'polyline',
  'polygon', 'circle', 'ellipse', 'text', 'tspan', 'marker', 'clipPath',
];

const svgAttributes = [
  'xmlns', 'viewBox', 'width', 'height', 'x', 'y', 'x1', 'x2', 'y1', 'y2',
  'cx', 'cy', 'r', 'rx', 'ry', 'd', 'points', 'transform', 'fill', 'fill-opacity',
  'stroke', 'stroke-width', 'stroke-opacity', 'stroke-dasharray', 'stroke-linecap',
  'stroke-linejoin', 'font-family', 'font-size', 'font-style', 'font-weight',
  'text-anchor', 'dominant-baseline', 'opacity', 'id', 'class', 'role',
  'aria-label', 'preserveAspectRatio', 'marker-start', 'marker-mid', 'marker-end',
  'markerWidth', 'markerHeight', 'markerUnits', 'orient', 'refX', 'refY',
  'clip-path', 'style', 'textLength', 'lengthAdjust',
];

const safeStyles = [
  'color', 'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'font-family',
  'font-size', 'font-style', 'font-weight', 'text-anchor', 'opacity',
];

export function sanitizeSvg(svg: string): string {
  const sanitized = sanitizeHtml(svg, {
    allowedTags: svgTags,
    allowedAttributes: { '*': svgAttributes },
    allowedStyles: {
      '*': Object.fromEntries(safeStyles.map(property => [property, [safeStyleValue]])),
    },
    allowVulnerableTags: false,
    parser: {
      lowerCaseTags: false,
      lowerCaseAttributeNames: false,
    },
  }).trim();

  if (!sanitized.startsWith('<svg') || !sanitized.endsWith('</svg>')) {
    throw new Error('Renderer response is not a valid SVG document');
  }

  return sanitized;
}
