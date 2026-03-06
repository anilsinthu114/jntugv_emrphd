import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useRegister() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(api.users.register.path, {
        method: api.users.register.method,
        // Omit Content-Type to let the browser set it automatically with the boundary for FormData
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 409) {
          throw new Error(errorData.message || "Email already registered");
        }
        if (res.status === 400) {
          throw new Error(errorData.message || "Validation failed");
        }
        throw new Error("Registration failed");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "Your Ph.D EMR application has been submitted.",
      });
      // Removing automatic redirect to root "/" to let the component render a success state instead.
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: [api.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.users.list.path, {
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        throw new Error("Unauthorized");
      }

      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      return api.users.list.responses[200].parse(data);
    },
    retry: false,
  });
}

export function useExportUsers() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.users.export.path, {
        method: api.users.export.method,
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error("Failed to export users");
      }

      // Handle binary response
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `EMR_Candidates_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "The user data has been downloaded.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
