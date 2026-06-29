import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeImage } from '../services/ai/visionService';
import { AnalysisMode, AnalysisResult } from '../services/ai/types';
import { useSettings } from '../context/SettingsContext';
import { useCapture, CapturedPhoto } from '../context/CaptureContext';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface State {
  status: Status;
  result: AnalysisResult | null;
  error: string | null;
  retry: () => void;
}

/**
 * Runs a full vision analysis for the current captured photo + mode.
 * Caches the result into CaptureContext so navigating back/forward is free.
 */
export function useAnalysis(mode: AnalysisMode): State {
  const { config } = useSettings();
  const { photo, result, setResult } = useCapture();
  const [status, setStatus] = useState<Status>(result ? 'success' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const runId = useRef(0);

  const run = useCallback(
    async (image: CapturedPhoto) => {
      const id = ++runId.current;
      setStatus('loading');
      setError(null);
      try {
        const res = await analyzeImage(
          {
            base64: image.base64,
            mimeType: image.mimeType,
            width: image.width,
            height: image.height,
          },
          mode,
          config
        );
        if (id !== runId.current) return; // stale
        setResult(res);
        setStatus('success');
      } catch (e: any) {
        if (id !== runId.current) return;
        setError(e?.message ?? 'Something went wrong during analysis.');
        setStatus('error');
      }
    },
    [config, mode, setResult]
  );

  useEffect(() => {
    // Only run once per mount unless we have no cached result.
    if (photo && !result && status === 'idle') {
      run(photo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = useCallback(() => {
    if (photo) run(photo);
  }, [photo, run]);

  return { status, result, error, retry };
}
