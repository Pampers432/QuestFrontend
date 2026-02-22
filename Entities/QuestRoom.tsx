import { Question } from "./Question";
import { RoomTemplate } from "./RoomTemplate";

export interface QuestRoom {
  id?: string | null;
  questId: string;
  roomTemplateId: string;

  title?: string | null;
  orderIndex: number;

  roomTemplate: RoomTemplate;
  questions: Question[];
}