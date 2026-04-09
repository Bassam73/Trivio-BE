import admin from "firebase-admin";
import path from "path";

// Initialize once — guard prevents double-init (e.g. in test environments)
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH as string,
  );

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require(serviceAccountPath);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log("✅ Firebase Admin SDK initialized");
}

export default admin;
