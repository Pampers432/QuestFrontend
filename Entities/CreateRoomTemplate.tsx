import { QuestionPosition } from "./QuestionPosition";

export interface CreateRoomTemplate{
    id?: string | null;
    name: string;
    sceneData: QuestionPosition[];
    previewImage: File | null;
}