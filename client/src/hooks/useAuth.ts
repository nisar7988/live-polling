import { useState, useEffect, useCallback } from "react";
import { authService, type UserProfile } from "../api/authService";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const data = await authService.getStatus();
      setIsAuthenticated(data.isAuthenticated);
      setUser(data.user);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();

    let interval: ReturnType<typeof setInterval>;
    if (!isAuthenticated) {
      interval = setInterval(checkAuthStatus, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated, checkAuthStatus]);

  const login = async () => {
    try {
      const data = await authService.getAuthUrl();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error getting auth URL:", error);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return { isAuthenticated, user, loading, login, logout, checkAuthStatus };
}
