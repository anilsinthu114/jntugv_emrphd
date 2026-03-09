import { AdminLayout } from "@/components/layout/AdminLayout";
import { useUsers, useExportUsers } from "@/hooks/use-users";
import { Users as UsersIcon, Download, FileText, Loader2, GraduationCap, Phone, Mail, Calendar, Award, ChevronDown, ChevronUp, Briefcase, BookOpen, Building2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import React from "react";

export default function Dashboard() {
  const { data: users, isLoading, isError } = useUsers();
  const { mutate: exportUsers, isPending: isExporting } = useExportUsers();

  // Track expanded rows by user ID
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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

  // Get highest qualification indicator
  const getQualification = (user: any) => {
    if (user.pgQualification) return `PG: ${user.pgQualification}`;
    if (user.ugQualification) return `UG: ${user.ugQualification}`;
    return 'Not provided';
  };

  return (
    <AdminLayout>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Applications Registry</h1>
          <p className="text-white/60 text-sm">Comprehensive overview of all EMR Ph.D Programme candidates.</p>
        </div>

        <button
          onClick={() => exportUsers()}
          disabled={isExporting || !users?.length}
          className="px-6 py-2.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 hover:text-white border border-indigo-500/30 rounded-xl font-medium flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Export Master Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="glass-panel p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-l-indigo-500/80 bg-black/20">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
            <UsersIcon className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs text-white/50 font-medium uppercase tracking-wider mb-1">Total Candidates</p>
            <h3 className="text-3xl font-display font-bold text-white tracking-tight">
              {isLoading ? "-" : users?.length || 0}
            </h3>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-[#1a1b26] text-white/60 font-medium border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4 w-12 text-center"></th>
                <th className="px-6 py-4">Applicant Profile</th>
                <th className="px-6 py-4">Highest Qualification</th>
                <th className="px-6 py-4">Primary Employment</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Applied On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
                    <span className="text-sm font-medium">Retrieving candidate records...</span>
                  </td>
                </tr>
              )}
              {isError && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-400 bg-red-500/5">
                    Failed to load registry data. Please try again.
                  </td>
                </tr>
              )}
              {!isLoading && !isError && users?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-white/50">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UsersIcon className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-base font-medium text-white/70">No applications registered yet.</p>
                  </td>
                </tr>
              )}
              {users?.map((user, idx) => {
                const isExpanded = expandedRows[user.id];
                return (
                  <React.Fragment key={user.id}>
                    {/* Main Row */}
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => toggleRow(user.id)}
                      className={`hover:bg-white/[0.04] transition-colors cursor-pointer group ${isExpanded ? 'bg-white/[0.02]' : ''}`}
                    >
                      <td className="px-6 py-4 text-center">
                        <button className="p-1 rounded-md hover:bg-white/10 text-white/40 group-hover:text-white/80 transition-colors">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white text-base mb-1">{user.name}</div>
                        <div className="flex items-center space-x-3 text-[11px] text-white/40 font-mono">
                          <span>ID: {String(user.id).padStart(4, '0')}</span>
                          <span>•</span>
                          <span>Aadhaar: {user.aadhaarNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        <div className="flex items-center space-x-2 font-medium">
                          <Award className="w-4 h-4 text-indigo-400/70" />
                          <span>{getQualification(user)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-emerald-400/70 shrink-0" />
                          <span className="truncate max-w-[180px] block" title={getFirstEmployment(user)}>{getFirstEmployment(user)}</span>
                        </div>
                        <div className="text-[11px] text-white/40 mt-1 ml-6">
                          Total Exp: {getTotalExperience(user)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${user.category === 'OC' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                            user.category === 'SC' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                              user.category === 'ST' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                          {user.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-white/50 text-xs">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '-'}
                      </td>
                    </motion.tr>

                    {/* Expanded Details Row */}
                    <AnimatePresence>
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="p-0 border-b border-white/5">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-[#0f111a] px-8 py-8 border-y border-indigo-500/10 overflow-hidden"
                            >
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                                {/* Column 1: Personal & Research */}
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="flex items-center text-sm font-semibold text-indigo-300 mb-4 border-b border-white/10 pb-2">
                                      <UsersIcon className="w-4 h-4 mr-2" /> Applicant Information
                                    </h4>
                                    <div className="space-y-3 text-sm text-white/70">
                                      <div className="flex items-center"><Mail className="w-4 h-4 mr-3 text-white/30" /> {user.email}</div>
                                      <div className="flex items-center"><Phone className="w-4 h-4 mr-3 text-white/30" /> {user.phone}</div>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="flex items-center text-sm font-semibold text-emerald-300 mb-4 border-b border-white/10 pb-2">
                                      <BookOpen className="w-4 h-4 mr-2" /> Research Proposal
                                    </h4>
                                    <div className="space-y-4 text-sm text-white/70 bg-white/5 p-4 rounded-xl border border-white/5">
                                      <div>
                                        <div className="text-[10px] uppercase text-white/40 font-semibold mb-1">Proposed Research Area</div>
                                        <div>{user.researchPlan || 'Not specified'}</div>
                                      </div>
                                      <div>
                                        <div className="text-[10px] uppercase text-white/40 font-semibold mb-1">Preliminary Study Evidence</div>
                                        <div>{user.preliminaryStudyEvidence || 'Not specified'}</div>
                                      </div>
                                      <div>
                                        <div className="text-[10px] uppercase text-white/40 font-semibold mb-1">Available Facilities</div>
                                        <div>{user.researchFacilities || 'Not specified'}</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Column 2: Academic Record */}
                                <div className="space-y-6">
                                  <h4 className="flex items-center text-sm font-semibold text-amber-300 mb-4 border-b border-white/10 pb-2">
                                    <GraduationCap className="w-4 h-4 mr-2" /> Academic Background
                                  </h4>

                                  <div className="space-y-3">
                                    {/* PG Box */}
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-white text-sm">Post-Graduation (PG)</span>
                                        {user.pgCertificatePath && (
                                          <a href={user.pgCertificatePath} target="_blank" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center bg-indigo-500/10 px-2 py-1 rounded">
                                            <FileText className="w-3 h-3 mr-1" /> Certificate
                                          </a>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                                        <div><span className="text-white/30 text-[10px] block uppercase">Qualification</span>{user.pgQualification || '-'}</div>
                                        <div><span className="text-white/30 text-[10px] block uppercase">Specialization</span>{user.pgSpecialization || '-'}</div>
                                        <div className="col-span-2"><span className="text-white/30 text-[10px] block uppercase">Institute</span>{user.pgInstitute || '-'}</div>
                                        <div><span className="text-white/30 text-[10px] block uppercase">Passing Year</span>{user.pgPassedYear || '-'}</div>
                                        <div><span className="text-white/30 text-[10px] block uppercase">CGPA/Percentage</span>{user.pgCgpa || '-'}</div>
                                      </div>
                                    </div>

                                    {/* UG Box */}
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-white/90 text-sm">Under-Graduation (UG)</span>
                                        {user.ugCertificatePath && (
                                          <a href={user.ugCertificatePath} target="_blank" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center bg-indigo-500/10 px-2 py-1 rounded">
                                            <FileText className="w-3 h-3 mr-1" /> Certificate
                                          </a>
                                        )}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs text-white/60">
                                        <div><span className="text-white/30 text-[10px] block uppercase">Qualification</span>{user.ugQualification || '-'}</div>
                                        <div><span className="text-white/30 text-[10px] block uppercase">Specialization</span>{user.ugSpecialization || '-'}</div>
                                        <div className="col-span-2"><span className="text-white/30 text-[10px] block uppercase">Institute</span>{user.ugInstitute || '-'}</div>
                                        <div><span className="text-white/30 text-[10px] block uppercase">Passing Year</span>{user.ugPassedYear || '-'}</div>
                                        <div><span className="text-white/30 text-[10px] block uppercase">CGPA/Percentage</span>{user.ugCgpa || '-'}</div>
                                      </div>
                                    </div>

                                    {/* Inter & SSC Summary line */}
                                    <div className="grid grid-cols-2 gap-3 text-xs text-white/60">
                                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                        <div>
                                          <div className="font-semibold text-white/80 mb-0.5">Intermediate</div>
                                          <div>{user.interPercentage || '-'}% • {user.interPassedYear || '-'}</div>
                                        </div>
                                        {user.interCertificatePath && (
                                          <a href={user.interCertificatePath} target="_blank" className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-md hover:bg-indigo-500/40" title="View Certificate"><FileText className="w-4 h-4" /></a>
                                        )}
                                      </div>
                                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                                        <div>
                                          <div className="font-semibold text-white/80 mb-0.5">SSC</div>
                                          <div>{user.sscPercentage || '-'}% • {user.sscPassedYear || '-'}</div>
                                        </div>
                                        {user.sscCertificatePath && (
                                          <a href={user.sscCertificatePath} target="_blank" className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-md hover:bg-indigo-500/40" title="View Certificate"><FileText className="w-4 h-4" /></a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Column 3: Employment & Core Docs */}
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="flex items-center text-sm font-semibold text-cyan-300 mb-4 border-b border-white/10 pb-2">
                                      <Building2 className="w-4 h-4 mr-2" /> Employment Records
                                    </h4>
                                    <div className="space-y-3">
                                      {user.employmentDetails && Array.isArray(user.employmentDetails) ? user.employmentDetails.map((emp: any, i: number) => (
                                        <div key={i} className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs relative overflow-hidden">
                                          <div className="absolute top-0 right-0 px-2 py-0.5 bg-white/10 text-[9px] rounded-bl text-white/60">{emp.organizationType}</div>
                                          <div className="font-semibold text-white/90 text-[13px] mb-1 pr-12">{emp.designation}</div>
                                          <div className="text-white/60 mb-2">{emp.organizationName}</div>
                                          <div className="flex justify-between items-center border-t border-white/10 pt-2 mt-2">
                                            <div className="text-white/40">{emp.experienceFrom} to {emp.experienceTo}</div>
                                            {emp.certificate && (
                                              <a href={emp.certificate} target="_blank" className="text-indigo-400 hover:text-indigo-300 flex items-center">
                                                <FileText className="w-3 h-3 mr-1" /> View Exp. Letter
                                              </a>
                                            )}
                                          </div>
                                        </div>
                                      )) : <div className="text-sm text-white/40 italic">No employment records provided.</div>}
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wider text-[11px]">Primary Documents</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { label: 'Transfer Cert', path: user.transferCertificatePath, color: 'text-purple-400' },
                                        { label: 'Caste Cert', path: user.casteCertificatePath, color: 'text-orange-400' },
                                        { label: 'NOC Cert', path: user.nocCertificatePath, color: 'text-cyan-400' },
                                        { label: 'Fee Receipt', path: user.feeReceiptPath, color: 'text-green-400' },
                                      ].map((doc, i) => (
                                        doc.path ? (
                                          <a key={i} href={doc.path} target="_blank" className="flex items-center p-2 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <FileText className={`w-4 h-4 mr-2 ${doc.color}`} />
                                            <span className="text-xs text-white/70">{doc.label}</span>
                                          </a>
                                        ) : (
                                          <div key={i} className="flex items-center p-2 rounded-lg bg-black/20 border border-transparent opacity-50">
                                            <FileText className="w-4 h-4 mr-2 text-white/20" />
                                            <span className="text-xs text-white/30">{doc.label} (N/A)</span>
                                          </div>
                                        )
                                      ))}
                                    </div>
                                  </div>

                                  {(user.annualTurnover2324 || user.annualTurnover2425 || user.annualTurnover2526) && (
                                    <div>
                                      <h4 className="text-sm font-semibold text-white/70 mb-2 uppercase tracking-wider text-[11px]">Reported Turnover</h4>
                                      <div className="flex space-x-4 text-xs bg-white/5 p-3 rounded-lg border border-white/5">
                                        {user.annualTurnover2324 && <div><span className="text-white/40 block mb-0.5">2023-24</span>₹{user.annualTurnover2324}</div>}
                                        {user.annualTurnover2425 && <div><span className="text-white/40 block mb-0.5">2024-25</span>₹{user.annualTurnover2425}</div>}
                                        {user.annualTurnover2526 && <div><span className="text-white/40 block mb-0.5">2025-26</span>₹{user.annualTurnover2526}</div>}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

