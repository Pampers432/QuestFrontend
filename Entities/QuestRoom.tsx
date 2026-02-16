import { Question } from "./Question";

export interface QuestRoom {
  id?: string | null;
  questId: string;
  roomTemplateId: string;

  title?: string | null;
  orderIndex: number;

  questions: Question[];
}