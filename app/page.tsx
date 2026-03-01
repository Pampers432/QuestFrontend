"use client";

import { useState } from "react";
import RoleGuard from "@/components/RoleGuard";
import { useZones } from "@/hooks/useZones";
import { useDragResize } from "@/hooks/useDragResize";
import { EditorPanel } from "@/components/EditorPanel";
import { EditorCanvas } from "@/components/EditorCanvas";

export default function Home() {
  const { zones, addZone, updateZone, printZones } = useZones([
      { name: "Door", x: 100, y: 150, w: 200, h: 350 },
      { name: "obj1", x: 350, y: 140, w: 120, h: 380 }
  ]);

  const drag = useDragResize(zones, updateZone);

  const [templateName, setTemplateName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("/room.png");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const saveTemplate = () => {
    console.log("Saving...");
  };

  return (
    <RoleGuard
      allowedRoles={["Admin"]}
      fallbackMessage="Только администратор может добавлять шаблоны."
    >
      <div>
      <EditorPanel
        templateName={templateName}
        setTemplateName={setTemplateName}
        addZone={addZone}
        saveTemplate={saveTemplate}
        printZones={printZones}
        handleFileChange={handleFileChange}
      />

      <EditorCanvas previewUrl={previewUrl} zones={zones} drag={drag} />
      </div>
    </RoleGuard>
  );
}
