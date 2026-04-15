export interface CreateQuestRequest {
  title: string;
  description?: string;
  subject: string;
  difficulty: string;
  status: string;
  categoryId?: string;

  rooms: CreateQuestRoomRequest[];
}

export interface CreateQuestRoomRequest {
  roomTemplateId: string;
  title?: string;
  orderIndex: number;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  text: string;
  type: string;
  points: number;
  hint?: string;
  targetObject?: string;
  orderIndex: number;
  answerOptions: CreateAnswerOptionRequest[];
}

export interface CreateAnswerOptionRequest {
  text?: string;
  isCorrect?: boolean;
  orderIndex: number;
}