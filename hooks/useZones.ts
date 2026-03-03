import { useState } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

export function useZones(initial: QuestionPosition[]) {
  const [zones, setZones] = useState(initial);

  const addZone = () => {

    const newIndex = zones.length;
    setZones([
      ...zones,
      { name: `obj${newIndex}`, x: 100, y: 100, w: 150, h: 150 }
    ]);
  };

  const updateZone = (index: number, data: Partial<QuestionPosition>) => {
    setZones(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...data };
      return copy;
    });
  };

  const printZones = () => {
    console.log(JSON.stringify(zones, null, 2));
  };

  const removeZone = (index: number) => {
    setZones((prev) => prev.filter((_, zoneIndex) => zoneIndex !== index));
  };

  return { zones, addZone, updateZone, printZones, setZones, removeZone };
}
