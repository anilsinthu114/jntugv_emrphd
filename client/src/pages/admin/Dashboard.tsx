import { AdminLayout } from "@/components/layout/AdminLayout";
import { useUsers, useExportUsers } from "@/hooks/use-users";
import { Users as UsersIcon, Download, FileText, Loader2, Building2, Briefcase, Phone, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: users, isLoading, isError } = useUsers();
  const { mutate: exportUsers, isPending: isExporting } = useExportUsers();

  return (
    <AdminLayout>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Applicants Overview</h1>
          <p className="text-white/50">Manage and review all EMR Ph.D registrations.</p>
        </div>
        
        <button
          onClick={() => exportUsers()}
          disabled={isExporting || !users?.length}
          className="px-6 py-3 bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30 rounded-xl font-semibold flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          <span>Export Excel</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-indigo-500">
          <div className="p-3 bg-indigo-500/20 rounded-xl">
            <UsersIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-white/50 font-medium">Total Applicants</p>
            <h3 className="text-3xl font-display font-bold text-white">
              {isLoading ? "-" : users?.length || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/60 font-medium border-b border-white/10">
              <tr>
                <th className="px-6 py-4">Applicant</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Professional</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading applicants...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-red-400">
                    Failed to load data. Please refresh the page.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && users?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/50">
                    No applicants found.
                  </td>
                </tr>
              )}
              {users?.map((user, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={user.id} 
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-white/40 mt-1">ID: #{user.id}</div>
                  </td>
                  <td className="px-6 py-4 space-y-1 text-white/60">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[150px]">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-1 text-white/60">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[180px]">{user.organization}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-3.5 h-3.5 shrink-0" />
                      <span>{user.experience} Years</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      {user.feeReceiptPath ? (
                        <a 
                          href={user.feeReceiptPath} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Fee Receipt</span>
                        </a>
                      ) : (
                        <span className="text-xs text-white/30">No Receipt</span>
                      )}
                      {user.registrationDetailsPath ? (
                        <a 
                          href={user.registrationDetailsPath} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1.5 text-xs font-medium text-purple-400 hover:text-purple-300"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Reg. Details</span>
                        </a>
                      ) : (
                        <span className="text-xs text-white/30">No Details</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-white/60">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '-'}</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
