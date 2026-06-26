import admin from "firebase-admin";
import path from "path";

// Initialize once — guard prevents double-init (e.g. in test environments)
if (!admin.apps.length) {
  let serviceAccount: any;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env variable:", error);
    }
  }

  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    try {
      const serviceAccountPath = path.resolve(
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH
      );
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      serviceAccount = require(serviceAccountPath);
    } catch (error) {
      console.error("❌ Failed to load service account key from path:", error);
    }
  }

  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("✅ Firebase Admin SDK initialized");
  } else {
    console.warn("⚠️ Firebase Admin SDK was NOT initialized: No credentials provided.");
  }
}

export default admin;
