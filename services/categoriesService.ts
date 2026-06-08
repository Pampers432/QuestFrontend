export interface Category {
  id: string;
  name: string;
  description?: string;
}

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240"}/api/Category`;

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error("Ошибка загрузки категорий");
  return await res.json();
};

export const createCategory = async (category: { name: string; description?: string }): Promise<Category> => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(category)
  });
   
  if (!res.ok) {
    let errorMessage = "Ошибка создания категории";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return await res.json();
};

export const updateCategory = async (id: string, category: { name: string; description?: string }): Promise<Category> => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(category)
  });
   
  if (!res.ok) {
    let errorMessage = "Ошибка обновления категории";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return await res.json();
};

export const deleteCategory = async (id: string): Promise<void> => {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Токен авторизации не найден. Пожалуйста, войдите в систему.");
  }

  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
   
  if (!res.ok) {
    let errorMessage = "Ошибка удаления категории";
    try {
      const error = await res.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = `Ошибка ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }
   
  try {
    await res.json();
  } catch {
    // Игнорируем, если ответ пустой
  }
};
