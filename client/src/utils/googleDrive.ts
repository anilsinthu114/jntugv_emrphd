// googleDrive.ts
import { gapi } from 'gapi-script';

const CLIENT_ID = "917377890887-45fuc8usj2q57ipk4pf4aqfbkjr2enf1.apps.googleusercontent.com";
const API_KEY = "AIzaSyA7RYFdMduNEFxnrzxmm3z18hFHs_8mq04";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

/**
 * Initialize Google API client
 */
export async function initGoogleDrive(): Promise<void> {
  return new Promise((resolve, reject) => {
    gapi.load("client:auth2", async () => {
      try {
        await gapi.auth2.init({ client_id: CLIENT_ID });
        gapi.client.setApiKey(API_KEY);
        resolve();
      } catch (err) {
        console.error("Error initializing gapi:", err);
        reject(err);
      }
    });
  });
}

/**
 * Authenticate user via Google OAuth
 */
export async function authenticate(): Promise<void> {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance) throw new Error("Google API not initialized");

  if (!authInstance.isSignedIn.get()) {
    await authInstance.signIn({ scope: SCOPE });
  }
}

/**
 * Upload a PDF file to Google Drive
 * @param fileName Name of the file in Drive
 * @param fileContent Content of the file (string or binary)
 * @returns { id: string, downloadLink: string }
 */
export async function uploadFile(fileName: string, fileContent: string | ArrayBuffer) {
  try {
    // Create Blob for PDF
    const file = new Blob([fileContent], { type: "application/pdf" });

    // Metadata for Drive file
    const metadata = { name: fileName, mimeType: "application/pdf" };

    // Get current user's access token
    const accessToken = gapi.auth2
      .getAuthInstance()
      .currentUser.get()
      .getAuthResponse().access_token;

    // Prepare multipart/form-data request
    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    // Upload file to Google Drive
    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      }
    );

    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
    const data = await res.json();

    return {
      id: data.id,
      downloadLink: `https://drive.google.com/uc?id=${data.id}&export=download`,
    };
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
}

/**
 * Example usage (can be used in frontend)
 */
export async function exampleUpload() {
  try {
    await initGoogleDrive();
    await authenticate();
    const result = await uploadFile(
      "RegistrationDetails.pdf",
      "Hello! This is the registration details content."
    );
    console.log("File uploaded successfully:", result);
  } catch (err) {
    console.error(err);
  }
}