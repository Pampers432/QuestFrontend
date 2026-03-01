"use client";

import { ReactNode } from "react";
import { getStoredRole, UserRole } from "@/utils/auth";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallbackMessage?: string;
};

export default function RoleGuard({ allowedRoles, children, fallbackMessage }: RoleGuardProps) {
  const role = getStoredRole();

  if (!role) {
    return <div>Для доступа необходимо войти в аккаунт.</div>;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div>
        {fallbackMessage || "Недостаточно прав для просмотра этой страницы."}
      </div>
    );
  }

  return <>{children}</>;
}
