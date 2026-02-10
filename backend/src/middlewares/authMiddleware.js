const authService = require('../services/authService');

function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('Missing or invalid authorization header');
      err.status = 401;
      throw err;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const decoded = authService.verifyToken(token);

    req.userId = decoded.id;
    req.userEmail = decoded.email;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
