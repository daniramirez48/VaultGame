// authMiddleware.js
const isAuthenticated = (req, res, next) => {
    if (req.sessions.user) {
      // El usuario está autenticado, continua con la siguiente función en la cadena de middleware
      next();
    } else {
      // El usuario no está autenticado, retorna un error 401
      res.status(401).json({ error: 'No autorizado' });
    }
  };
  
  module.exports = isAuthenticated;
  