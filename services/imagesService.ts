const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240";

export const uploadImage = async (file: File): Promise<string> => {
  const token = localStorage.getItem("auth_token");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/Images/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Ошибка загрузки" }));
    throw new Error(err.error || "Ошибка загрузки изображения");
  }

  const data = await res.json();
  return data.url;
};
