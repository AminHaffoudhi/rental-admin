import { useEffect } from "react";
import * as authService from "@/services/auth.service";
import { identifyAdmin, logoutOneSignal } from "@/lib/onesignal";
import { useAuthStore } from "@/store/authStore";

export function useAdminAuth() {
  const admin = useAuthStore((s) => s.admin);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (admin?.id) {
      void identifyAdmin(admin.id).catch(() => {});
    }
  }, [admin?.id]);

  async function login(email: string, password: string) {
    const { user, token } = await authService.login(email, password);
    setAuth(user, token);
  }

  function logout() {
    void logoutOneSignal().catch(() => {});
    clearAuth();
  }

  return {
    admin,
    isAuthenticated,
    login,
    logout,
  };
}
