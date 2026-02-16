import { AnswerOption } from "./AnswerOption";

export interface Question {
  id?: string | null;
  questRoomId: string;

  targetObject?: string | null; // зона в комнате
  type: string;
  text: string;

  attachment?: string | null;
  points: number;
  hint?: string | null;

  orderIndex: number;

  answerOptions: AnswerOption[];
}