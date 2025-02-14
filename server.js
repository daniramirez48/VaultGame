// server.js

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const db = require('./database'); // Archivo de conexión a la base de datos
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const isAuthenticated = require('./authMiddleware');  // Asegúrate de que la ruta sea correcta

const app = express();
const port = process.env.PORT || 3002; // Usa el puerto asignado por el entorno o 3002
const saltRounds = 10; // Para bcrypt

// Middlewares
app.use(express.json());
app.use(cors({
  origin: true,       // Permite peticiones desde cualquier origen o especifica la URL de tu front-end
  credentials: true   // Permite el envío y recepción de cookies (sesiones)
}));

// Configurar sesiones (este middleware DEBE estar antes de definir las rutas)
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db' }), // Almacenar sesiones en SQLite
  secret: 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // En producción, si usas HTTPS, ponlo en true
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

// Endpoint para obtener el perfil del usuario (desde la sesión)
app.get('/api/perfil', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.json({});
  }
});

// Servir archivos estáticos (por ejemplo, tu frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para archivos JSON (si los usas)
app.get('/games.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'games.json'));
});
app.get('/data/masVendido.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'masVendido.json'));
});
app.get('/data/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', req.params[0]));
});

// Ruta principal (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta protegida (accesible solo si el usuario está autenticado)
app.get('/ruta-protegida', isAuthenticated, (req, res) => {
  res.json({ message: 'Esta es una ruta protegida y solo se puede acceder si estás autenticado.' });
});

// 🚀 Ruta para registrar usuarios
app.post('/users2', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }
    
    // Verificar si el usuario ya existe
    db.get('SELECT * FROM users2 WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        console.log('Datos recibidos:', { name, username, email, password });
        console.error('Error al buscar el usuario:', err);
        return res.status(500).json({ error: 'Error al buscar el usuario' });
      }

      if (row) {
        return res.status(400).json({ error: 'El usuario ya está registrado' });
      }

      try {
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar nuevo usuario
        db.run(
          'INSERT INTO users2 (name, username, email, password) VALUES (?, ?, ?, ?)',
          [name, username, email, hashedPassword],
          (err) => {
            if (err) {
              console.error('Error al crear el usuario:', err);
              return res.status(500).json({ error: 'Error al crear el usuario' });
            }
            console.log('Usuario creado:', username);
            res.status(201).json({ success: true, message: 'Usuario registrado exitosamente' });
          }
        );
      } catch (hashError) {
        console.error('Error al encriptar la contraseña:', hashError);
        return res.status(500).json({ error: 'Error al encriptar la contraseña' });
      }
    });

  } catch (error) {
    console.error('Error inesperado en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🚀 Ruta para loguearse (inicio de sesión)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validar que se proporcionaron los datos necesarios
    if (!username || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario existe en la base de datos (por username o email)
    // Usamos [username, username] para que se busque el mismo valor en ambas columnas
    db.get('SELECT * FROM users2 WHERE username = ? OR email = ?', [username, username], async (err, row) => {
      if (err) {
        console.error('Error al buscar el usuario:', err);
        return res.status(500).json({ error: 'Error al buscar el usuario' });
      }

      if (!row) {
        return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
      }

      // Comparar la contraseña proporcionada con la almacenada (encriptada)
      const isMatch = await bcrypt.compare(password, row.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Usuario o contraseña incorrectos' });
      }

      console.log('Usuario logueado:', row.username);

      // Asignar el usuario a la sesión
      req.session.user = {
        name: row.name,         // Se asume que la columna se llama "name"
        username: row.username,
        email: row.email
      };
   
      // Responder con éxito e incluir el nombre del usuario
      res.status(200).json({ 
        success: true, 
        message: 'Inicio de sesión exitoso', 
        name: row.name  
      });
    });

  } catch (error) {
    console.error('Error inesperado en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para cerrar la sesión (logout)
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar la sesión:', err);
      return res.status(500).json({ error: 'No se pudo cerrar la sesión' });
    }
    // Limpia la cookie asociada a la sesión (por defecto "connect.sid")
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  });
});

// Iniciar el servidor
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));
