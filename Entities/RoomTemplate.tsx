import { QuestionPosition } from "./QuestionPosition";

export interface RoomTemplate{
    id?: string | null;
    name: string;
    sceneData: QuestionPosition[];
    previewImage: File | null;
}