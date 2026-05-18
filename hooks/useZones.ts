import { useCallback, useState } from "react";
import { QuestionPosition } from "@/Entities/QuestionPosition";

export function useZones(initial: QuestionPosition[]) {
  const [zones, setZones] = useState(initial);

  const addZone = useCallback(() => {
    setZones((prev) => {
      const newIndex = prev.length;
      return [...prev, { name: `Объект${newIndex}`, x: 100, y: 100, w: 150, h: 150 }];
    });
  }, []);

  const updateZone = useCallback((index: number, data: Partial<QuestionPosition>) => {
    setZones((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...data };
      return copy;
    });
  }, []);

  const removeZone = useCallback((index: number) => {
    setZones((prev) => prev.filter((_, zoneIndex) => zoneIndex !== index));
  }, []);

  const resetZones = useCallback((nextZones: QuestionPosition[]) => {
    setZones(nextZones);
  }, []);

  const printZones = useCallback(() => {
    console.log(JSON.stringify(zones, null, 2));
  }, [zones]);

  return { zones, addZone, updateZone, removeZone, resetZones, printZones };
}
