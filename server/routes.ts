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
const subdirs = ["ssc", "ug", "pg", "transfer", "noc", "agreement", "receipts"];

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
  destination: function (req, file, cb) {
    const fieldToDir: Record<string, string> = {
      sscCertificate: "ssc",
      ugCertificate: "ug",
      pgCertificate: "pg",
      transferCertificate: "transfer",
      nocCertificate: "noc",
      collaborationAgreement: "agreement",
      feeReceipt: "receipts"
    };
    const sub = fieldToDir[file.fieldname] || "misc";
    cb(null, path.join(uploadsDir, sub));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storageConfig });

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
  app.post(api.users.register.path, upload.fields([
    { name: 'sscCertificate', maxCount: 1 },
    { name: 'ugCertificate', maxCount: 1 },
    { name: 'pgCertificate', maxCount: 1 },
    { name: 'transferCertificate', maxCount: 1 },
    { name: 'nocCertificate', maxCount: 1 },
    { name: 'collaborationAgreement', maxCount: 1 },
    { name: 'feeReceipt', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const body = req.body;
      
      if (!body.name || !body.email || !body.password) {
        res.status(400).json({ message: "Name, email, and password are required" });
        return;
      }

      const existingUser = await storage.getUserByEmail(body.email);
      if (existingUser) {
        res.status(409).json({ message: "Email already exists" });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const getFilePath = (field: string) => {
        const file = files?.[field]?.[0];
        if (!file) return null;
        const subdirs: Record<string, string> = {
          sscCertificate: "ssc",
          ugCertificate: "ug",
          pgCertificate: "pg",
          transferCertificate: "transfer",
          nocCertificate: "noc",
          collaborationAgreement: "agreement",
          feeReceipt: "receipts"
        };
        return `/uploads/${subdirs[field]}/${file.filename}`;
      };

      const hashedPassword = await bcrypt.hash(body.password, 10);

      const newUser = await storage.createUser({
        ...body,
        password: hashedPassword,
        experience: body.experience ? parseInt(body.experience) : null,
        numEmployeesTech: body.numEmployeesTech ? parseInt(body.numEmployeesTech) : null,
        sscCertificatePath: getFilePath('sscCertificate'),
        ugCertificatePath: getFilePath('ugCertificate'),
        pgCertificatePath: getFilePath('pgCertificate'),
        transferCertificatePath: getFilePath('transferCertificate'),
        nocCertificatePath: getFilePath('nocCertificate'),
        collaborationAgreementPath: getFilePath('collaborationAgreement'),
        feeReceiptPath: getFilePath('feeReceipt'),
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

      worksheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Organization', key: 'organization', width: 30 },
        { header: 'Experience', key: 'experience', width: 15 },
        { header: 'Registration Details Link', key: 'registrationDetailsPath', width: 40 },
        { header: 'Fee Receipt Link', key: 'feeReceiptPath', width: 40 },
        { header: 'Created Date', key: 'createdAt', width: 25 }
      ];

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      users.forEach(user => {
        worksheet.addRow({
          name: user.name,
          email: user.email,
          phone: user.phone || 'N/A',
          organization: user.organization || 'N/A',
          experience: user.experience || 0,
          registrationDetailsPath: user.registrationDetailsPath ? `${baseUrl}${user.registrationDetailsPath}` : 'N/A',
          feeReceiptPath: user.feeReceiptPath ? `${baseUrl}${user.feeReceiptPath}` : 'N/A',
          createdAt: user.createdAt?.toISOString() || ''
        });
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