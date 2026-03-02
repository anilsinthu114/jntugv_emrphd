import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldAlert, Loader2, Lock } from "lucide-react";
import { useAdminLogin } from "@/hooks/use-auth";
import { api, type AdminLoginInput } from "@shared/routes";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const { register, handleSubmit, formState: { errors } } = useForm<AdminLoginInput>({
    resolver: zodResolver(api.auth.adminLogin.input),
  });

  const { mutate: login, isPending } = useAdminLogin();

  const onSubmit = (data: AdminLoginInput) => {
    login(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#05050A]" />
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md p-8 sm:p-10 glass-panel rounded-3xl"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-white/50 text-sm">Sign in to manage EMR applications</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Username</label>
            <input 
              {...register("username")} 
              className="glass-input" 
              placeholder="admin" 
            />
            {errors.username && <p className="text-red-400 text-xs mt-2">{errors.username.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <input 
              type="password"
              {...register("password")} 
              className="glass-input" 
              placeholder="••••••••" 
            />
            {errors.password && <p className="text-red-400 text-xs mt-2">{errors.password.message}</p>}
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full py-3.5 bg-white text-black hover:bg-indigo-50 font-bold rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center space-x-2 disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>Secure Sign In</span>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center text-xs text-white/30 space-x-2">
          <ShieldAlert className="w-4 h-4" />
          <span>Protected Area. Unauthorized access prohibited.</span>
        </div>
      </motion.div>
    </div>
  );
}
