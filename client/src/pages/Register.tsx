import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/use-users";
import { UploadCloud, CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

const registerFormSchema = z.object({
  // Personal Details
  name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email is required").max(150),
  password: z.string().min(6, "Password must be at least 6 characters"),
  aadhaarNumber: z.string().length(12, "Aadhaar must be 12 digits"),
  category: z.enum(["BC", "SC", "ST", "OC"]),
  phone: z.string().min(10, "Valid phone number required").max(20),

  // Employment Details
  organization: z.string().min(2, "Organization name is required").max(200),
  experience: z.coerce.number().min(5, "Minimum 5 years of experience required"),
  organizationType: z.enum(["Private", "Govt", "PSU"]),
  annualTurnover2324: z.string().min(1, "Turnover is required"),
  annualTurnover2425: z.string().min(1, "Turnover is required"),
  numEmployeesTech: z.coerce.number().min(0),

  // Research Proposal
  researchPlan: z.string().min(500, "Research plan must be at least 500 words"),
  preliminaryStudyEvidence: z.string().min(1, "Preliminary study details required"),
  researchFacilities: z.string().min(1, "Research facilities details required"),

  // Files
  sscCertificate: z.any().refine((f) => f?.length === 1, "Required"),
  ugCertificate: z.any().refine((f) => f?.length === 1, "Required"),
  pgCertificate: z.any().refine((f) => f?.length === 1, "Required"),
  transferCertificate: z.any().refine((f) => f?.length === 1, "Required"),
  nocCertificate: z.any().refine((f) => f?.length === 1, "Required"),
  collaborationAgreement: z.any().refine((f) => f?.length === 1, "Required"),
  feeReceipt: z.any().refine((f) => f?.length === 1, "Required"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const { mutate: registerUser, isPending } = useRegister();
  const [fileStates, setFileStates] = useState<Record<string, string | null>>({});

  const handleFileChange = (field: string, files: FileList | null) => {
    setFileStates(prev => ({ ...prev, [field]: files?.[0]?.name || null }));
  };

  const onSubmit = (data: RegisterFormValues) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value instanceof FileList) {
        if (value[0]) formData.append(key, value[0]);
      } else {
        formData.append(key, value.toString());
      }
    });
    registerUser(formData);
  };

  const FileUpload = ({ field, label }: { field: keyof RegisterFormValues, label: string }) => (
    <div className="relative group">
      <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
      <div className={`relative border-2 border-dashed ${fileStates[field] ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-black/20 hover:border-indigo-500/50'} rounded-2xl p-4 text-center transition-all`}>
        <input 
          type="file" 
          accept=".pdf,.jpg,.jpeg,.png"
          {...register(field)} 
          onChange={(e) => {
            register(field).onChange(e);
            handleFileChange(field, e.target.files);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        />
        <div className="flex flex-col items-center pointer-events-none">
          {fileStates[field] ? (
            <><CheckCircle2 className="w-6 h-6 text-green-400 mb-1" /><span className="text-xs text-green-200 truncate w-full px-2">{fileStates[field]}</span></>
          ) : (
            <><UploadCloud className="w-6 h-6 text-indigo-400 mb-1" /><span className="text-xs text-white/60">Upload PDF/Image</span></>
          )}
        </div>
      </div>
      {errors[field] && <p className="text-red-400 text-[10px] mt-1">{errors[field]?.message as string}</p>}
    </div>
  );

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto w-full pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Application Form</h2>
          <p className="text-white/50">Ph.D Programme under Extra-Mural Research (EMR)</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl p-6 md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            
            {/* Personal Details */}
            <section>
              <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                  <input {...register("name")} className="glass-input" />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                  <input type="email" {...register("email")} className="glass-input" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Aadhaar Number</label>
                  <input {...register("aadhaarNumber")} className="glass-input" maxLength={12} />
                  {errors.aadhaarNumber && <p className="text-red-400 text-xs mt-1">{errors.aadhaarNumber.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Category</label>
                  <select {...register("category")} className="glass-input bg-black/40">
                    <option value="OC">OC</option>
                    <option value="BC">BC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Contact Details (Phone)</label>
                  <input {...register("phone")} className="glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <input type="password" {...register("password")} className="glass-input" />
                </div>
              </div>
            </section>

            {/* Educational Details */}
            <section>
              <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Educational Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FileUpload field="sscCertificate" label="SSC Certificate" />
                <FileUpload field="ugCertificate" label="UG Degree & Memo" />
                <FileUpload field="pgCertificate" label="PG Degree & Memo" />
                <FileUpload field="transferCertificate" label="Transfer Cert." />
              </div>
            </section>

            {/* Employment Details */}
            <section>
              <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Employment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Organization Name</label>
                  <input {...register("organization")} className="glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Years of Experience (Min 5)</label>
                  <input type="number" {...register("experience")} className="glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Organization Type</label>
                  <select {...register("organizationType")} className="glass-input bg-black/40">
                    <option value="Private">Private</option>
                    <option value="Govt">Govt</option>
                    <option value="PSU">PSU</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Num. Employees (Tech/Engineers)</label>
                  <input type="number" {...register("numEmployeesTech")} className="glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Turnover 2023-24</label>
                  <input {...register("annualTurnover2324")} className="glass-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Turnover 2024-25</label>
                  <input {...register("annualTurnover2425")} className="glass-input" />
                </div>
                <FileUpload field="nocCertificate" label="NOC Certificate" />
                <FileUpload field="collaborationAgreement" label="Collaboration Agreement" />
              </div>
            </section>

            {/* Research Proposal */}
            <section>
              <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Research Proposal</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Research Plan (Min 500 words)</label>
                  <textarea {...register("researchPlan")} className="glass-input min-h-[200px]" />
                  <p className="text-white/30 text-[10px] mt-1">Word count: {register("researchPlan").name ? 0 : 0 /* simplistic */}</p>
                  {errors.researchPlan && <p className="text-red-400 text-xs mt-1">{errors.researchPlan.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Evidence of Preliminary Study</label>
                  <textarea {...register("preliminaryStudyEvidence")} className="glass-input min-h-[100px]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Research Facilities Details</label>
                  <textarea {...register("researchFacilities")} className="glass-input min-h-[100px]" />
                </div>
              </div>
            </section>

            {/* Fee Payment */}
            <section>
              <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Fee Payment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h4 className="flex items-center text-indigo-300 font-bold mb-4">
                    <CreditCard className="w-5 h-5 mr-2" /> Bank Details
                  </h4>
                  <div className="space-y-2 text-sm text-white/80">
                    <p><span className="text-white/40">Bank:</span> State Bank of India</p>
                    <p><span className="text-white/40">Account Name:</span> EMR PhD Programme</p>
                    <p><span className="text-white/40">Account Number:</span> 1234567890</p>
                    <p><span className="text-white/40">IFSC:</span> SBIN0001234</p>
                    <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
                      <p className="flex justify-between"><span>Registration Fee:</span> <span>₹5,000</span></p>
                      <p className="flex justify-between"><span>Admission Fee:</span> <span>₹5,000</span></p>
                      <p className="flex justify-between text-indigo-400 font-bold"><span>Total to Pay:</span> <span>₹10,000</span></p>
                    </div>
                  </div>
                </div>
                <FileUpload field="feeReceipt" label="Upload Payment Receipt" />
              </div>
            </section>

            <button type="submit" disabled={isPending} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center space-x-2 disabled:opacity-50">
              {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Submit Final Application</span>}
            </button>
          </form>
        </motion.div>
      </div>
    </PublicLayout>
  );
}