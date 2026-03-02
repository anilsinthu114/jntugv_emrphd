import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/use-users";
import { UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Frontend specific Zod schema to handle Files properly
const registerFormSchema = z.object({
  name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email is required").max(150),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Valid phone number required").max(20),
  organization: z.string().min(2, "Organization name is required").max(200),
  experience: z.coerce.number().min(0, "Experience cannot be negative"),
  feeReceipt: z.any().refine((files) => files?.length === 1, "Fee receipt PDF is required"),
  registrationDetails: z.any().refine((files) => files?.length === 1, "Registration details PDF is required"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
  });

  const { mutate: registerUser, isPending } = useRegister();
  
  // Track filenames for visual feedback
  const [feeFileName, setFeeFileName] = useState<string | null>(null);
  const [regFileName, setRegFileName] = useState<string | null>(null);

  const onSubmit = (data: RegisterFormValues) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("phone", data.phone);
    formData.append("organization", data.organization);
    formData.append("experience", data.experience.toString());
    
    // Append files
    if (data.feeReceipt?.[0]) formData.append("feeReceipt", data.feeReceipt[0]);
    if (data.registrationDetails?.[0]) formData.append("registrationDetails", data.registrationDetails[0]);

    registerUser(formData);
  };

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto w-full pb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Candidate Registration</h2>
          <p className="text-white/50">Complete your profile and upload necessary documents to apply.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-3xl p-6 md:p-10"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Personal Details */}
            <div>
              <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">1. Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                  <input {...register("name")} className="glass-input" placeholder="Dr. John Doe" />
                  {errors.name && <p className="text-red-400 text-xs mt-2">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                  <input type="email" {...register("email")} className="glass-input" placeholder="john@university.edu" />
                  {errors.email && <p className="text-red-400 text-xs mt-2">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                  <input type="password" {...register("password")} className="glass-input" placeholder="••••••••" />
                  {errors.password && <p className="text-red-400 text-xs mt-2">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone Number</label>
                  <input {...register("phone")} className="glass-input" placeholder="+91 9876543210" />
                  {errors.phone && <p className="text-red-400 text-xs mt-2">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div>
              <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">2. Professional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Organization Name</label>
                  <input {...register("organization")} className="glass-input" placeholder="National Institute of Science" />
                  {errors.organization && <p className="text-red-400 text-xs mt-2">{errors.organization.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Years of Experience</label>
                  <input type="number" {...register("experience")} className="glass-input" placeholder="5" />
                  {errors.experience && <p className="text-red-400 text-xs mt-2">{errors.experience.message}</p>}
                </div>
              </div>
            </div>

            {/* Document Uploads */}
            <div>
              <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">3. Document Uploads (PDF only)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Fee Receipt */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-white/70 mb-2">Fee Receipt</label>
                  <div className={`relative border-2 border-dashed ${feeFileName ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-black/20 hover:border-indigo-500/50'} rounded-2xl p-6 text-center transition-all`}>
                    <input 
                      type="file" 
                      accept=".pdf"
                      {...register("feeReceipt")} 
                      onChange={(e) => {
                        register("feeReceipt").onChange(e);
                        setFeeFileName(e.target.files?.[0]?.name || null);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                      {feeFileName ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                          <span className="text-sm text-green-200 truncate w-full px-4">{feeFileName}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-indigo-400 mb-2 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-sm text-white/60">Click to upload or drag & drop</span>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.feeReceipt && <p className="text-red-400 text-xs mt-2">{errors.feeReceipt.message as string}</p>}
                </div>

                {/* Registration Details */}
                <div className="relative group">
                  <label className="block text-sm font-medium text-white/70 mb-2">Registration Details</label>
                  <div className={`relative border-2 border-dashed ${regFileName ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-black/20 hover:border-indigo-500/50'} rounded-2xl p-6 text-center transition-all`}>
                    <input 
                      type="file" 
                      accept=".pdf"
                      {...register("registrationDetails")} 
                      onChange={(e) => {
                        register("registrationDetails").onChange(e);
                        setRegFileName(e.target.files?.[0]?.name || null);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div className="flex flex-col items-center pointer-events-none">
                      {regFileName ? (
                        <>
                          <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />
                          <span className="text-sm text-green-200 truncate w-full px-4">{regFileName}</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-indigo-400 mb-2 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-sm text-white/60">Click to upload or drag & drop</span>
                        </>
                      )}
                    </div>
                  </div>
                  {errors.registrationDetails && <p className="text-red-400 text-xs mt-2">{errors.registrationDetails.message as string}</p>}
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isPending}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
