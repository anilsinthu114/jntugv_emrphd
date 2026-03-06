import { ReactNode } from "react";
import { Link } from "wouter";
import { GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Sticky Glass Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <Link href="/" className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <img 
                  src="https://jntugv.edu.in/static/media/jntugvcev.b33bb43b07b2037ab043.jpg" 
                  alt="JNTUGV Logo"
                  className="w-full h-full object-contain bg-white p-1 group-hover:scale-110 transition-transform duration-300"

                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display font-bold text-lg leading-tight text-white group-hover:text-indigo-200 transition-colors">
                  Ph.D Programme
                </h1>
                <p className="text-xs text-white/50 font-medium tracking-wider uppercase">
                  Extra-Mural Research (EMR)
                </p>
              </div>
            </Link>

            {/* Right Nav */}
            <nav className="flex items-center space-x-6">
              <Link href="/admin/login" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                Admin
              </Link>
              <Link href="/register" className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300" />
                <button className="relative px-6 py-2.5 bg-black rounded-full leading-none flex items-center">
                  <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                    Apply Now
                  </span>
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black/40 backdrop-blur-md py-8 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} EMR Ph.D Programme. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
