import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from "express";
import ExcelJS from "exceljs";

const JWT_SECRET = process.env.SESSION_SECRET || "supersecretjwtkey";

// Ensure directories exist
const uploadsDir = path.join(process.cwd(), "uploads");
const subdirs = ["ssc", "inter", "ug", "pg", "transfer", "noc", "agreement", "receipts", "caste", "employment"];

subdirs.forEach(sub => {
  const dir = path.join(uploadsDir, sub);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});
const exportsDir = path.join(process.cwd(), "exports");
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Configure Multer
const storageConfig = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void): void {
    const fieldToDir: Record<string, string> = {
      sscCertificate: "ssc",
      interCertificate: "inter",
      ugCertificate: "ug",
      pgCertificate: "pg",
      transferCertificate: "transfer",
      nocCertificate: "noc",
      feeReceipt: "receipts",
      casteCertificate: "caste",
      nocCurrentOrganization: "noc",
    };
    // Handle employment certificate uploads
    if (file.fieldname?.startsWith('employmentDetails.')) {
      cb(null, path.join(uploadsDir, "employment"));
      return;
    }
    const sub = fieldToDir[file.fieldname] || "misc";
    cb(null, path.join(uploadsDir, sub));
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void): void {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storageConfig,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and Images are allowed."));
    }
  }
});

