export interface AttemptInfoDto {
  attemptId: string;
  username: string;
  status: string;
  score: number;
  maxScore: number;
  startedAt: string;
  finishedAt: string | null;
  questTitle: string;
}

export interface AuthorAnalyticsDto {
  totalQuests: number;
  totalSessions: number;
  totalAttempts: number;
  completedAttempts: number;
  averageScorePercent: number | null;
  recentAttempts: AttemptInfoDto[];
}
