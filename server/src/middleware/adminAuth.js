const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()).filter(Boolean);

export function requireAdmin(req, res, next) {
    if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
    }
    if (ADMIN_EMAILS.length === 0) {
        return res.status(403).json({ error: 'forbidden', message: 'No admin emails configured' });
    }
    if (!ADMIN_EMAILS.includes(req.user.email.toLowerCase())) {
        return res.status(403).json({ error: 'forbidden', message: 'Admin access required' });
    }
    next();
}
