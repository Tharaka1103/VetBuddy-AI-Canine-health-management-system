import { google } from "googleapis"
import { Readable } from "stream"

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"),
  scopes: ["https://www.googleapis.com/auth/drive"],
})

const drive = google.drive({ version: "v3", auth })

export async function uploadImageToGoogleDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string = "image/jpeg"
): Promise<{ fileId: string; webViewLink: string }> {
  try {
    const stream = Readable.from(fileBuffer)

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID || ""],
      },
      media: {
        mimeType: mimeType,
        body: stream,
      },
      fields: "id, webViewLink, webContentLink",
    })

    const fileId = response.data.id
    const webViewLink = response.data.webViewLink

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: fileId!,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    // Get the public download link
    const file = await drive.files.get({
      fileId: fileId!,
      fields: "webContentLink",
    })

    return {
      fileId: fileId!,
      webViewLink: file.data.webContentLink!,
    }
  } catch (error) {
    console.error("Error uploading to Google Drive:", error)
    throw error
  }
}

export async function deleteImageFromGoogleDrive(
  fileId: string
): Promise<void> {
  try {
    await drive.files.delete({
      fileId: fileId,
    })
  } catch (error) {
    console.error("Error deleting from Google Drive:", error)
    throw error
  }
}

export async function getImageUrl(fileId: string): Promise<string> {
  try {
    const file = await drive.files.get({
      fileId: fileId,
      fields: "webContentLink, webViewLink",
    })

    return file.data.webContentLink || file.data.webViewLink || ""
  } catch (error) {
    console.error("Error getting image URL:", error)
    throw error
  }
}
