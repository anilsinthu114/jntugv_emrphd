import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRegister } from "@/hooks/use-users";
import { UploadCloud, CheckCircle2, Loader2, CreditCard, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

// Employment entry schema
const employmentEntrySchema = z.object({
  organizationName: z.string().min(2, "Organization name is required").max(200),
  organizationType: z.enum(["Private", "Govt", "PSU"]),
  designation: z.string().min(1, "Designation is required").max(200),
  experienceFrom: z.string().min(1, "From date is required"),
  experienceTo: z.string().min(1, "To date is required"),
  yearsOfExperience: z.coerce.number().min(0, "Years must be positive"),
  certificate: z.any().refine((f) => f?.length === 1, "Certificate is required"),
});

// Categories that require caste certificate (non-OC)
const CASTE_REQUIRED_CATEGORIES = ["BC-A", "BC-B", "BC-C", "BC-D", "SC", "ST", "BC", "SC", "ST"];

const registerFormSchema = z.object({
  // Personal Details
  name: z.string().min(2, "Full name is required").max(100),
  email: z.string().email("Valid email is required").max(150),
  password: z.string().min(6, "Password must be at least 6 characters"),
  aadhaarNumber: z.string().length(12, "Aadhaar must be 12 digits"),
  category: z.enum(["OC", "BC-A", "BC-B", "BC-C", "BC-D", "SC", "ST"]),
  phone: z.string().min(10, "Valid phone number required").max(20),

  // Employment Details - Array of employment records (minimum 2 required)
  employmentDetails: z.array(employmentEntrySchema).min(2, "At least 2 employment records are required"),

  // Research Proposal
  researchPlan: z.string().min(500, "Research plan must be at least 500 words"),
  researchFacilities: z.string().min(1, "Research Facilities details are Required"),

  // Files (casteCertificate is optional in schema, validated separately based on category)
  transferCertificate: z.any().refine((f) => f?.length === 1, "Transfer Certificate is required"),
  nocCertificate: z.any().optional(),
  collaborationAgreement: z.any().optional(),
  feeReceipt: z.any().refine((f) => f?.length === 1, "Required"),
  nocCurrentOrganization: z.any().refine((f) => f?.length === 1, "NOC from current organization is required"),
  casteCertificate: z.any().optional(),

  // Annual Turnover (only for private organizations)
  annualTurnover2324: z.string().optional(),
  annualTurnover2425: z.string().optional(),
  annualTurnover2526: z.string().optional(),

  // Educational Details
  sscQualification: z.string().min(1, "Required"),
  sscSpecialization: z.string().min(1, "Required"),
  sscInstitute: z.string().min(1, "Required"),
  sscPassedYear: z.string().min(4, "Required"),
  sscPercentage: z.string().min(1, "Required"),
  sscCertificate: z.any().refine((f) => f?.length === 1, "Required"),

  interQualification: z.string().min(1, "Required"),
  interSpecialization: z.string().min(1, "Required"),
  interInstitute: z.string().min(1, "Required"),
  interPassedYear: z.string().min(4, "Required"),
  interPercentage: z.string().min(1, "Required"),
  interCertificate: z.any().refine((f) => f?.length === 1, "Required"),

  ugQualification: z.string().min(1, "Required"),
  ugSpecialization: z.string().min(1, "Required"),
  ugInstitute: z.string().min(1, "Required"),
  ugPassedYear: z.string().min(4, "Required"),
  ugCgpa: z.string().min(1, "Required"),
  ugCertificate: z.any().refine((f) => f?.length === 1, "Required"),

  pgQualification: z.string().min(1, "Required"),
  pgSpecialization: z.string().min(1, "Required"),
  pgInstitute: z.string().min(1, "Required"),
  pgPassedYear: z.string().min(4, "Required"),
  pgCgpa: z.string().min(1, "Required"),
  pgCertificate: z.any().refine((f) => f?.length === 1, "Required"),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;
type EmploymentEntry = z.infer<typeof employmentEntrySchema>;

export default function Register() {
  const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      employmentDetails: [
        { organizationName: "", organizationType: "Private" as const, designation: "", experienceFrom: "", experienceTo: "", yearsOfExperience: 0, certificate: undefined },
        { organizationName: "", organizationType: "Private" as const, designation: "", experienceFrom: "", experienceTo: "", yearsOfExperience: 0, certificate: undefined },
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "employmentDetails"
  });

  const { mutate: registerUser, isPending, isSuccess } = useRegister();
  const [fileStates, setFileStates] = useState<Record<string, string | null>>({});
  const [showTurnoverFields, setShowTurnoverFields] = useState(false);

  const handleFileChange = (field: string, files: FileList | null) => {
    setFileStates(prev => ({ ...prev, [field]: files?.[0]?.name || null }));
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    alert("Form validation failed: " + Object.keys(errors).join(", ") + ". Check console for details.");
  };

  const onSubmit = (data: RegisterFormValues) => {
    console.log("Form submitted with data:", data);
    // Check if caste certificate is required based on category
    // OC does not require caste certificate, all other categories (BC-A, BC-B, BC-C, BC-D, SC, ST) require it
    const isCasteRequired = data.category !== "OC";

    if (isCasteRequired && (!data.casteCertificate || data.casteCertificate.length === 0)) {
      alert("Caste certificate is required for the selected category. Please upload your caste certificate.");
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'employmentDetails' && Array.isArray(value)) {
        const employmentWithoutFiles = value.map((emp, index) => {
          if (emp.certificate instanceof FileList && emp.certificate[0]) {
            formData.append(`employmentDetails.${index}.certificate`, emp.certificate[0]);
          }
          const { certificate, ...rest } = emp;
          return rest;
        });
        formData.append(key, JSON.stringify(employmentWithoutFiles));
      } else if (value instanceof FileList) {
        if (value[0]) formData.append(key, value[0]);
      } else if (value !== undefined && value !== null) {
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

  const FileUploadCompact = ({ field }: { field: keyof RegisterFormValues }) => (
    <div className="relative">
      <div className={`relative border-2 border-dashed ${fileStates[field] ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-black/20 hover:border-indigo-500/50'} rounded-lg p-2 text-center transition-all`}>
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
        <div className="flex flex-col items-center justify-center pointer-events-none">
          {fileStates[field] ? (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          ) : (
            <UploadCloud className="w-4 h-4 text-indigo-400" />
          )}
        </div>
      </div>
      {errors[field] && <p className="text-red-400 text-[10px] mt-1">{errors[field]?.message as string}</p>}
    </div>
  );

  return (
    <PublicLayout>
      <div className="w-full mx-auto w-full pb-20 px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Application Form</h2>
          <p className="text-white/50">Ph.D Programme under Extra-Mural Research (EMR)</p>
          <p className="text-white/70">Laste Date for the Application is 6th April 2026</p>
        </div>

        {isSuccess ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel rounded-3xl p-10 md:p-16 mb-12 w-full text-center flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-8 border border-green-500/30">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Application Submitted!</h2>
            <p className="text-white/70 max-w-lg mb-10 text-lg">
              Thank you for submitting your application for the Ph.D Programme under Extra-Mural Research (EMR). Your details have been successfully recorded.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
            >
              Return to Home
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-3xl p-6 md:p-10 mb-12 w-full">
            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-12">

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
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Category
                    </label>

                    <select
                      {...register("category")}
                      className="
      w-full
      px-4 py-3
      rounded-xl
      border border-white/20
      bg-transparent
      text-white
      backdrop-blur-md
      focus:outline-none
      focus:ring-2
      focus:ring-indigo-500
      appearance-none
    "
                    >
                      <option value="OC" className="bg-black text-white">OC</option>
                      <option value="BC-A" className="bg-black text-white">BC-A</option>
                      <option value="BC-B" className="bg-black text-white">BC-B</option>
                      <option value="BC-C" className="bg-black text-white">BC-C</option>
                      <option value="BC-D" className="bg-black text-white">BC-D</option>
                      <option value="SC" className="bg-black text-white">SC</option>
                      <option value="ST" className="bg-black text-white">ST</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Contact Details (Phone)</label>
                    <input {...register("phone")} className="glass-input" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-indigo-300 font-bold mb-2">Caste Certificate</h4>
                    <p className="text-white/50 text-xs mb-4">Upload valid caste certificate (SC/ST/BC categories only)</p>
                    <FileUpload field="casteCertificate" label="Upload Caste Certificate (PDF/Image)" />
                  </div>
                </div>
              </section>
              {/* Educational Details */}
              <section>
                <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Educational Details</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/20">
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/70">Qualification</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/70">Degree</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/70">Specialization</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/70">Institute Name</th>

                        <th className="text-left px-4 py-3 text-sm font-medium text-white/70">Passed Out Year</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/70">Percentage / CGPA</th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-white/70">Upload Certificate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* SSC Row */}
                      <tr className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-4 py-4 text-white font-medium">SSC</td>
                        <td className="px-4 py-4">
                          <input {...register("sscQualification")} placeholder="e.g., SSC" className="glass-input text-sm" />
                          {errors.sscQualification && <p className="text-red-400 text-[10px] mt-1">{errors.sscQualification.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input {...register("sscSpecialization")} placeholder="Specialization (if any)" className="glass-input text-sm" />
                          {errors.sscSpecialization && <p className="text-red-400 text-[10px] mt-1">{errors.sscSpecialization.message}</p>}
                        </td>

                        <td className="px-4 py-7">
                          <input {...register("sscInstitute")} placeholder="Institute Name" className="glass-input text-sm" />
                          {errors.sscInstitute && <p className="text-red-400 text-[10px] mt-1">{errors.sscInstitute.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" {...register("sscPassedYear")} placeholder="YYYY" className="glass-input text-sm" maxLength={4} />
                          {errors.sscPassedYear && <p className="text-red-400 text-[10px] mt-1">{errors.sscPassedYear.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input {...register("sscPercentage")} placeholder="%" className="glass-input text-sm" />
                          {errors.sscPercentage && <p className="text-red-400 text-[10px] mt-1">{errors.sscPercentage.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <FileUploadCompact field="sscCertificate" />
                        </td>
                      </tr>

                      {/* INTER/DIPLOMA Row */}
                      <tr className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-4 py-4 text-white font-medium">INTER./Diploma</td>
                        <td className="px-4 py-4">
                          <input {...register("interQualification")} placeholder="e.g., Diploma" className="glass-input text-sm" />
                          {errors.interQualification && <p className="text-red-400 text-[10px] mt-1">{errors.interQualification.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input {...register("interSpecialization")} placeholder="Specialization (if any)" className="glass-input text-sm" />
                          {errors.interSpecialization && <p className="text-red-400 text-[10px] mt-1">{errors.interSpecialization.message}</p>}
                        </td>

                        <td className="px-4 py-7">
                          <input {...register("interInstitute")} placeholder="Institute Name" className="glass-input text-sm" />
                          {errors.interInstitute && <p className="text-red-400 text-[10px] mt-1">{errors.interInstitute.message}</p>}
                        </td>

                        <td className="px-4 py-4">
                          <input type="number" {...register("interPassedYear")} placeholder="YYYY" className="glass-input text-sm" maxLength={4} />
                          {errors.interPassedYear && <p className="text-red-400 text-[10px] mt-1">{errors.interPassedYear.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input {...register("interPercentage")} placeholder="%" className="glass-input text-sm" />
                          {errors.interPercentage && <p className="text-red-400 text-[10px] mt-1">{errors.interPercentage.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <FileUploadCompact field="interCertificate" />
                        </td>
                      </tr>

                      {/* UG Row */}
                      <tr className="border-b border-white/10 hover:bg-white/5">
                        <td className="px-4 py-4 text-white font-medium">UG</td>
                        <td className="px-4 py-4">
                          <input {...register("ugQualification")} placeholder="e.g., B.Tech" className="glass-input text-sm" />
                          {errors.ugQualification && <p className="text-red-400 text-[10px] mt-1">{errors.ugQualification.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input {...register("ugSpecialization")} placeholder="Specialization (if any)" className="glass-input text-sm" />
                          {errors.ugSpecialization && <p className="text-red-400 text-[10px] mt-1">{errors.ugSpecialization.message}</p>}
                        </td>

                        <td className="px-4 py-7">
                          <input {...register("ugInstitute")} placeholder="Institute Name" className="glass-input text-sm" />
                          {errors.ugInstitute && <p className="text-red-400 text-[10px] mt-1">{errors.ugInstitute.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" {...register("ugPassedYear")} placeholder="YYYY" className="glass-input text-sm" maxLength={4} />
                          {errors.ugPassedYear && <p className="text-red-400 text-[10px] mt-1">{errors.ugPassedYear.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input {...register("ugCgpa")} placeholder="CGPA" className="glass-input text-sm" />
                          {errors.ugCgpa && <p className="text-red-400 text-[10px] mt-1">{errors.ugCgpa.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <FileUploadCompact field="ugCertificate" />
                        </td>
                      </tr>

                      {/* PG Row */}
                      <tr className="hover:bg-white/5">
                        <td className="px-4 py-4 text-white font-medium">PG</td>
                        <td className="px-4 py-4">
                          <input {...register("pgQualification")} placeholder="e.g., M.Tech" className="glass-input text-sm" />
                          {errors.pgQualification && <p className="text-red-400 text-[10px] mt-1">{errors.pgQualification.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input {...register("pgSpecialization")} placeholder="Specialization (if any)" className="glass-input text-sm" />
                          {errors.pgSpecialization && <p className="text-red-400 text-[10px] mt-1">{errors.pgSpecialization.message}</p>}
                        </td>

                        <td className="px-4 py-7">
                          <input {...register("pgInstitute")} placeholder="Institute Name" className="glass-input text-sm" />
                          {errors.pgInstitute && <p className="text-red-400 text-[10px] mt-1">{errors.pgInstitute.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input type="number" {...register("pgPassedYear")} placeholder="YYYY" className="glass-input text-sm" maxLength={4} />
                          {errors.pgPassedYear && <p className="text-red-400 text-[10px] mt-1">{errors.pgPassedYear.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <input {...register("pgCgpa")} placeholder="CGPA" className="glass-input text-sm" />
                          {errors.pgCgpa && <p className="text-red-400 text-[10px] mt-1">{errors.pgCgpa.message}</p>}
                        </td>
                        <td className="px-4 py-4">
                          <FileUploadCompact field="pgCertificate" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>


              {/* Employment Details - Table Format */}
              <section>
                <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Employment Details</h3>

                {errors.employmentDetails && typeof errors.employmentDetails.message === 'string' && (
                  <p className="text-red-400 text-sm mb-4">{errors.employmentDetails.message}</p>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-white/5 border-b border-white/20">
                        <th className="text-left px-3 py-3 text-sm font-medium text-white/70 w-16">S.No</th>
                        <th className="text-left px-3 py-3 text-sm font-medium text-white/70">Name & Address of the Organization</th>
                        <th className="text-left px-3 py-3 text-sm font-medium text-white/70">Type of Org</th>
                        <th className="text-left px-3 py-3 text-sm font-medium text-white/70">Designation</th>
                        <th className="text-left px-3 py-3 text-sm font-medium text-white/70">From</th>
                        <th className="text-left px-3 py-3 text-sm font-medium text-white/70">To</th>
                        <th className="text-left px-3 py-3 text-sm font-medium text-white/70">Years of Exp.</th>
                        <th className="text-left px-3 py-3 text-sm font-medium text-white/70">Upload Certificate</th>
                        <th className="text-center px-3 py-3 text-sm font-medium text-white/70 w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id} className="border-b border-white/10 hover:bg-white/5">
                          <td className="px-3 py-4 text-white font-medium">{index + 1}</td>
                          <td className="px-3 py-4">
                            <input
                              {...register(`employmentDetails.${index}.organizationName` as const)}
                              placeholder="Organization Name"
                              className="glass-input text-sm w-full"
                            />
                            {errors.employmentDetails?.[index]?.organizationName && (
                              <p className="text-red-400 text-[10px] mt-1">{errors.employmentDetails[index]?.organizationName?.message}</p>
                            )}
                          </td>
                          <td className="px-6 py-8">
                            <select
                              {...register(`employmentDetails.${index}.organizationType` as const)}
                              className="glass-input text-sm w-full bg-black/40 px-6 py-8 "
                            >
                              <option >select</option>
                              <option value="PSU">PSU</option>
                              <option value="Govt">Govt</option>
                              <option value="Private">Private</option>
                            </select>
                            {errors.employmentDetails?.[index]?.organizationType && (
                              <p className="text-red-400 text-[10px] mt-1">{errors.employmentDetails[index]?.organizationType?.message}</p>
                            )}
                          </td>
                          <td className="px-3 py-5">
                            <input
                              {...register(`employmentDetails.${index}.designation` as const)}
                              placeholder="Designation"
                              className="glass-input text-sm w-full"
                            />
                            {errors.employmentDetails?.[index]?.designation && (
                              <p className="text-red-400 text-[10px] mt-1">{errors.employmentDetails[index]?.designation?.message}</p>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <input
                              type="date"
                              {...register(`employmentDetails.${index}.experienceFrom` as const)}
                              className="glass-input text-sm w-full"
                            />
                            {errors.employmentDetails?.[index]?.experienceFrom && (
                              <p className="text-red-400 text-[10px] mt-1">{errors.employmentDetails[index]?.experienceFrom?.message}</p>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <input
                              type="date"
                              {...register(`employmentDetails.${index}.experienceTo` as const)}
                              className="glass-input text-sm w-full"
                            />
                            {errors.employmentDetails?.[index]?.experienceTo && (
                              <p className="text-red-400 text-[10px] mt-1">{errors.employmentDetails[index]?.experienceTo?.message}</p>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <input
                              type="number"
                              step="0.5"
                              {...register(`employmentDetails.${index}.yearsOfExperience` as const)}
                              placeholder="Years"
                              className="glass-input text-sm w-full"
                            />
                            {errors.employmentDetails?.[index]?.yearsOfExperience && (
                              <p className="text-red-400 text-[10px] mt-1">{errors.employmentDetails[index]?.yearsOfExperience?.message}</p>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <div className="relative">
                              <div className={`relative border-2 border-dashed ${fileStates[`employmentDetails.${index}.certificate`] ? 'border-green-500/50 bg-green-500/5' : 'border-white/20 bg-black/20 hover:border-indigo-500/50'} rounded-lg p-2 text-center transition-all`}>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  {...register(`employmentDetails.${index}.certificate` as const)}
                                  onChange={(e) => {
                                    register(`employmentDetails.${index}.certificate` as const).onChange(e);
                                    handleFileChange(`employmentDetails.${index}.certificate`, e.target.files);
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center justify-center pointer-events-none">
                                  {fileStates[`employmentDetails.${index}.certificate`] ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <UploadCloud className="w-4 h-4 text-indigo-400" />
                                  )}
                                </div>
                              </div>
                            </div>
                            {errors.employmentDetails?.[index]?.certificate && (
                              <p className="text-red-400 text-[10px] mt-1">{errors.employmentDetails[index]?.certificate?.message as string}</p>
                            )}
                          </td>
                          <td className="px-3 py-4 text-center">
                            {index >= 4 && (
                              <button
                                type="button"
                                title="Remove this row"
                                onClick={() => remove(index)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <p className="text-white/50 text-sm">Minimum 2 employment records required</p>
                  <button
                    type="button"
                    onClick={() => append({ organizationName: "", organizationType: "Private", designation: "", experienceFrom: "", experienceTo: "", yearsOfExperience: 0, certificate: undefined })}
                    className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Row
                  </button>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">NO Objection Certificate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h4 className="text-indigo-300 font-bold mb-2">NOC Certificate from Current Organization</h4>
                    <p className="text-white/50 text-xs mb-4">Must be on organization letterhead with clear contact details</p>
                    <FileUpload field="nocCurrentOrganization" label="Upload NOC (PDF/Image)" />
                  </div>


                  {/* <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Additional Certificates</h3> */}
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                      <h4 className="text-indigo-300 font-bold mb-2">Transfer Certificate</h4>
                      <p className="text-white/50 text-xs mb-4">Upload your Transfer Certificate (TC) from previous institution</p>
                      <FileUpload field="transferCertificate" label="Upload Transfer Certificate (PDF/Image)" />
                    </div>
                  </div>

                </div>
                {/* </div> */}


              </section>

              {/* Annual Turnover (Only for Private Organizations) */}
              <section>
                <h3 className="text-xl font-display text-indigo-300 border-b border-white/10 pb-2 mb-6">Annual Turnover Details (Applicable only if Current Organization is Private)</h3>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-white/60 text-sm mb-6">Please provide the annual turnover for the following academic years if your current organization is a Private company</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">AY 2023-24 (In Lakhs)</label>
                      <input
                        type="text"
                        {...register("annualTurnover2324")}
                        placeholder="Enter turnover"
                        className="glass-input"
                      />
                      {errors.annualTurnover2324 && <p className="text-red-400 text-xs mt-1">{errors.annualTurnover2324.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">AY 2024-25 (In Lakhs)</label>
                      <input
                        type="text"
                        {...register("annualTurnover2425")}
                        placeholder="Enter turnover"
                        className="glass-input"
                      />
                      {errors.annualTurnover2425 && <p className="text-red-400 text-xs mt-1">{errors.annualTurnover2425.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">AY 2025-26 (In Lakhs)</label>
                      <input
                        type="text"
                        {...register("annualTurnover2526")}
                        placeholder="Enter turnover"
                        className="glass-input"
                      />
                      {errors.annualTurnover2526 && <p className="text-red-400 text-xs mt-1">{errors.annualTurnover2526.message}</p>}
                    </div>
                  </div>
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
                    <label className="block text-sm font-medium text-white/70 mb-2">Research Facilities Available at Current Organization</label>
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
                      <p><span className="text-white/40">Bank:</span>HDFC</p>
                      <p><span className="text-white/40">Account Name:</span> Registrar,R&D</p>
                      <p><span className="text-white/40">Account Number:</span>50100553778671</p>
                      <p><span className="text-white/40">IFSC:</span> HDFC0006009</p>
                      <div className="mt-6 pt-4 border-t border-white/10 space-y-1">
                        <p className="flex justify-between"><span>Registration Fee:</span> <span>₹5,000</span></p>
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
        )}
      </div>
    </PublicLayout>
  );
}