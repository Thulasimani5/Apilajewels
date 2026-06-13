const crypto = require('crypto');

const visitorMiddleware = (req, res, next) => {
  let visitorId = req.cookies.visitor_id;

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    // Set cookie with 90 days expiry.
    // sameSite: 'none' and secure: true is required for cross-origin requests (frontend on 5173, backend on 5001)
    res.cookie('visitor_id', visitorId, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
    });
  }

  // Attach to request object for use in controllers
  req.visitorId = visitorId;
  next();
};

module.exports = visitorMiddleware;
