export interface AudioFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  duration: number;
  url: string;
}

export interface VocalTrack {
  id: string;
  name: string;
  type: 'male' | 'female';
  url: string;
  duration: number;
  confidence: number;
}

export type ProcessingStep = 'upload' | 'processing' | 'replace' | 'preview';