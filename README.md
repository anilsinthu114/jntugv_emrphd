# EMR Ph.D Programme Portal

## Project Overview

Welcome to the **EMR Ph.D Programme Portal**, a comprehensive full-stack web application designed to facilitate the online application and registration process for the Ph.D Programme under Extra-Mural Research (EMR) at JNTUGV.

This platform provides a seamless, dynamic, and secure environment for aspiring researchers to submit their personal, educational, employment, and research proposal details along with the required document uploads. For administrators, it offers a protected dashboard to review applications and export structured data.

### Tech Stack
- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Framer Motion, React Hook Form + Zod, Wouter, Radix UI.
- **Backend:** Node.js, Express.js, TypeScript, Multer.
- **Database:** PostgreSQL with Drizzle ORM.
- **Security:** JSON Web Tokens (JWT) for Admin Authentication, bcrypt for password hashing.
- **Utilities:** ExcelJS for exporting applicant data.

---

## Application Flow State

1. **Public Landing Page**
   - Users land on a modern, responsive Glassmorphism-style homepage.
   - Includes information about the EMR program, fee structures, and immediate calls-to-action to begin the registration process.

2. **Applicant Registration Process**
   - **Data Entry:** Applicants fill out a detailed multi-section form capturing Personal Info, Educational Qualifications (SSC, Inter, UG, PG), Employment Details (dynamic scaling for multiple experiences), and Research Proposals.
   - **Document Uploads:** Secure direct file uploads for essential proofs including Transfer Certificates, NOCs, Fee Receipts, and Caste Certificates. The client restricts formats to PDFs/Images.
   - **Validation:** Real-time data validation via Zod schemas instantly flags missing or incorrectly formatted data. It also performs asynchronous backend checks to prevent duplicate submissions based on Email, Aadhaar, or Phone Number.
   - **Submission:** Upon successful validation, the data and files are packaged securely into `FormData` and transmitted to the API.

3. **Backend Processing**
   - **Routing & Storage:** Express handles incoming POST requests. Multer parses the multipart form data, routing specific file types to dedicated static folders (`/uploads/ssc`, `/uploads/noc`, etc.).
   - **Database Insertion:** Structured JSON payloads are mapped to database columns and securely inserted into a PostgreSQL database using Drizzle ORM.
   - **Response:** The server returns specific conflict messages (409) or success indicators (201), driving intuitive UI feedback for the user (Success Splash Screen).

4. **Admin Management Dashboard**
   - **Authentication:** Administrators log in through a secured route protected by JWTs.
   - **Data Review:** A comprehensive data table displays all sorted applicant records, serving file paths as direct, clickable links to the uploaded proofs.
   - **Data Export:** Admins can trigger exactly one-click Excel structure exports mapping all candidate details and file hyperlinks using ExcelJS.

---

## Directory Structure

```text
Asset-Manager/
├── .gitignore               # Ignored files, node_modules, and local uploads/
├── package.json             # Core dependencies and runtime scripts
├── drizzle.config.ts        # Database migration configuration
├── client/                  # Frontend Application Layer (React + Vite)
│   ├── index.html           # HTML entry point
│   ├── src/
│   │   ├── components/      # Reusable UI components (ui/button, ui/input, file-upload)
│   │   ├── hooks/           # Custom React Query hooks (use-users, use-toast)
│   │   ├── pages/           # View level components (Home.tsx, Register.tsx, Admin.tsx)
│   │   ├── lib/             # Utility functions
│   │   └── App.tsx          # Main React router implementation
├── server/                  # Backend API Layer (Express)
│   ├── index.ts             # Express server initialization and static serving
│   ├── routes.ts            # API Endpoint definitions (Multer configs, POST/GET)
│   ├── storage.ts           # Database interaction interface
│   ├── db.ts                # Drizzle ORM PostgreSQL connection instance
│   └── auth.ts              # JWT configuration and Passport strategies
└── shared/                  # Type-safe schemas shared between Frontend and Backend
    ├── schema.ts            # Drizzle table schemas and Zod inferred types
    └── routes.ts            # Typed API contract points
```

---

## Credits & Contributors

### Authors & Core Maintainers
- **Anil Sinthu** - Lead Developer/Programmer, JNTU-GV (Deployment, Maintenance, Revamping, and full-stack development of the application)
- **Anitha Palasa** - Repository Owner & Designer (Architected the initial scratch blueprint and application flow)

### Professional Backend & Platform Development
This application was architected and guided by professional-grade development standards emphasizing:
- Zero Trust Architecture considerations.
- Strict Type-Safety spanning the full stack boundary (Shared Zod Schemas).
- Optimized Database Querying algorithms.
- Secure, granular multipart file handling using isolated disk storage techniques.
- Seamless Modern User Experience (Dynamic CSS + Framer Motion).

*Thank you for exploring the EMR Ph.D Programme Portal. We invite you to review the codebase and deploy it securely.*
