export type LevelConfig = {
  durationSec: number;
  forkEverySec: number;
  lanes: 2 | 3;
  allowedTypes: Array<'meaning'>; // на MVP только meaning
  lives: number;
};

export type RunSummary = {
  packId: string;
  score: number;
  accuracy: number; // 0..1
  errors: Array<{ lexemeId: string; sample?: string }>;
  durationPlayedSec: number;
  seed: string;
  level: LevelConfig;
};
