import { QuestionPosition } from "./QuestionPosition";

export interface RoomTemplate{
    [x: string]: any;
    id?: string | null;
    name: string;
    sceneData: QuestionPosition[];
    previewImageUrl: string;
}