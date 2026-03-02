import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, Users, ShieldAlert } from "lucide-react";
import { useAdminLogout } from "@/hooks/use-auth";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const logout = useAdminLogout();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLocation("/admin/login");
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-white/10 bg-white/[0.02] backdrop-blur-2xl flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <ShieldAlert className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">EMR Admin</h2>
              <p className="text-xs text-white/40">Secure Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all cursor-not-allowed opacity-50">
            <Users className="w-5 h-5" />
            <span className="font-medium">Settings (Soon)</span>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
