// Al cargar la página, consultamos el perfil para saber si hay sesión activa
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/perfil', {
      method: 'GET',
      credentials: 'include' // Importante para enviar cookies
    });
    const perfil = await response.json();
    if (perfil && perfil.name) {
      // Si hay datos en la sesión, actualizamos la UI para el usuario logueado
      document.getElementById('open-modal').style.display = 'none';
      document.getElementById('user-menu').style.display = 'block';
      document.getElementById('user-name').textContent = perfil.name;
    } else {
      // Si no hay sesión, mostramos el botón de iniciar sesión
      document.getElementById('open-modal').style.display = 'inline-block';
      document.getElementById('user-menu').style.display = 'none';
    }
  } catch (error) {
    console.error('Error al obtener el perfil:', error);
  }
});

// Manejar el registro
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  console.log(data); // Para ver qué datos se envían

  try {
    const response = await fetch('/users2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message || 'Registro exitoso!');
      const formsWrapper = document.getElementById('formsWrapper');
      if (formsWrapper) {
        formsWrapper.classList.remove('show-register');
        document.getElementById('loginForm')?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      alert(result.error || 'Error en el registro');
    }

  } catch (error) {
    alert('Error de conexión con el servidor');
    console.error('Error en la petición:', error);
  }
});

// Manejar login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Enviar cookies para la sesión
      body: JSON.stringify(data)
    });

    const result = await response.json();
    console.log('Resultado del login:', result);

    if (result.success) {
      alert('Login exitoso!');

      // Actualizar la UI: ocultar "Iniciar Sesión" y mostrar el menú del usuario
      document.getElementById('open-modal').style.display = 'none';
      document.getElementById('user-menu').style.display = 'block';
      document.getElementById('user-name').textContent = result.name || 'Usuario';

    } else {
      alert(result.error || 'Credenciales inválidas');
    }

  } catch (error) {
    console.error('Error en el login:', error);
    alert('Error de conexión');
  }
});

// Mostrar/Ocultar menú desplegable al hacer clic en el botón del usuario
document.getElementById('user-button')?.addEventListener('click', () => {
  document.getElementById('user-dropdown').classList.toggle('show');
  document.querySelector('.arrow')?.classList.toggle('rotate');
});

// Cerrar el menú si se hace clic fuera
document.addEventListener('click', (event) => {
  const userButton = document.getElementById('user-button');
  const dropdown = document.getElementById('user-dropdown');

  if (!userButton.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.classList.remove('show');
    document.querySelector('.arrow')?.classList.remove('rotate');
  }
});

// Manejar Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    const response = await fetch('/logout', {
      credentials: 'include' // Asegúrate de enviar las cookies en la petición de logout
    });
    const result = await response.json();

    if (result.success) {
      alert(result.message);

      // Restaurar la UI: ocultar el menú de usuario y mostrar "Iniciar Sesión"
      document.getElementById('user-menu').style.display = 'none';
      document.getElementById('open-modal').style.display = 'inline-block';

      // Opcional: Si deseas recargar la página para limpiar el estado, puedes hacerlo:
      // window.location.reload();
    }
  } catch (error) {
    alert('Error al cerrar la sesión');
    console.error('Error en el logout:', error);
  }
});
