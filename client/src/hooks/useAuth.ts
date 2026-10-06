import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { setCsrfToken } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Persist the CSRF token returned by the server so all mutations can use it.
  useEffect(() => {
    setCsrfToken((user as any)?.csrfToken ?? null);
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
