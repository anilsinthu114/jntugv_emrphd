import { pgTable, text, serial, integer, timestamp, varchar, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Employment entry type for JSON storage
export const employmentEntrySchema = z.object({
  organizationName: z.string(),
  organizationType: z.enum(["Private", "Govt", "PSU"]),
  designation: z.string(),
  experienceFrom: z.string(),
  experienceTo: z.string(),
  yearsOfExperience: z.number(),
  certificate: z.string().optional(), // Path to certificate
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),

  // Personal Details *
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: text("password").notNull(),
  aadhaarNumber: varchar("aadhaar_number", { length: 12 }).notNull(),
  category: varchar("category", { length: 20 }).notNull(), // BC/SC/ST/OC
  phone: varchar("phone", { length: 20 }).notNull(),

  // Educational Details - SSC *
  sscQualification: varchar("ssc_qualification", { length: 100 }).notNull(),
  sscSpecialization: varchar("ssc_specialization", { length: 200 }),
  sscInstitute: varchar("ssc_institute", { length: 200 }).notNull(),
  sscPassedYear: varchar("ssc_passed_year", { length: 4 }).notNull(),
  sscPercentage: varchar("ssc_percentage", { length: 10 }).notNull(),
  sscCertificatePath: text("ssc_certificate_path"),

  // Educational Details - Inter/Diploma *
  interQualification: varchar("inter_qualification", { length: 100 }).notNull(),
  interSpecialization: varchar("inter_specialization", { length: 200 }),
  interInstitute: varchar("inter_institute", { length: 200 }).notNull(),
  interPassedYear: varchar("inter_passed_year", { length: 4 }).notNull(),
  interPercentage: varchar("inter_percentage", { length: 10 }).notNull(),
  interCertificatePath: text("inter_certificate_path"),

  // Educational Details - UG *
  ugQualification: varchar("ug_qualification", { length: 100 }).notNull(),
  ugSpecialization: varchar("ug_specialization", { length: 200 }),
  ugInstitute: varchar("ug_institute", { length: 200 }).notNull(),
  ugPassedYear: varchar("ug_passed_year", { length: 4 }).notNull(),
  ugCgpa: varchar("ug_cgpa", { length: 10 }).notNull(),
  ugCertificatePath: text("ug_certificate_path"),

  // Educational Details - PG *
  pgQualification: varchar("pg_qualification", { length: 100 }).notNull(),
  pgSpecialization: varchar("pg_specialization", { length: 200 }),
  pgInstitute: varchar("pg_institute", { length: 200 }).notNull(),
  pgPassedYear: varchar("pg_passed_year", { length: 4 }).notNull(),
  pgCgpa: varchar("pg_cgpa", { length: 10 }).notNull(),
  pgCertificatePath: text("pg_certificate_path"),

  // Employment Details (JSON array) - min 2 required
  employmentDetails: jsonb("employment_details").$type<z.infer<typeof employmentEntrySchema>[]>(),

  // Required Files *
  transferCertificatePath: text("transfer_certificate_path"),
  nocCertificatePath: text("noc_certificate_path"),
  feeReceiptPath: text("fee_receipt_path"),
  casteCertificatePath: text("caste_certificate_path"),

  // Annual Turnover (Optional - only for private organizations)
  annualTurnover2324: varchar("annual_turnover_23_24", { length: 50 }),
  annualTurnover2425: varchar("annual_turnover_24_25", { length: 50 }),
  annualTurnover2526: varchar("annual_turnover_25_26", { length: 50 }),

  // Research Proposal *
  researchPlan: text("research_plan").notNull(),
  preliminaryStudyEvidence: text("preliminary_study_evidence"),
  researchFacilities: text("research_facilities"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  // File paths are handled separately
  sscCertificatePath: true,
  interCertificatePath: true,
  ugCertificatePath: true,
  pgCertificatePath: true,
  transferCertificatePath: true,
  nocCertificatePath: true,
  feeReceiptPath: true,
  casteCertificatePath: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