// Middleware for JWT auth
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      res.status(403).json({ message: "Invalid token" });
      return;
    }
    (req as any).user = user;
    next();
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Serve uploaded files statically so frontend can download them
  app.use('/uploads', express.static(path.join(process.cwd(), "uploads")));

  // Seed default admin if none exists
  const existingAdmin = await storage.getAdminByUsername('admin');
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await storage.createAdmin({ username: 'admin', password: hashedPassword });
  }

  // Admin login
  app.post(api.auth.adminLogin.path, async (req, res) => {
    try {
      const { username, password } = api.auth.adminLogin.input.parse(req.body);
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
        return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User registration
  app.post(api.users.register.path, upload.any(), async (req, res) => {
    try {
      const body = req.body;

      if (!body.name || !body.email || !body.password) {
        res.status(400).json({ message: "Name, email, and password are required" });
        return;
      }

      const existingUser = await storage.getUserByEmail(body.email);
      if (existingUser) {
        res.status(409).json({ message: "An application with this email already exists" });
        return;
      }

      const existingAadhaar = await storage.getUserByAadhaar(body.aadhaarNumber);
      if (existingAadhaar) {
        res.status(409).json({ message: "An application with this Aadhaar Number already exists" });
        return;
      }

      const existingPhone = await storage.getUserByPhone(body.phone);
      if (existingPhone) {
        res.status(409).json({ message: "An application with this phone number already exists" });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const getFilePath = (field: string) => {
        const file = files?.[field]?.[0];
        if (!file) return null;
        const subdirs: Record<string, string> = {
          sscCertificate: "ssc",
          interCertificate: "inter",
          ugCertificate: "ug",
          pgCertificate: "pg",
          transferCertificate: "transfer",
          nocCertificate: "noc",
          collaborationAgreement: "agreement",
          feeReceipt: "receipts",
          casteCertificate: "caste",
          nocCurrentOrganization: "noc",
        };
        return `/uploads/${subdirs[field]}/${file.filename}`;
      };

      const hashedPassword = await bcrypt.hash(body.password, 10);

      // Parse employment details if provided
      let employmentDetails = [];
      if (body.employmentDetails) {
        try {
          employmentDetails = typeof body.employmentDetails === 'string'
            ? JSON.parse(body.employmentDetails)
            : body.employmentDetails;

          employmentDetails = employmentDetails.map((emp: any, index: number) => {
            const fieldName = `employmentDetails.${index}.certificate`;
            const file = files?.[fieldName]?.[0];
            if (file) {
              return { ...emp, certificate: `/uploads/employment/${file.filename}` };
            }
            return emp;
          });
        } catch (e) {
          console.error("Error parsing employment details:", e);
        }
      }

      const newUser = await storage.createUser({
        // Personal Details
        name: body.name,
        email: body.email,
        password: hashedPassword,
        aadhaarNumber: body.aadhaarNumber,
        category: body.category,
        phone: body.phone,

        // SSC Educational Details
        sscQualification: body.sscQualification,
        sscSpecialization: body.sscSpecialization || '',
        sscInstitute: body.sscInstitute,
        sscPassedYear: body.sscPassedYear,
        sscPercentage: body.sscPercentage,
        sscCertificatePath: getFilePath('sscCertificate'),

        // Inter Educational Details
        interQualification: body.interQualification,
        interSpecialization: body.interSpecialization || '',
        interInstitute: body.interInstitute,
        interPassedYear: body.interPassedYear,
        interPercentage: body.interPercentage,
        interCertificatePath: getFilePath('interCertificate'),

        // UG Educational Details
        ugQualification: body.ugQualification,
        ugSpecialization: body.ugSpecialization || '',
        ugInstitute: body.ugInstitute,
        ugPassedYear: body.ugPassedYear,
        ugCgpa: body.ugCgpa,
        ugCertificatePath: getFilePath('ugCertificate'),

        // PG Educational Details
        pgQualification: body.pgQualification,
        pgSpecialization: body.pgSpecialization || '',
        pgInstitute: body.pgInstitute,
        pgPassedYear: body.pgPassedYear,
        pgCgpa: body.pgCgpa,
        pgCertificatePath: getFilePath('pgCertificate'),

        // Employment Details (JSON)
        employmentDetails: employmentDetails,

        // File Paths
        transferCertificatePath: getFilePath('transferCertificate'),
        nocCertificatePath: getFilePath('nocCurrentOrganization') || getFilePath('nocCertificate'),
        feeReceiptPath: getFilePath('feeReceipt'),
        casteCertificatePath: getFilePath('casteCertificate'),

        // Annual Turnover (Optional)
        annualTurnover2324: body.annualTurnover2324 || '',
        annualTurnover2425: body.annualTurnover2425 || '',
        annualTurnover2526: body.annualTurnover2526 || '',

        // Research Proposal
        researchPlan: body.researchPlan,
        preliminaryStudyEvidence: body.preliminaryStudyEvidence || '',
        researchFacilities: body.researchFacilities || '',
      });

      res.status(201).json({ message: "Registered successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get users (Admin only)
  app.get(api.users.list.path, authenticateToken, async (req, res) => {
    try {
      const users = await storage.getUsers();
      const safeUsers = users.map(u => {
        const { password, ...rest } = u;
        return rest;
      });
      res.json(safeUsers);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Export users to Excel (Admin only)
  app.get(api.users.export.path, authenticateToken, async (req, res) => {
    try {
      const users = await storage.getUsers();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Users');

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Define all columns
      worksheet.columns = [
        // Personal Details
        { header: 'S.No', key: 'serialNo', width: 6 },
        { header: 'Name *', key: 'name', width: 25 },
        { header: 'Email *', key: 'email', width: 30 },
        { header: 'Phone *', key: 'phone', width: 15 },
        { header: 'Aadhaar *', key: 'aadhaarNumber', width: 15 },
        { header: 'Category *', key: 'category', width: 12 },

        // SSC Details
        { header: 'SSC Qualification *', key: 'sscQualification', width: 15 },
        { header: 'SSC Specialization', key: 'sscSpecialization', width: 20 },
        { header: 'SSC Institute *', key: 'sscInstitute', width: 25 },
        { header: 'SSC Year *', key: 'sscPassedYear', width: 10 },
        { header: 'SSC % *', key: 'sscPercentage', width: 10 },
        { header: 'SSC Certificate', key: 'sscCertificatePath', width: 40 },

        // Inter Details
        { header: 'Inter Qualification *', key: 'interQualification', width: 15 },
        { header: 'Inter Specialization', key: 'interSpecialization', width: 20 },
        { header: 'Inter Institute *', key: 'interInstitute', width: 25 },
        { header: 'Inter Year *', key: 'interPassedYear', width: 10 },
        { header: 'Inter % *', key: 'interPercentage', width: 10 },
        { header: 'Inter Certificate', key: 'interCertificatePath', width: 40 },

        // UG Details
        { header: 'UG Qualification *', key: 'ugQualification', width: 15 },
        { header: 'UG Specialization', key: 'ugSpecialization', width: 20 },
        { header: 'UG Institute *', key: 'ugInstitute', width: 25 },
        { header: 'UG Year *', key: 'ugPassedYear', width: 10 },
        { header: 'UG CGPA *', key: 'ugCgpa', width: 10 },
        { header: 'UG Certificate', key: 'ugCertificatePath', width: 40 },

        // PG Details
        { header: 'PG Qualification *', key: 'pgQualification', width: 15 },
        { header: 'PG Specialization', key: 'pgSpecialization', width: 20 },
        { header: 'PG Institute *', key: 'pgInstitute', width: 25 },
        { header: 'PG Year *', key: 'pgPassedYear', width: 10 },
        { header: 'PG CGPA *', key: 'pgCgpa', width: 10 },
        { header: 'PG Certificate', key: 'pgCertificatePath', width: 40 },

        // Employment Details
        { header: 'Employment Details', key: 'employmentDetails', width: 60 },

        // Annual Turnover (Optional)
        { header: 'Turnover 23-24', key: 'annualTurnover2324', width: 15 },
        { header: 'Turnover 24-25', key: 'annualTurnover2425', width: 15 },
        { header: 'Turnover 25-26', key: 'annualTurnover2526', width: 15 },

        // Research Proposal
        { header: 'Research Plan *', key: 'researchPlan', width: 50 },
        { header: 'Preliminary Study', key: 'preliminaryStudyEvidence', width: 40 },
        { header: 'Research Facilities', key: 'researchFacilities', width: 40 },

        // File Links
        { header: 'Transfer Certificate', key: 'transferCertificatePath', width: 40 },
        { header: 'NOC Certificate', key: 'nocCertificatePath', width: 40 },
        { header: 'Fee Receipt', key: 'feeReceiptPath', width: 40 },
        { header: 'Caste Certificate', key: 'casteCertificatePath', width: 40 },

        // Meta
        { header: 'Created Date', key: 'createdAt', width: 20 }
      ];

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      users.forEach((user, index) => {
        // Format employment details as readable string
        let employmentStr = '';
        if (user.employmentDetails && Array.isArray(user.employmentDetails)) {
          employmentStr = user.employmentDetails.map((emp: any, idx: number) =>
            `Emp${idx + 1}: ${emp.organizationName || ''} (${emp.organizationType || ''}), ${emp.designation || ''}, ${emp.yearsOfExperience || 0} yrs`
          ).join(' | ');
        }

        const row = {
          serialNo: index + 1,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          aadhaarNumber: user.aadhaarNumber || '',
          category: user.category || '',

          // SSC
          sscQualification: user.sscQualification || '',
          sscSpecialization: user.sscSpecialization || '',
          sscInstitute: user.sscInstitute || '',
          sscPassedYear: user.sscPassedYear || '',
          sscPercentage: user.sscPercentage || '',
          sscCertificatePath: user.sscCertificatePath ? `${baseUrl}${user.sscCertificatePath}` : '',

          // Inter
          interQualification: user.interQualification || '',
          interSpecialization: user.interSpecialization || '',
          interInstitute: user.interInstitute || '',
          interPassedYear: user.interPassedYear || '',
          interPercentage: user.interPercentage || '',
          interCertificatePath: user.interCertificatePath ? `${baseUrl}${user.interCertificatePath}` : '',

          // UG
          ugQualification: user.ugQualification || '',
          ugSpecialization: user.ugSpecialization || '',
          ugInstitute: user.ugInstitute || '',
          ugPassedYear: user.ugPassedYear || '',
          ugCgpa: user.ugCgpa || '',
          ugCertificatePath: user.ugCertificatePath ? `${baseUrl}${user.ugCertificatePath}` : '',

          // PG
          pgQualification: user.pgQualification || '',
          pgSpecialization: user.pgSpecialization || '',
          pgInstitute: user.pgInstitute || '',
          pgPassedYear: user.pgPassedYear || '',
          pgCgpa: user.pgCgpa || '',
          pgCertificatePath: user.pgCertificatePath ? `${baseUrl}${user.pgCertificatePath}` : '',

          // Employment
          employmentDetails: employmentStr,

          // Annual Turnover
          annualTurnover2324: user.annualTurnover2324 || '',
          annualTurnover2425: user.annualTurnover2425 || '',
          annualTurnover2526: user.annualTurnover2526 || '',

          // Research
          researchPlan: user.researchPlan || '',
          preliminaryStudyEvidence: user.preliminaryStudyEvidence || '',
          researchFacilities: user.researchFacilities || '',

          // Files
          transferCertificatePath: user.transferCertificatePath ? `${baseUrl}${user.transferCertificatePath}` : '',
          nocCertificatePath: user.nocCertificatePath ? `${baseUrl}${user.nocCertificatePath}` : '',
          feeReceiptPath: user.feeReceiptPath ? `${baseUrl}${user.feeReceiptPath}` : '',
          casteCertificatePath: user.casteCertificatePath ? `${baseUrl}${user.casteCertificatePath}` : '',

          // Meta
          createdAt: user.createdAt?.toISOString() || ''
        };

        worksheet.addRow(row);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'users.xlsx');

      await workbook.xlsx.write(res);
      res.end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
