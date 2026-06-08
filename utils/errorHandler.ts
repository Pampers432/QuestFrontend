export class AppError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public type?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("unauthorized") || msg.includes("401")) return "Необходимо авторизоваться.";
    if (msg.includes("forbidden") || msg.includes("403")) return "У вас нет прав для этого действия.";
    if (msg.includes("not found") || msg.includes("404")) return "Запрашиваемый ресурс не найден.";
    if (msg.includes("validation") || msg.includes("400")) return "Проверьте правильность введённых данных.";
    if (msg.includes("network") || msg.includes("fetch")) return "Ошибка соединения с сервером. Проверьте подключение.";
    return error.message;
  }
  return "Произошла неизвестная ошибка.";
};

export const handleApiError = async (response: Response): Promise<never> => {
  let message = "Ошибка сервера. Попробуйте позже.";
  try {
    const body = await response.json();
    if (body.error) message = body.error;
    if (body.title) message = body.title;
  } catch {
    try {
      message = await response.text();
    } catch {}
  }
  throw new AppError(message, response.status);
};

export const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) await handleApiError(res);
  return res;
};
