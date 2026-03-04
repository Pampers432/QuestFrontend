import { QuestRoom } from "./QuestRoom";

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Quest {
  id: string;

  title: string;
  description?: string | null;

  subject: string;
  difficulty: string;

  authorId: string;
  status: string;
  categoryId?: string;
  category?: Category;

  questRooms: QuestRoom[];
}