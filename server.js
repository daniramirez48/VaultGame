const https = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database'); // Archivo de conexión a la base de datos

const app = express();
const port = process.env.PORT || 3002; // Asegurar que usa el puerto de Render
const saltRounds = 10; // 🔹 Agregado para bcrypt

const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

// Opciones para HTTPS
// const options = {
//   key: fs.readFileSync('key.pem'),
//   cert: fs.readFileSync('cert.pem'),
// };
app.use(express.json());
// Configurar middleware
app.use(cors());
app.use(express.json());
//Configurar sesiones
app.use(session({
  store: new SQLiteStore({ db: 'sessions.db' }), // Almacenar sesiones en SQLite
  secret:'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure : false, // true en producción
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

//Añado este endpoint para poder indicar el nombre del usuario
app.get('/api/perfil', (req, res) => {
  if (req.session.user) {
  res.json(req.session.user);
  } else {
  res.json({});
  }
  });
  
// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas para archivos JSON
app.get('/games.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'games.json'));
});
app.get('/data/masVendido.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'masVendido.json'));
});
app.get('/data/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', req.params[0]));
});
// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// 🚀 Ruta para registrar usuarios
app.post('/users2', async (req, res) => {
  try {
    const {name, username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
      
    }
    
    // Verificar si el usuario ya existe
    db.get('SELECT * FROM users2 WHERE username = ? OR email = ?', [username, email], async (err, row) => {
      if (err) {
        console.log('Datos recibidos:', {name, username, email, password });

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
        // db.close(); // Cierra la conexión después de la consulta        
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
    if (!username || !password) {  // Verifica que ambos campos estén presentes
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el usuario existe en la base de datos (por username o email)
    db.get('SELECT * FROM users2 WHERE username = ? OR email = ?', [username], async (err, row) => {
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

      // **Asignar el usuario a la sesión**
      req.session.user = {
        name: row.name,         // Se asume que la columna se llama "name"
        username: row.username,
        email: row.email        // Puedes agregar otros datos si lo deseas
      };
   
      // Aquí se incorpora el nombre del usuario en la respuesta
      res.status(200).json({ 
        success: true, 
        message: 'Inicio de sesión exitoso', 
        name: row.name  // Se asume que la columna en la tabla es "name"
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
    // Limpia la cookie asociada a la sesión, por defecto suele ser "connect.sid"
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  });
});

// Iniciar servidor HTTPS
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${port}`);
});

 


