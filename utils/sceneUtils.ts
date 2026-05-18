import { QuestionPosition } from "@/Entities/QuestionPosition";

export const calculateDoorCount = (scene: QuestionPosition[]) =>
  scene.filter(obj => obj.name.toLowerCase() === "door" || obj.name.toLowerCase() === "дверь").length;

export const calculateZonesCount = (scene: QuestionPosition[]) =>
  scene.length - calculateDoorCount(scene);
