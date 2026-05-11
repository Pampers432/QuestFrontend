import { useEffect, useState } from "react";
import { fetchTemplateRenames } from "@/services/templatesService";

export const useTemplateRenames = (templateId: string) => {
  const [renameMap, setRenameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRenames = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setRenameMap({});
          return;
        }

        const renames = await fetchTemplateRenames(templateId);
        const map: Record<string, string> = {};
        renames.forEach(r => {
          map[r.systemKey] = r.displayName;
        });
        setRenameMap(map);
      } catch (error) {
        console.error("Failed to fetch renames:", error);
        setRenameMap({});
      }
    };

    if (templateId) {
      loadRenames();
    }
  }, [templateId]);

  return renameMap;
};
