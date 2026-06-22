import admin from 'firebase-admin';

let initialized = false;

/**
 * Lazily initializes and returns the Firebase Admin SDK instance.
 * The env var is only read when this function is first called,
 * not at module import time — so CI smoke tests can import routes
 * without setting FIREBASE_SERVICE_ACCOUNT_BASE64.
 */
function getAdmin() {
  if (initialized) return admin;

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is required. ' +
      'Encode your service account JSON: base64 -w0 < serviceAccountKey.json'
    );
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(
      Buffer.from(serviceAccountBase64, 'base64').toString('utf-8')
    );
  } catch (err) {
    throw new Error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64. ' +
      'Ensure it is a valid base64-encoded JSON service account key.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  initialized = true;
  return admin;
}

export default getAdmin;
