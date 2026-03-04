export interface Category {
  id: string;
  name: string;
  description?: string;
}

const API_BASE_URL = "https://localhost:7240/api/Category";

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error("Ошибка загрузки категорий");
  return await res.json();
};

export const createCategory = async (category: { name: string; description?: string }): Promise<Category> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(category)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Ошибка создания категории");
  }
  return await res.json();
};

export const updateCategory = async (id: string, category: { name: string; description?: string }): Promise<Category> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(category)
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Ошибка обновления категории");
  }
  return await res.json();
};

export const deleteCategory = async (id: string): Promise<void> => {
  const token = localStorage.getItem("auth_token");
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error("Ошибка удаления категории");
};

