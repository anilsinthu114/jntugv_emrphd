import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AdminLoginInput } from "@shared/routes";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useAdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AdminLoginInput) => {
      const validated = api.auth.adminLogin.input.parse(data);
      const res = await fetch(api.auth.adminLogin.path, {
        method: api.auth.adminLogin.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid username or password");
        }
        throw new Error("Failed to login");
      }

      const responseData = await res.json();
      return api.auth.adminLogin.responses[200].parse(responseData);
    },
    onSuccess: (data) => {
      localStorage.setItem("adminToken", data.token);
      queryClient.clear(); // Clear any existing cached data on new login
      toast({
        title: "Welcome back",
        description: "Successfully logged into the admin dashboard.",
      });
      setLocation("/admin/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAdminLogout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem("adminToken");
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been securely logged out.",
    });
    setLocation("/admin/login");
  };
}
