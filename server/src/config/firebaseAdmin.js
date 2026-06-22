import admin from 'firebase-admin';

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

export default admin;
