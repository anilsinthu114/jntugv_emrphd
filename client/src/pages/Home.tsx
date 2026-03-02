import { PublicLayout } from "@/components/layout/PublicLayout";
import { Link } from "wouter";
import { ArrowRight, BookOpen, CheckCircle2, FileText, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const feeStructure = [
    { label: "Registration Fee", amount: "₹5,000", icon: FileText },
    { label: "Admission Fee", amount: "₹5,000", icon: CheckCircle2 },
    { label: "Tuition Fee (Per Annum)", amount: "₹50,000", icon: BookOpen },
  ];

  return (
    <PublicLayout>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-16 py-12 lg:py-24">
        
        {/* Left: Hero Copy */}
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass-panel border-indigo-500/30 text-indigo-300 text-sm font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Admissions Open for 2024-25</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-display leading-[1.1]">
            Advance Your Research Career with <br />
            <span className="text-gradient-primary">EMR Ph.D</span>
          </h1>

          <p className="text-lg text-white/60 max-w-xl leading-relaxed">
            Join the Extra-Mural Research programme to collaborate with top-tier 
            institutions. Seamlessly register, upload your documents, and track your admission status.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link href="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-indigo-50 rounded-2xl font-bold text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300 flex items-center justify-center space-x-2 group">
                <span>Start Registration</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <p className="text-sm text-white/40 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span>Takes 5 minutes</span>
            </p>
          </div>
        </div>

        {/* Right: Glass Card Fee Structure */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all duration-500 group-hover:bg-indigo-500/20" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 mb-6">
                <IndianRupee className="w-7 h-7 text-indigo-400" />
              </div>
              
              <h3 className="text-2xl font-display text-white mb-2">Fee Structure</h3>
              <p className="text-white/50 mb-8 text-sm">Please ensure payments are made prior to document upload.</p>

              <div className="space-y-4">
                {feeStructure.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-indigo-400" />
                      <span className="text-white/80 font-medium">{item.label}</span>
                    </div>
                    <span className="font-bold text-white font-display tracking-wide">{item.amount}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-sm flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Keep your fee receipt ready in PDF format before starting the registration.</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </PublicLayout>
  );
}

// Temporary inline import since it was missing above
import { ShieldAlert } from "lucide-react";
