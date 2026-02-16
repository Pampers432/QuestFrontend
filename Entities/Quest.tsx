import { QuestRoom } from "./QuestRoom";

export interface Quest {
  id: string;

  title: string;
  description?: string | null;

  subject: string;
  difficulty: string;

  authorId: string;
  status: string;

  questRooms: QuestRoom[];
}