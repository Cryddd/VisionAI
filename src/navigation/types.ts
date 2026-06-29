import { AnalysisMode } from '../services/ai/types';

export type RootStackParamList = {
  Landing: undefined;
  Camera: undefined;
  Preview: undefined;
  Results: { mode: AnalysisMode };
};
