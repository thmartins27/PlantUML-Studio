import { useState, type PointerEvent } from 'react';

interface SplitHandleProps {
  label: string;
  controls: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
  fromPointer: (clientX: number) => number;
  className?: string;
}
export function SplitHandle({ label, controls, value, min, max, step, unit, onChange, fromPointer, className = '' }: SplitHandleProps) {
  const [dragging, setDragging] = useState(false);
  const update = (next: number) => onChange(Math.round(Math.min(max, Math.max(min, next))));
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
  };
  return <div className={`split-handle ${className}`} role="separator" tabIndex={0} aria-label={label} aria-orientation="vertical" aria-controls={controls} aria-valuemin={min} aria-valuemax={max} aria-valuenow={value} aria-valuetext={`${value}${unit}`} data-dragging={dragging}
    onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); event.currentTarget.focus(); event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); }}
    onPointerMove={event => { if (event.currentTarget.hasPointerCapture(event.pointerId)) update(fromPointer(event.clientX)); }}
    onPointerUp={release} onPointerCancel={release} onLostPointerCapture={() => setDragging(false)}
    onKeyDown={event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      update(event.key === 'Home' ? min : event.key === 'End' ? max : value + (event.key === 'ArrowLeft' ? -step : step));
    }}><span /></div>;
}
