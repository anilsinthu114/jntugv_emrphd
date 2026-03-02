import { pgTable, text, serial, integer, timestamp, varchar, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).notNull().unique(),
  password: text("password").notNull(),
  
  // Section A - Personal Details
  aadhaarNumber: varchar("aadhaar_number", { length: 12 }),
  category: varchar("category", { length: 20 }), // BC/SC/ST/OC
  phone: varchar("phone", { length: 20 }),
  
  // Section B - Educational Details (Paths)
  sscCertificatePath: text("ssc_certificate_path"),
  ugCertificatePath: text("ug_certificate_path"),
  pgCertificatePath: text("pg_certificate_path"),
  transferCertificatePath: text("transfer_certificate_path"),
  
  // Section C - Employment Details
  organization: varchar("organization", { length: 200 }),
  experience: integer("experience"),
  organizationType: varchar("organization_type", { length: 50 }), // Private / Govt / PSU
  annualTurnover2324: numeric("annual_turnover_23_24"),
  annualTurnover2425: numeric("annual_turnover_24_25"),
  numEmployeesTech: integer("num_employees_tech"),
  nocCertificatePath: text("noc_certificate_path"),
  collaborationAgreementPath: text("collaboration_agreement_path"),
  
  // Section D - Research Proposal
  researchPlan: text("research_plan"), // Min 500 words
  preliminaryStudyEvidence: text("preliminary_study_evidence"),
  researchFacilities: text("research_facilities"),
  
  // Section E - Fee Payment (Path to receipt remains)
  feeReceiptPath: text("fee_receipt_path"),
  
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
  sscCertificatePath: true,
  ugCertificatePath: true,
  pgCertificatePath: true,
  transferCertificatePath: true,
  nocCertificatePath: true,
  collaborationAgreementPath: true,
  feeReceiptPath: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
