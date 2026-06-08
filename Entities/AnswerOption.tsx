export interface AnswerOption {
  id?: string | null;
  questionId: string;

  text?: string | null;
  isCorrect?: boolean | null;

  matchPair?: string | null;
  sequenceOrder?: number | null;

  attachment?: string | null;

  orderIndex: number;
}