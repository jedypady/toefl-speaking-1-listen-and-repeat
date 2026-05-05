export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  READY = 'READY',
  LISTENING = 'LISTENING',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  FINISHED = 'FINISHED',
}

export interface Sentence {
  text: string;
  duration: number; // in seconds
}

export interface Scenario {
  introduction: string;
  speakerGender: 'male' | 'female';
  sentences: Sentence[];
}

export interface ScoreData {
  score: number;
  justification: string;
}

export interface UserResponse {
  transcript: string;
  scoreData: ScoreData | null;
}