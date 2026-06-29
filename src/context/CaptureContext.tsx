import React, { createContext, useContext, useMemo, useState } from 'react';
import { AnalysisMode, AnalysisResult } from '../services/ai/types';

export interface CapturedPhoto {
  uri: string;
  base64: string;
  mimeType: string;
  width?: number;
  height?: number;
}

interface CaptureContextValue {
  photo: CapturedPhoto | null;
  setPhoto: (p: CapturedPhoto | null) => void;
  mode: AnalysisMode | null;
  setMode: (m: AnalysisMode | null) => void;
  result: AnalysisResult | null;
  setResult: (r: AnalysisResult | null) => void;
  reset: () => void;
}

const CaptureContext = createContext<CaptureContextValue | null>(null);

export function CaptureProvider({ children }: { children: React.ReactNode }) {
  const [photo, setPhoto] = useState<CapturedPhoto | null>(null);
  const [mode, setMode] = useState<AnalysisMode | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const value = useMemo<CaptureContextValue>(
    () => ({
      photo,
      setPhoto,
      mode,
      setMode,
      result,
      setResult,
      reset: () => {
        setPhoto(null);
        setMode(null);
        setResult(null);
      },
    }),
    [photo, mode, result]
  );

  return (
    <CaptureContext.Provider value={value}>{children}</CaptureContext.Provider>
  );
}

export function useCapture(): CaptureContextValue {
  const ctx = useContext(CaptureContext);
  if (!ctx) throw new Error('useCapture must be used within CaptureProvider');
  return ctx;
}
