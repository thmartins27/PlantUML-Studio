'use client';

import { useEffect, useRef, useState } from 'react';
import type { ProjectFile, RenderFailure } from '@plantuml-studio/shared';
import { asRenderFailure, requestRender } from './render-client';

export type RenderPreviewState =
  | { status: 'empty'; svg: null; error: null; durationMs: null }
  | { status: 'loading'; svg: string | null; error: null; durationMs: number | null }
  | { status: 'success'; svg: string; error: null; durationMs: number }
  | { status: 'error'; svg: string | null; error: RenderFailure['error']; durationMs: number | null };

const emptyState: RenderPreviewState = { status: 'empty', svg: null, error: null, durationMs: null };

export function useRenderPreview(
  documentId: string | null,
  source: string | null,
  theme: 'dark' | 'light',
  project?: { entryPath: string; files: ProjectFile[] },
) {
  const [state, setState] = useState<RenderPreviewState>(emptyState);
  const [revision, setRevision] = useState(0);
  const lastValidByDocument = useRef(new Map<string, { svg: string; durationMs: number }>());
  const requestSequence = useRef(0);

  useEffect(() => {
    const sequence = ++requestSequence.current;
    if (!documentId || !source?.trim()) {
      const emptyTimer = window.setTimeout(() => setState(emptyState), 0);
      return () => window.clearTimeout(emptyTimer);
    }

    const cacheKey = `${documentId}:${theme}`;
    const previous = lastValidByDocument.current.get(cacheKey);
    const loadingTimer = window.setTimeout(() => {
      setState({ status: 'loading', svg: previous?.svg ?? null, error: null, durationMs: previous?.durationMs ?? null });
    }, 0);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void requestRender(source, theme, controller.signal, project).then(result => {
        if (sequence !== requestSequence.current) return;
        lastValidByDocument.current.set(cacheKey, { svg: result.svg, durationMs: result.durationMs });
        setState({ status: 'success', svg: result.svg, error: null, durationMs: result.durationMs });
      }).catch((error: unknown) => {
        if (controller.signal.aborted || sequence !== requestSequence.current) return;
        const failure = asRenderFailure(error);
        setState({
          status: 'error',
          svg: previous?.svg ?? null,
          error: failure.error,
          durationMs: previous?.durationMs ?? null,
        });
      });
    }, 400);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(loadingTimer);
      controller.abort();
    };
  }, [documentId, source, theme, project, revision]);

  return { state, renderNow: () => setRevision(value => value + 1) };
}
