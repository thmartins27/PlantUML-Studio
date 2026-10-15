'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchContentRef,
} from 'react-zoom-pan-pinch';
import { IconButton } from './button';

interface InteractiveCanvasProps {
  svgUrl: string;
  expanded: boolean;
  onToggleExpanded: () => void;
}

interface CanvasTransform {
  scale: number;
  positionX: number;
  positionY: number;
}

const MIN_SCALE = 0.1;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.2;
const TRANSITION_MS = 180;

export function InteractiveCanvas({ svgUrl, expanded, onToggleExpanded }: InteractiveCanvasProps) {
  const controlsRef = useRef<ReactZoomPanPinchContentRef>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pointerInside = useRef(false);
  const initialized = useRef(false);
  const latestTransform = useRef<CanvasTransform>({ scale: 1, positionX: 0, positionY: 0 });
  const [zoomPercent, setZoomPercent] = useState(100);
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const centerAt = useCallback((scale: number, animated = true) => {
    controlsRef.current?.centerView(scale, animated && !reducedMotion ? TRANSITION_MS : 0, 'easeOut');
  }, [reducedMotion]);

  const fitToScreen = useCallback(() => {
    const viewport = viewportRef.current;
    const image = imageRef.current;
    if (!viewport || !image || !image.naturalWidth || !image.naturalHeight) return;

    const horizontalRoom = Math.max(1, viewport.clientWidth - 64);
    const verticalRoom = Math.max(1, viewport.clientHeight - 112);
    const scale = Math.min(horizontalRoom / image.naturalWidth, verticalRoom / image.naturalHeight, 1);
    centerAt(Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale)));
  }, [centerAt]);

  const handleImageLoad = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (!initialized.current) {
        initialized.current = true;
        centerAt(1, false);
        return;
      }

      const { positionX, positionY, scale } = latestTransform.current;
      controlsRef.current?.setTransform(positionX, positionY, scale, 0);
    });
  }, [centerAt]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || !!target.closest('.monaco-editor');
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !pointerInside.current || isEditableTarget(event.target)) return;
      event.preventDefault();
      setSpaceHeld(true);
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space') return;
      setSpaceHeld(false);
    };
    const onBlur = () => setSpaceHeld(false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const moveWithKeyboard = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const delta = event.shiftKey ? 80 : 32;
    const current = latestTransform.current;
    controlsRef.current?.setTransform(
      current.positionX + (event.key === 'ArrowLeft' ? -delta : event.key === 'ArrowRight' ? delta : 0),
      current.positionY + (event.key === 'ArrowUp' ? -delta : event.key === 'ArrowDown' ? delta : 0),
      current.scale,
      100,
      'easeOut',
    );
  };

  return <>
    <div
      ref={viewportRef}
      className="interactive-canvas"
      data-panning={isPanning || undefined}
      data-space-held={spaceHeld || undefined}
      onPointerEnter={() => { pointerInside.current = true; }}
      onPointerLeave={() => { pointerInside.current = false; setSpaceHeld(false); }}
    >
      <TransformWrapper
        ref={controlsRef}
        minScale={MIN_SCALE}
        maxScale={MAX_SCALE}
        centerOnInit
        centerZoomedOut
        limitToBounds={false}
        smooth={!reducedMotion}
        wheel={{ step: 0.12, smoothStep: 0.002, touchPadDisabled: false }}
        pinch={{ step: 4 }}
        panning={{
          allowLeftClickPan: true,
          allowMiddleClickPan: true,
          allowRightClickPan: false,
          velocityDisabled: reducedMotion,
        }}
        doubleClick={{ disabled: true }}
        zoomAnimation={{ disabled: reducedMotion, animationTime: reducedMotion ? 0 : TRANSITION_MS }}
        alignmentAnimation={{ disabled: reducedMotion, animationTime: reducedMotion ? 0 : TRANSITION_MS }}
        velocityAnimation={{ disabled: reducedMotion }}
        onPanningStart={() => setIsPanning(true)}
        onPanningStop={() => setIsPanning(false)}
        onTransformed={(_, transform) => {
          latestTransform.current = transform;
          const nextPercent = Math.round(transform.scale * 100);
          setZoomPercent(current => current === nextPercent ? current : nextPercent);
        }}
      >
        <TransformComponent
          wrapperClass="canvas-transform-wrapper"
          contentClass="canvas-transform-content"
          wrapperProps={{
            tabIndex: 0,
            role: 'application',
            'aria-label': 'Canvas do diagrama. Use a roda ou gesto de pinça para zoom; arraste para mover; as setas também deslocam o diagrama.',
            onKeyDown: moveWithKeyboard,
            onAuxClick: event => { if (event.button === 1) event.preventDefault(); },
          }}
        >
          <figure className="diagram-figure">
            {/* SVG sanitizado pela API e isolado no contexto não executável de uma imagem. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              className="rendered-diagram"
              src={svgUrl}
              alt="Diagrama renderizado a partir do documento PlantUML ativo"
              draggable={false}
              onLoad={handleImageLoad}
            />
            <figcaption>SVG sanitizado · motor PlantUML local</figcaption>
          </figure>
        </TransformComponent>
      </TransformWrapper>
    </div>
    <div className="zoom-toolbar" role="group" aria-label="Controles do canvas">
      <IconButton icon="minus" label="Diminuir zoom" onClick={() => controlsRef.current?.zoomOut(ZOOM_STEP, reducedMotion ? 0 : TRANSITION_MS, 'easeOut')} />
      <output aria-label="Zoom atual" aria-live="polite">{zoomPercent}%</output>
      <IconButton icon="plus" label="Aumentar zoom" onClick={() => controlsRef.current?.zoomIn(ZOOM_STEP, reducedMotion ? 0 : TRANSITION_MS, 'easeOut')} />
      <span className="toolbar-divider" />
      <IconButton icon="reset" label="Resetar visualização" onClick={() => centerAt(1)} />
      <IconButton icon="fit" label="Ajustar diagrama à área visível" onClick={fitToScreen} />
      <span className="toolbar-divider" />
      <IconButton icon={expanded ? 'fullscreenExit' : 'fullscreen'} label={expanded ? 'Sair da visualização em tela cheia (F11)' : 'Expandir visualização em tela cheia (F11)'} onClick={onToggleExpanded} />
    </div>
  </>;
}
