const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');
const { authenticate } = require('@google-cloud/local-auth');
require('dotenv').config();

const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials_desktop.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

const SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
  ];

  async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  async function saveCredentials(client) {
    try {
      const content = await fs.readFile(CREDENTIALS_PATH);
      const keys = JSON.parse(content);
      const key = keys.installed || keys.web; // Support both types
  
      const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token, // Important!
      });
  
      await fs.writeFile(TOKEN_PATH, payload);
      console.log("Token saved successfully!");
    } catch (err) {
      console.error('Error saving credentials:', err);
      throw err;
    }
  }
  
async function sendGmailNotification(auth, to, fileId) {
  const gmail = google.gmail({ version: 'v1', auth });
  
  const subject = 'Accept Google Drive Ownership Transfer';
  const messageContent = `Please accept the ownership transfer for the file: https://drive.google.com/file/d/${fileId}/view`;
  
  const emailLines = [
    'From: "Google Drive Transfer" <balanarenmar@gmail.com>',
    `To: ${to}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    messageContent
  ];
  
  const email = emailLines.join('\r\n');
  
  const encodedEmail = Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });
    console.log('Email notification sent successfully');
  } catch (error) {
    console.error('Error sending email notification:', error.message);
  }
}

async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      console.log("Using saved credentials...");
      return client;
    }
  
    console.log("No saved credentials found. Performing authentication...");
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
  
    if (client.credentials) {
      await saveCredentials(client);
    }
  
    return client;
  }
  

async function transferOwnership(authClient, fileId, newOwnerEmail) {
  const drive = google.drive({ version: 'v3', auth: authClient });

  try {
    // Step 1: List all permissions on the file
    const res1 = await drive.permissions.list({
      fileId,
      supportsAllDrives: true,
      pageSize: 100,
      fields: "*",
    });

    // Step 2: Check if the target user already has a permission
    const permission = res1.data.permissions.find(
      ({ emailAddress }) => emailAddress === newOwnerEmail
    );

    let permissionId = "";

    if (permission) {
      // If the permission exists, use its ID
      permissionId = permission.id;
    } else {
      // If the permission does not exist, create a new one
      const { data: { id } } = await drive.permissions.create({
        fileId: fileId,
        sendNotificationEmail: true,
        supportsAllDrives: true,
        requestBody: {
          role: "writer",
          type: "user",
          emailAddress: newOwnerEmail,
        },
      });
      permissionId = id;
    }

    // Step 3: Update the permission to set `pendingOwner: true`
    const res2 = await drive.permissions.update({
      fileId,
      permissionId,
      supportsAllDrives: true,
      requestBody: {
        role: "writer",
        pendingOwner: true,
      },
    });

    console.log("Permission updated successfully:", res2.data);
    console.log(`Ownership transfer initiated for ${newOwnerEmail}. They will receive a notification from Google Drive.`);

    // Step 4: Send additional email notification via Gmail API
    await sendGmailNotification(authClient, newOwnerEmail, fileId);

  } catch (error) {
    console.error('Error transferring ownership:', error.message);
  }
}

(async () => {
  const authClient = await authorize();

  const fileId = '1MVnXEQo_vd7Z1QXILznvN0v_aVvVMiIT';  // Replace with your Google Drive file ID
  const newOwnerEmail = 'balanarene12@gmail.com';      // Replace with new owner 

  await transferOwnership(authClient, fileId, newOwnerEmail);
})();