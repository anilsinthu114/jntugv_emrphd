import { google } from "googleapis";
import path from "path";
import fs from "fs";
import { Express } from "express";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

let driveService: ReturnType<typeof google.drive> | null = null;

export function getDriveService() {
  if (driveService) return driveService;

  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.warn("⚠️ Google Drive credentials missing in .env. Uploads will be mocked.");
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );

  oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  driveService = google.drive({
    version: "v3",
    auth: oauth2Client,
  });

  return driveService;
}

/**
 * Uploads a file to Google Drive and returns the webViewLink
 * @param file The multer file object
 */
export async function uploadFileToDrive(file: Express.Multer.File): Promise<string> {
  const drive = getDriveService();

  if (!drive) {
    // Mock the upload if credentials are not configured
    console.log(`[MOCK] Uploaded ${file.originalname} to Google Drive.`);
    return `https://mock-drive-link.com/${file.filename}`;
  }

  try {
    const fileMetadata = {
      name: file.filename,
    };
    
    // Determine mimeType (Google Drive sometimes handles generic content poorly, so it's good to specify)
    const mimeType = file.mimetype || "application/octet-stream";

    const media = {
      mimeType,
      body: fs.createReadStream(file.path),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, webViewLink",
    });

    if (!response.data || !response.data.id || !response.data.webViewLink) {
        throw new Error("Failed to get file ID or Link from Google Drive");
    }

    const fileId = response.data.id;

    // Optional: Make it publicly accessible (anyone with the link can view)
    // If these are sensitive documents, you might want a different permission model.
    try {
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });
    } catch (permError) {
        console.error("Failed to set public permissions:", permError);
    }
    
    // Return the viewable link
    return response.data.webViewLink;

  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw error;
  }
}
