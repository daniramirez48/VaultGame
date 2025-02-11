document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());

  console.log(data); // Aquí vemos qué datos estamos enviando

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
        document.getElementById('loginForm')?.scrollIntoView({ behavior: 'smooth' }); // Scroll hasta el formulario de login
      };
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
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    if (result.success) {
      alert('Login exitoso!');
      
      const openModalBtn = document.getElementById('open-modal');
      if (openModalBtn && result.name) {
        openModalBtn.textContent = `Bienvenido, ${result.name}`;
      }
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.style.display('block');
      }
      const modal = document.getElementById('myModal');
      if (modal)modal.classList.remove('active');
      // window.location.href = '/';
    } else {
      alert(result.error || 'Credenciales inválidas');
    }
    
  } catch (error) {
    alert('Error de conexión');
  }
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    const response = await fetch('/logout');
    const result = await response.json();
    if (result.success) {
      alert(result.message);
      
      // Restaura el botón de "Iniciar Sesión" a su estado original
      const openModalBtn = document.getElementById('open-modal');
      if (openModalBtn) {
        openModalBtn.textContent = 'Iniciar Sesión';
      }
      
      // Oculta el botón de logout
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.style.display = 'none';
      }
      
      // Opcional: Puedes recargar la página o actualizar la interfaz según necesites.
    }
  } catch (error) {
    alert('Error al cerrar la sesión');
    console.error('Error en el logout:', error);
  }
});
