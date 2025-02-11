// Autor: Daniel Rodríguez

// Inicializar carrito
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartCount = cart.length;

// Elementos del DOM
const cartCountElement = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const notificationsContainer = document.getElementById('notifications-container');

// Actualizar contador del carrito en la interfaz
if (cartCountElement) {
    cartCountElement.textContent = cartCount;
}

// Función para actualizar el almacenamiento del carrito
function updateCartStorage() {
    localStorage.setItem("cart", JSON.stringify(cart));
    cartCount = cart.length;
    if (cartCountElement) cartCountElement.textContent = cartCount;
    renderCart();
}

// Mostrar notificación de producto añadido
function showNotification(productName, productImage) {
    const notification = document.createElement('div');
    notification.classList.add('cart-notification');
    notification.innerHTML = `
        <img src="${productImage}" alt="Producto añadido" class="notification-image">
        <div class="notification-details">
            <h3 class="notification-title">Producto añadido</h3>
            <p class="notification-description">Has añadido <strong>${productName}</strong> al carrito.</p>
        </div>
        <button class="close-notification">&times;</button>
    `;

    notification.querySelector('.close-notification').addEventListener('click', () => {
        notification.remove();
    });

    notificationsContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
}

// Agregar producto al carrito
function addToCart(productName, productPrice, productImage) {
    cart.push({ name: productName, price: productPrice, image: productImage });
    updateCartStorage();
    showNotification(productName, productImage);
}

// Renderizar carrito
function renderCart() {
    if (!cartItemsContainer || !totalPriceElement) return;

    cartItemsContainer.innerHTML = cart.length === 0 
        ? "<p>Tu carrito está vacío.</p>" 
        : "";

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="price">€${item.price.toFixed(2)}</p>
            <button class="remove-btn" data-index="${index}">&times;</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    totalPriceElement.textContent = `€${total.toFixed(2)}`;
}

// Eliminar producto del carrito
cartItemsContainer?.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
        cart.splice(e.target.dataset.index, 1);
        updateCartStorage();
    }
});

// Vaciar carrito
document.getElementById("clear-cart")?.addEventListener("click", () => {
    cart = [];
    updateCartStorage();
});

// Realizar compra
document.getElementById("checkout-btn")?.addEventListener("click", () => {
    if (cart.length > 0) {
        alert(`El total de tu compra es: €${totalPriceElement.textContent.replace('€', '')}`);
        cart = [];
        updateCartStorage();
    } else {
        alert("Tu carrito está vacío.");
    }
});

// Cargar juegos desde el servidor
fetch('/games.json')
  .then(response => response.json())
  .then(data => {
    const games = data.games;
    const tendenciasContainer = document.querySelector('.tendencias');
    if (!tendenciasContainer) return;

    games.forEach(game => {
        const gameHTML = `
            <div class="juego">
                <a href="producto.html?id=${game.id}">
                    <div class="media-container">
                        <img src="${game.images.main}" alt="${game.title}" class="media-img">
                        <video class="media-video" preload="auto" muted loop playsinline>
                            <source src="${game.video.mp4}" type="video/mp4">
                            <source src="${game.video.webm}" type="video/webm">
                            Tu navegador no soporta videos.
                        </video>
                    </div>
                </a>
                <h3>${game.title}</h3>
                <p class="price">
                    <span class="discount">${game.pricing.discount_percentage}</span>
                    ${game.pricing.discount_price}
                </p>
                <button class="btn">Agregar al Carrito</button>
            </div>
        `;

        tendenciasContainer.insertAdjacentHTML('beforeend', gameHTML);
    });

    // Reproducir video al pasar el mouse
    document.querySelectorAll(".media-container").forEach(container => {
        const video = container.querySelector(".media-video");
        if (!video) return;
        container.addEventListener("mouseenter", () => {
            video.play();
            video.style.opacity = "1";
        });
        container.addEventListener("mouseleave", () => {
            video.pause();
            video.currentTime = 0;
            video.style.opacity = "0";
        });
    });
  })
  .catch(error => console.error('Error al cargar los juegos:', error));
  function loadMasVendidos() {
    fetch('/data/masVendido.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al cargar el archivo JSON');
        }
        return response.json();
      })
      .then(data => {
        const productGrid = document.querySelector('.product-grid');
        if (!productGrid) return;
  
        // Limpiar el contenedor
        productGrid.innerHTML = '';
        const masVendido = data.loMasVendido;
        // Aquí se usaba data.masVendidos.forEach(...) pero tu JSON es un arreglo
        masVendido.forEach(producto => {
          const productHTML = `
            <div class="product">
              <a href="producto.html?id=${producto.id}">
                <img src="${producto.images.main}" alt="${producto.title}">
              </a>
              <h3>
                <a href="producto.html?id=${producto.id}">${producto.title}</a>
              </h3>
              <p class="price">
                <span class="discount">${producto.pricing.discount_percentage}</span>
                ${producto.pricing.discount_price}
              </p>
              <button class="btn">Agregar al Carrito</button>
            </div>
          `;
          productGrid.insertAdjacentHTML('beforeend', productHTML);
          console.log(`Producto ${producto.id} insertado`);
        });
        
      })
      .catch(error => console.error('Error cargando los productos más vendidos:', error));
  }
  
  document.addEventListener("DOMContentLoaded", loadMasVendidos);
// Delegación de eventos para agregar productos al carrito
document.body.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn')) {
      e.preventDefault();
      const productCard = e.target.closest('.juego, .product');
      if (!productCard) return;
      const productName = productCard.querySelector('h3')?.textContent || "Producto";
      const productPrice = parseFloat(productCard.querySelector('.price')?.textContent.replace(/[^\d.]/g, '') || "0");
      const productImage = productCard.querySelector('img')?.src || "";
      addToCart(productName, productPrice, productImage);
  }
});
document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const openModal = document.getElementById('open-modal');
  const closeModal = document.getElementById('close-modal');
  const modal = document.getElementById('myModal');
  const formsWrapper = document.getElementById('formsWrapper');
  const toRegister = document.getElementById('toRegister');
  const toLogin = document.getElementById('toLogin');

  // Abrir el modal
  openModal.addEventListener('click', function(e) {
    e.preventDefault();
    modal.classList.add('active');
  });

  // Cerrar el modal
  closeModal.addEventListener('click', function() {
    modal.classList.remove('active');
  });

  // Cerrar el modal al hacer clic fuera del contenido
  modal.addEventListener('click', function(e) {
    if(e.target === modal) {
      modal.classList.remove('active');
    }
  });

  // Mostrar el formulario de registro
  toRegister.addEventListener('click', function(e) {
    e.preventDefault();
    formsWrapper.classList.add('show-register');
  });

  // Volver al formulario de login
  toLogin.addEventListener('click', function(e) {
    e.preventDefault();
    formsWrapper.classList.remove('show-register');
  });

});
