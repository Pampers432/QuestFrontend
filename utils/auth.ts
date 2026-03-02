export type UserRole = "Student" | "Teacher" | "Admin";

const ROLE_STORAGE_KEY = "auth_role";

const normalizeRole = (role?: string | null): UserRole | null => {
  if (!role) return null;

  const normalized = role.trim().toLowerCase();

  if (normalized === "admin") return "Admin";
  if (normalized === "teacher") return "Teacher";
  if (normalized === "student" || normalized === "user") return "Student";

  return null;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);

    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const readRoleFromToken = (token?: string): UserRole | null => {
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const roleClaim =
    payload.role ||
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  if (typeof roleClaim === "string") {
    return normalizeRole(roleClaim);
  }

  if (Array.isArray(roleClaim) && typeof roleClaim[0] === "string") {
    return normalizeRole(roleClaim[0]);
  }

  return null;
};

export const setStoredRole = (role: string | null | undefined) => {
  if (typeof window === "undefined") return;

  const normalized = normalizeRole(role);

  if (!normalized) {
    localStorage.removeItem(ROLE_STORAGE_KEY);
    return;
  }

  localStorage.setItem(ROLE_STORAGE_KEY, normalized);
  notifyRoleChanged();
};

export const getStoredRole = (): UserRole | null => {
  if (typeof window === "undefined") return null;

  const savedRole = normalizeRole(localStorage.getItem(ROLE_STORAGE_KEY));
  if (savedRole) return savedRole;

  const tokenRole = readRoleFromToken(localStorage.getItem("auth_token") || undefined);
  if (tokenRole) {
    localStorage.setItem(ROLE_STORAGE_KEY, tokenRole);
    return tokenRole;
  }

  return null;
};

export const clearAuthStorage = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("auth_token");
  localStorage.removeItem(ROLE_STORAGE_KEY);
};

export const canUseTemplates = (role: UserRole | null) => role === "Teacher" || role === "Admin";

export const canManageTemplates = (role: UserRole | null) => role === "Admin";

export const notifyRoleChanged = () => {
  window.dispatchEvent(new Event("roleChanged"));
};

