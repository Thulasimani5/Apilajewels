const crypto = require('crypto');

const isProduction = process.env.NODE_ENV === 'production';

const visitorMiddleware = (req, res, next) => {
  let visitorId = req.cookies.visitor_id;

  if (!visitorId) {
    visitorId = crypto.randomUUID();

    // In production: Secure+SameSite=none for cross-origin HTTPS requests.
    // In development: Secure=false+SameSite=lax — browsers block Secure cookies
    // over plain HTTP, which would break local dev (localhost:5173 <-> localhost:5001).
    // localhost ports are treated as same-site so SameSite=lax works fine in dev.
    res.cookie('visitor_id', visitorId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
    });
  }

  // Attach to request object for use in controllers
  req.visitorId = visitorId;
  next();
};

module.exports = visitorMiddleware;
