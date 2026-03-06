import { db } from "./db";
import { users, admins, type InsertUser, type User, type InsertAdmin, type Admin } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByAadhaar(aadhaar: string): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser & {
    password: string;
    // All file paths
    sscCertificatePath?: string | null;
    interCertificatePath?: string | null;
    ugCertificatePath?: string | null;
    pgCertificatePath?: string | null;
    transferCertificatePath?: string | null
    nocCertificatePath?: string | null;
    feeReceiptPath?: string | null;
    casteCertificatePath?: string | null;
    // Employment details as JSON
    employmentDetails?: any;
  }): Promise<User>;
  getUsers(): Promise<User[]>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByAadhaar(aadhaar: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.aadhaarNumber, aadhaar));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(user: InsertUser & {
    password: string;
    sscCertificatePath?: string | null;
    interCertificatePath?: string | null;
    ugCertificatePath?: string | null;
    pgCertificatePath?: string | null;
    transferCertificatePath?: string | null;
    nocCertificatePath?: string | null;
    feeReceiptPath?: string | null;
    casteCertificatePath?: string | null;
    employmentDetails?: any;
  }): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }
}

export const storage = new DatabaseStorage();
