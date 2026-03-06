import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LogOut, LayoutDashboard, Users, ShieldAlert } from "lucide-react";
import { useAdminLogout } from "@/hooks/use-auth";
import { gapi } from "gapi-script";
import * as XLSX from "xlsx";

// Google Drive API Config
const CLIENT_ID = "917377890887-45fuc8usj2q57ipk4pf4aqfbkjr2enf1.apps.googleusercontent.com"; // replace with your OAuth Client ID
const API_KEY = "AIzaSyA7RYFdMduNEFxnrzxmm3z18hFHs_8mq04";           // replace with your API Key
const SCOPE = "https://www.googleapis.com/auth/drive.file";

// Initialize Google API
function initGoogleDrive() {
  gapi.load("client:auth2", () => {
    gapi.auth2.init({ client_id: CLIENT_ID });
    gapi.client.setApiKey(API_KEY);
  });
}

async function authenticate() {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn({ scope: SCOPE });
  }
}

// Create folder in Drive (returns folderId)
async function createFolder(folderName: string) {
  await authenticate();
  const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

  // Check if folder already exists
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  if (data.files && data.files.length > 0) return data.files[0].id;

  // Create folder if not exists
  const metadata = { name: folderName, mimeType: "application/vnd.google-apps.folder" };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));

  const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  const createData = await createRes.json();
  return createData.id;
}

// Upload file to Drive folder
async function uploadFileToFolder(fileName: string, fileBlob: Blob, folderId: string) {
  await authenticate();
  const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

  const metadata = { name: fileName, parents: [folderId] };
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
  form.append("file", fileBlob);

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    { method: "POST", headers: { Authorization: `Bearer ${accessToken}` }, body: form }
  );
  const data = await res.json();
  return data.id;
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const logout = useAdminLogout();
  const [users, setUsers] = useState([
    { name: "John Doe", regId: "12345", fee: 5000 },
    { name: "Jane Smith", regId: "12346", fee: 4500 },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) setLocation("/admin/login");
    initGoogleDrive();
  }, [setLocation]);

  // Upload individual receipt PDF
  const handleUploadReceipt = async (user: { name: string; regId: string; fee: number }) => {
    try {
      const folderId = await createFolder("users");
      const fileContent = `Name: ${user.name}\nRegistration ID: ${user.regId}\nFee Paid: ₹${user.fee}`;
      const fileBlob = new Blob([fileContent], { type: "application/pdf" });
      const fileId = await uploadFileToFolder(`Receipt_${user.regId}.pdf`, fileBlob, folderId);
      alert(`Receipt uploaded! File ID: ${fileId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to upload receipt!");
    }
  };

  // Export all users to Excel and upload to Drive
  const handleExportExcel = async () => {
  try {
    const folderId = await createFolder("users");
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(users);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Corrected way to create Blob
    const excelArrayBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const excelBlob = new Blob([excelArrayBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const fileId = await uploadFileToFolder("Users_Data.xlsx", excelBlob, folderId);
    alert(`Excel uploaded to Drive! File ID: ${fileId}`);
  } catch (err) {
    console.error(err);
    alert("Failed to upload Excel!");
  }
};

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 border-r border-white/10 bg-white/[0.02] backdrop-blur-2xl flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
              <ShieldAlert className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg">EMR Admin</h2>
              <p className="text-xs text-white/40">Secure Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <div className="flex items-center space-x-3 px-4 py-3 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all cursor-not-allowed opacity-50">
            <Users className="w-5 h-5" />
            <span className="font-medium">Settings (Soon)</span>
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}

          {/* Users Table */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Users</h3>
            <button
              onClick={handleExportExcel}
              className="mb-4 px-4 py-2 bg-green-500 rounded hover:bg-green-600"
            >
              Export Excel to Drive
            </button>
            <table className="w-full text-left border-collapse border border-white/10">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-2 border border-white/10">Name</th>
                  <th className="p-2 border border-white/10">Reg ID</th>
                  <th className="p-2 border border-white/10">Fee Paid</th>
                  <th className="p-2 border border-white/10">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.regId} className="hover:bg-white/10">
                    <td className="p-2 border border-white/10">{user.name}</td>
                    <td className="p-2 border border-white/10">{user.regId}</td>
                    <td className="p-2 border border-white/10">₹{user.fee}</td>
                    <td className="p-2 border border-white/10">
                      <button
                        onClick={() => handleUploadReceipt(user)}
                        className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
                      >
                        Upload Receipt to Drive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}