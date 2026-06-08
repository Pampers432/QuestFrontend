import { AuthResponse, LoginRequest, RegisterRequest } from "@/Entities/Auth";

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:7240"}/api/auth`;

const parseError = async (res: Response): Promise<string> => {
  try {
    const data = await res.json();
    if (typeof data === "string") return data;
    return data.message || "Ошибка запроса";
  } catch {
    return "Ошибка запроса";
  }
};

export const loginUser = async (payload: LoginRequest): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return await res.json();
};

export const registerUser = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return await res.json();
};
