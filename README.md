# **Google Drive Ownership Transfer Tool**

This tool allows you to automatically transfer ownership of files in Google Drive from one account to another. It uses the Google Drive API and Gmail API to initiate the transfer and send email notifications to the new owner.

---

## **Features**
- Transfer ownership of Google Drive files programmatically.
- Send email notifications to the new owner via Gmail API.
- Save and reuse OAuth 2.0 credentials for seamless authentication.

---

## **Prerequisites**
1. **Node.js** installed (v16 or higher).
2. A **Google Cloud Project** with the Google Drive API and Gmail API enabled.
3. OAuth 2.0 credentials (Client ID and Client Secret) downloaded as a JSON file.

---

## **Setup Instructions**

### **Step 1: Set Up Google Cloud Project**
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the **Google Drive API** and **Gmail API**:
   - Navigate to **APIs & Services > Library**.
   - Search for "Google Drive API" and "Gmail API" and enable them.
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth Client ID**.
   - Choose **Desktop App** as the application type.
   - Download the credentials JSON file and rename it to `credentials_desktop.json`.

---

### **Step 2: Set Up the Project**
1. Clone this repository:
   ```bash
   git clone https://github.com/balanarenmar/drive-ownership-transfer.git
   cd drive-ownership-transfer
   ```
2. Check the installation of Node.js and npm:
   ```bash
   node -v
   npm -v
   ```
3. Initialize a Node.js project:
   ```bash
   npm init -y
   ```
4. Install the required dependencies:
   ```bash
   npm install googleapis @google-cloud/local-auth dotenv
   ```
5. Place the `credentials_desktop.json` file in the root directory of the project.

---

### **Step 3: Configure Environment Variables**
1. Create a `.env` file in the root directory:
   ```bash
   touch .env
   ```
2. Add the following variables to the `.env` file:
   ```
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-client-secret
   ```

---

### **Step 4: Authenticate and Authorize**
1. Run the script for the first time:
   ```bash
   node transfer_ownership.js
   ```
2. A browser window will open, prompting you to log in to your Google account and authorize the app.
3. After authorization, a `token.json` file will be created in the root directory. This file stores your OAuth 2.0 credentials for future use.

---

### **Step 5: Transfer Ownership**
1. Update the `fileId` and `newOwnerEmail` variables in the `transfer_ownership.js` file:
   ```javascript
   const fileId = 'YOUR_FILE_ID'; // Replace with your Google Drive file ID
   const newOwnerEmail = 'new-owner@gmail.com'; // Replace with the new owner's email
   ```
2. Run the script again:
   ```bash
   node transfer_ownership.js
   ```
3. The script will:
   - Transfer ownership of the specified file to the new owner.
   - Send an email notification to the new owner via Gmail API.

---

## **How It Works**
1. **Authentication**:
   - The script uses OAuth 2.0 to authenticate with Google APIs.
   - Credentials are saved in `token.json` for reuse.
2. **Ownership Transfer**:
   - The script uses the Google Drive API to update file permissions and initiate the ownership transfer.
3. **Email Notification**:
   - The Gmail API sends an email to the new owner with a link to the file.

---

## **Important Notes**
- **Google Workspace Account Restrictions**:
  - If the file is shared between different Google Workspace accounts, the transfer may be restricted by admin policies.
  - Ownership transfer is only allowed between accounts within the same Google Workspace domain (e.g., `foo@example.com` to `bar@example.com`).
  - Transfers between personal Google accounts (e.g., `foo@gmail.com` to `bar@gmail.com`) are not supported due to security restrictions.

---

## **Deployment**
### **Local Deployment**
- Run the script on your local machine using Node.js:
  ```bash
  node transfer_ownership.js
  ```

### **Cloud Deployment**
1. **Google Cloud Functions**:
   - Deploy the script as a Google Cloud Function.
   - Use the `transfer_ownership.js` file as the entry point.
2. **Docker**:
   - Create a Docker container for the script and deploy it to a cloud platform like Google Cloud Run or AWS Lambda.

---

## **Troubleshooting**
- **Invalid Credentials**: Ensure the `credentials_desktop.json` and `token.json` files are correctly configured.
- **API Quota Exceeded**: Check your Google Cloud Project's API quota and request an increase if necessary.
- **Email Not Sent**: Verify that the Gmail API is enabled and the sender's email address is valid.
- **Ownership Transfer Failed**: Ensure both the old and new owners are in the same Google Workspace domain.

---
