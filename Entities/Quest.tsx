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

  // "Public" / "Private"
  visibility?: "Public" | "Private";

  categoryId?: string;
  category?: Category;

  questRooms: QuestRoom[];
}
