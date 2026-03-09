import { AdminLayout } from "@/components/layout/AdminLayout";
import { useUsers, useExportUsers } from "@/hooks/use-users";
import { Users as UsersIcon, Download, FileText, Loader2, GraduationCap, Phone, Mail, Calendar, Award } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: users, isLoading, isError } = useUsers();
  const { mutate: exportUsers, isPending: isExporting } = useExportUsers();

  // Get first employment details for display
  const getFirstEmployment = (user: any) => {
    if (user.employmentDetails && Array.isArray(user.employmentDetails) && user.employmentDetails.length > 0) {
      const emp = user.employmentDetails[0];
      return `${emp.designation || 'N/A'} at ${emp.organizationName || 'N/A'}`;
    }
    return 'Not provided';
  };

  // Get total years of experience
  const getTotalExperience = (user: any) => {
    if (user.employmentDetails && Array.isArray(user.employmentDetails)) {
      const total = user.employmentDetails.reduce((sum: number, emp: any) => {
        return sum + (parseFloat(emp.yearsOfExperience) || 0);
      }, 0);
      return total > 0 ? `${total} Years` : 'Not provided';
    }
    return 'Not provided';
  };

  // Get UG qualification for display
  const getQualification = (user: any) => {
    return user.ugQualification || 'Not provided';
  };

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
                <th className="px-6 py-4">Qualification</th>
                <th className="px-6 py-4">Employment</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Documents</th>
                <th className="px-6 py-4">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/50">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Loading applicants...
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-red-400">
                    Failed to load data. Please refresh the page.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && users?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-white/50">
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
                    <div className="text-xs text-white/30 mt-1">Aadhaar: {user.aadhaarNumber || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 space-y-1 text-white/60">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[180px]">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    <div className="flex items-center space-x-2">
                      <Award className="w-3.5 h-3.5 shrink-0" />
                      <span>{getQualification(user)}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      {user.ugInstitute || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white/60">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate max-w-[150px]">{getFirstEmployment(user)}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      Exp: {getTotalExperience(user)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.category === 'OC' ? 'bg-green-500/20 text-green-400' :
                      user.category === 'SC' ? 'bg-orange-500/20 text-orange-400' :
                      user.category === 'ST' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {user.category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.feeReceiptPath && (
                        <a 
                          href={user.feeReceiptPath} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                          title="Fee Receipt"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {user.transferCertificatePath && (
                        <a 
                          href={user.transferCertificatePath} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-medium text-purple-400 hover:text-purple-300"
                          title="Transfer Certificate"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {user.casteCertificatePath && (
                        <a 
                          href={user.casteCertificatePath} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-medium text-orange-400 hover:text-orange-300"
                          title="Caste Certificate"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {user.nocCertificatePath && (
                        <a 
                          href={user.nocCertificatePath} 
                          download 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-xs font-medium text-cyan-400 hover:text-cyan-300"
                          title="NOC Certificate"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {!user.feeReceiptPath && !user.transferCertificatePath && !user.casteCertificatePath && !user.nocCertificatePath && (
                        <span className="text-xs text-white/30">No documents</span>
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

