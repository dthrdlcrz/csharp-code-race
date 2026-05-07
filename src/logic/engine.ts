import { HardSnippets, CodeSnippet } from './csharp-snippets';

export type ObstacleType = 'NULL_REF' | 'UNRESOLVED_REF' | 'DEADLOCK' | 'GARBAGE_COLLECTION';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD';

export const DIFFICULTY_THRESHOLDS: Record<Difficulty, number> = {
  EASY: 50,
  NORMAL: 70,
  HARD: 90
};

export interface SnippetStat {
  wpm: number;
  accuracy: number;
  errors: number;
  timeTaken: number;
}

export interface GameState {
  currentSnippetIndex: number;
  snippetInputs: string[];
  snippetStats: (SnippetStat | null)[]; // Results for completed files
  showSnippetResult: boolean;
  startTime: number | null;
  endTime: number | null;
  wpm: number;
  accuracy: number;
  progress: number;
  activeObstacle: ObstacleType | null;
  obstacleEndTime: number | null;
  obstacleMetadata?: any; // For bug-specific state
  isGameOver: boolean;
  totalErrors: number;
  totalKeyPresses: number;
  snippetStartTime: number | null; // Track start time for CURRENT snippet
  snippetErrors: number; // Errors for CURRENT snippet
  snippetKeyPresses: number; // Key presses for CURRENT snippet
  focusTrigger: number; // Increment to force focus
  difficulty: Difficulty;
  enabledObstacles: ObstacleType[];
  timerTick: number; // For forcing re-renders during active bugs
}

export const getBugDuration = (bug: ObstacleType, difficulty: Difficulty): number => {
  const multipliers: Record<Difficulty, number> = { EASY: 0.8, NORMAL: 1, HARD: 1.5 };
  const base: Record<ObstacleType, number> = {
    DEADLOCK: 3000,
    NULL_REF: 11000,
    UNRESOLVED_REF: 6000,
    GARBAGE_COLLECTION: 10000
  };
  return Math.floor(base[bug] * multipliers[difficulty]);
};

export const initialGameState: GameState = {
  currentSnippetIndex: 0,
  snippetInputs: new Array(12).fill(''), 
  snippetStats: new Array(12).fill(null),
  showSnippetResult: false,
  startTime: null,
  endTime: null,
  wpm: 0,
  accuracy: 100,
  progress: 0,
  activeObstacle: null,
  obstacleEndTime: null,
  obstacleMetadata: null,
  isGameOver: false,
  totalErrors: 0,
  totalKeyPresses: 0,
  snippetStartTime: null,
  snippetErrors: 0,
  snippetKeyPresses: 0,
  focusTrigger: 0,
  difficulty: 'NORMAL',
  enabledObstacles: ['NULL_REF', 'UNRESOLVED_REF', 'DEADLOCK', 'GARBAGE_COLLECTION'],
  timerTick: 0,
};

export function calculateWPM(userInput: string, startTime: number, now: number): number {
  const minutes = (now - startTime) / 60000;
  if (minutes <= 0) return 0;
  const words = userInput.length / 5;
  return Math.floor(words / minutes);
}

export function calculateAccuracy(totalKeyPresses: number, totalErrors: number): number {
  // If we have errors, we must have had at least that many keypresses.
  // Ensure we don't have negative numbers if keypresses were reset incorrectly.
  const safeKeyPresses = Math.max(totalKeyPresses, totalErrors);
  if (safeKeyPresses === 0) return 100;
  const correctPresses = safeKeyPresses - totalErrors;
  return Math.max(0, Math.floor((correctPresses / safeKeyPresses) * 100));
}

export function getNextObstacle(): ObstacleType {
  const obstacles: ObstacleType[] = ['NULL_REF', 'UNRESOLVED_REF', 'DEADLOCK', 'GARBAGE_COLLECTION'];
  return obstacles[Math.floor(Math.random() * obstacles.length)];
}

export const generateRandomSnippet = (): CodeSnippet => {
  const code = HardSnippets[Math.floor(Math.random() * HardSnippets.length)];
  return {
    id: `rand-${Date.now()}`,
    title: 'Hard Randomized Sample',
    difficulty: 'HARD',
    language: 'csharp',
    code
  };
};
