import getAdmin from '../config/firebaseAdmin.js';

export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'unauthorized', message: 'Missing or malformed Authorization header. Expected: Bearer <idToken>' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken) {
    return res.status(401).json({ error: 'unauthorized', message: 'Token is empty' });
  }

  try {
    const admin = getAdmin(); // lazy init — first call validates env var and initializes SDK
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decoded.uid,
      email: decoded.email || '',
      name: decoded.name || '',
      picture: decoded.picture || '',
    };
    next();
  } catch (err) {
    const code = err.code || 'auth/internal-error';
    return res.status(401).json({ error: code, message: 'Invalid or expired token' });
  }
}
