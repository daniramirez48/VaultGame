// ====================
// GESTIÓN DEL CARRITO
// ====================

// Inicializar carrito
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartCount = cart.length;

// Elementos del DOM del carrito
const cartCountElement = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const notificationsContainer = document.getElementById("notifications-container");
const emptyCartMessage = document.getElementById("empty-cart-message");

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
  const notification = document.createElement("div");
  notification.classList.add("cart-notification");
  notification.innerHTML = `
    <img src="${productImage}" alt="Producto añadido" class="notification-image">
    <div class="notification-details">
      <h3 class="notification-title">Producto añadido</h3>
      <p class="notification-description">Has añadido <strong>${productName}</strong> al carrito.</p>
    </div>
    <button class="close-notification">&times;</button>
  `;
  notification.querySelector(".close-notification").addEventListener("click", () => {
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
  if (!cartItemsContainer || !totalPriceElement || !emptyCartMessage) return;
  emptyCartMessage.style.display = cart.length === 0 ? "block" : "none";
  cartItemsContainer.innerHTML = "";
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="item-info">
        <h3>${item.name}</h3>
      </div>
      <p class="price">€${item.price.toFixed(2)}</p>
      <button class="remove-btn" data-index="${index}">&times;</button>
    `;
    cartItemsContainer.appendChild(cartItem);
  });
  totalPriceElement.textContent = `€${total.toFixed(2)}`;
}

// Delegar eliminación de productos
cartItemsContainer?.addEventListener("click", (e) => {
  if (e.target.classList.contains("remove-btn")) {
    cart.splice(e.target.dataset.index, 1);
    updateCartStorage();
    renderCart();
  }
});

// Vaciar carrito
document.getElementById("clear-cart")?.addEventListener("click", () => {
  cart = [];
  updateCartStorage();
  renderCart();
});

// Realizar compra
document.getElementById("checkout-btn")?.addEventListener("click", () => {
  if (cart.length > 0) {
    alert(`El total de tu compra es: €${totalPriceElement.textContent.replace("€", "")}`);
    cart = [];
    updateCartStorage();
  } else {
    alert("Tu carrito está vacío.");
  }
});

// Renderizar carrito al cargar la página
renderCart();


// ====================
// CARGA Y RENDERIZACIÓN DE JUEGOS
// ====================

// Variable global para almacenar los juegos
let games = [];

// --------------------
// INDEX: Renderizar en contenedor "tendencias" y "product-grid"
// --------------------
function renderTendenciasIndex(gamesList) {
  const container = document.getElementById("tendencias");
  if (!container) return;
  container.innerHTML = "";
  gamesList.forEach((game) => {
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
          <span class="discount_price">${game.pricing.discount_price}</span>
        </p>
        <button class="btn">Agregar al Carrito</button>
      </div>
    `;
    container.insertAdjacentHTML("beforeend", gameHTML);
  });
  document.querySelectorAll(".media-container").forEach((container) => {
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
}

function renderMasVendidos(masVendido) {
  const productGrid = document.querySelector(".product-grid");
  if (!productGrid) return;
  masVendido.forEach((producto) => {
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
          <span class="discount_price">${producto.pricing.discount_price}</span>
        </p>
        <button class="btn">Agregar al Carrito</button>
      </div>
    `;
    productGrid.insertAdjacentHTML("beforeend", productHTML);
  });
}

// --------------------
// INDEX: Cargar juegos (se ejecuta si NO estamos en categoria.html)
// --------------------
if (window.location.pathname.indexOf("categoria.html") === -1) {
  fetch("/games.json")
    .then((response) => response.json())
    .then((data) => {
      games = data.games;
      renderTendenciasIndex(games);
    })
    .catch((error) => console.error("Error al cargar los juegos:", error));

  document.addEventListener("DOMContentLoaded", loadMasVendidos);
}

// Función para cargar "Más Vendido del Mes"
function loadMasVendidos() {
  fetch("/data/masVendido.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error al cargar el archivo JSON");
      }
      return response.json();
    })
    .then((data) => {
      const masVendido = data.loMasVendido;
      games = games.concat(masVendido);
      if (window.location.pathname.indexOf("categoria.html") === -1) {
        renderMasVendidos(masVendido);
      }
    })
    .catch((error) => console.error("Error cargando los productos más vendidos:", error));
}


// ====================
// REDIRECCIÓN DESDE EL HEADER AL CATEGORIA
// ====================
const headerSearchInput = document.getElementById("search-input");
const headerSearchButton = document.getElementById("search-button");

function redirectToCategory() {
  const query = headerSearchInput.value.trim();
  if (!query) return;
  const url = `categoria.html?query=${encodeURIComponent(query)}`;
  window.location.href = url;
}

if (headerSearchInput) {
  headerSearchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      redirectToCategory();
    }
  });
}
if (headerSearchButton) {
  headerSearchButton.addEventListener("click", redirectToCategory);
}


// ====================
// CATEGORÍA: FILTROS Y BÚSQUEDA
// ====================
// Se ejecuta solo en categoria.html
if (window.location.pathname.indexOf("categoria.html") !== -1) {
  document.addEventListener("DOMContentLoaded", function () {
    // Asegúrate de que en tu HTML los select tengan los IDs: "Consolas", "Genero" y "ordenar"
    const selectConsolas = document.getElementById("consolas");
    const selectGenero = document.getElementById("genero");
    const selectOrdenar = document.getElementById("ordenar");
    const searchCategoriaBtn = document.querySelector(".search-Categoria");
    const resetFiltersBtn = document.querySelector(".reset-filters");
    const tendenciasCategoriaContainer = document.getElementById("tendencias-categoria");

    function renderTendenciasCategoria(gamesList) {
      const container = tendenciasCategoriaContainer;
      if (!container) return;
      // Crear o actualizar el encabezado con la cantidad de juegos encontrados
      let headerElement = document.getElementById("result-header");
      if (!headerElement) {
          headerElement = document.createElement("div");
          headerElement.id = "result-header";
          container.parentNode.insertBefore(headerElement, container);
      }
      headerElement.innerHTML = `<h2>Resultado: ${gamesList.length} </h2>`;
  
      container.innerHTML = "";
      gamesList.forEach((game) => {
          // Verificación para asegurarse de que 'game' y 'game.video' existen
          const gameVideoMp4 = game.video && game.video.mp4 ? game.video.mp4 : "";
          const gameVideoWebm = game.video && game.video.webm ? game.video.webm : "";
          const gameHTML = `
            <div class="juego">
              <a href="producto.html?id=${game.id}">
                <div class="media-container">
                  <img src="${game.images.main}" alt="${game.title}" class="media-img">
                  <video class="media-video" preload="auto" muted loop playsinline>
                    ${gameVideoMp4 ? `<source src="${gameVideoMp4}" type="video/mp4">` : ""}
                    ${gameVideoWebm ? `<source src="${gameVideoWebm}" type="video/webm">` : ""}
                    Tu navegador no soporta videos.
                  </video>
                </div>
              </a>
              <h3>${game.title}</h3>
              <p class="price">
                <span class="discount">${game.pricing.discount_percentage}</span>
                <span class="discount_price">${game.pricing.discount_price}</span>
              </p>
              <button class="btn">Agregar al Carrito</button>
            </div>
          `;
          container.insertAdjacentHTML("beforeend", gameHTML);
      });
  
      document.querySelectorAll(".media-container").forEach((container) => {
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
  }
  
  
    // Función para filtrar juegos en categoría a partir de "query" y selectores
    function searchGamesCategoria(query, gamesList) {
      query = query.trim().toLowerCase();
      if (!query) return gamesList;
      return gamesList.filter((game) => {
        const matchesName = game.title.toLowerCase().includes(query);
        const matchesGenre = game.genre && game.genre.toLowerCase().includes(query);
        const matchesPlatform = game.platforms && game.platforms.join(" ").toLowerCase().includes(query);
        const matchesMode = game.mode && game.mode.toLowerCase().includes(query);
        return matchesName || matchesGenre || matchesPlatform || matchesMode;
      });
    }
  
    function handleFilters() {
      let filteredGames = games; // 'games' es la variable global con todos los juegos
  
      // Aplicar filtro de búsqueda desde la URL (parámetro "query")
      const urlParams = new URLSearchParams(window.location.search);
      const queryParam = urlParams.get("query");
      if (queryParam) {
        filteredGames = searchGamesCategoria(queryParam, filteredGames);
      }
  
      // Filtrar por Consola
      const consolaValue = selectConsolas ? selectConsolas.value : "";
      if (consolaValue) {
        filteredGames = filteredGames.filter(game => game.platforms && game.platforms.includes(consolaValue));
      }
  
      // // Filtrar por Género
      // filteredGames = filteredGames.filter(game => {
      //   const genre = Array.isArray(game.genre) ? game.genre.join(", ").toLowerCase() : (game.genre || "").toLowerCase();
      //   return genre.includes(generoValue);
      // });
            // Filtrar por Género
      const generoValue = selectGenero ? selectGenero.value.trim().toLowerCase() : "";
      if (generoValue) {
        filteredGames = filteredGames.filter(game => {
          const genre = Array.isArray(game.genre) ? game.genre.join(", ").toLowerCase() : (game.genre || "").toLowerCase();
          return genre.includes(generoValue);
        });
      }

  
      // Ordenar según la opción seleccionada
      const ordenarValue = selectOrdenar ? selectOrdenar.value : "";
      if (ordenarValue) {
        if (ordenarValue === "DescuentoMayor") {
          filteredGames.sort((a, b) => {
            const discountA = parseFloat(a.pricing.discount_percentage.replace("%", "").replace("-", ""));
            const discountB = parseFloat(b.pricing.discount_percentage.replace("%", "").replace("-", ""));
            return discountB - discountA;
          });
        } else if (ordenarValue === "DescuentoMenor") {
          filteredGames.sort((a, b) => {
            const discountA = parseFloat(a.pricing.discount_percentage.replace("%", "").replace("-", ""));
            const discountB = parseFloat(b.pricing.discount_percentage.replace("%", "").replace("-", ""));
            return discountA - discountB;
          });
        } else if (ordenarValue === "Precio") {
          filteredGames.sort((a, b) => {
            const priceA = parseFloat(a.pricing.discount_price.replace("€", ""));
            const priceB = parseFloat(b.pricing.discount_price.replace("€", ""));
            return priceB - priceA;
          });
        }
      }
  
      renderTendenciasCategoria(filteredGames);
    }
  
    // Eventos para el botón "Buscar" en categoría
    if (document.getElementById("search-button")) {
      // Si se usa el mismo input del header, asegúrate de tenerlo en la página
      document.getElementById("search-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          document.getElementById("search-button").click();
        }
      });
      document.getElementById("search-button").addEventListener("click", () => {
        const query = document.getElementById("search-input").value.trim();
        if (query) {
          window.location.href = `categoria.html?query=${encodeURIComponent(query)}`;
        }
      });
    }
  
    if (searchCategoriaBtn) {
      searchCategoriaBtn.addEventListener("click", handleFilters);
    }
  
    if (resetFiltersBtn) {
      resetFiltersBtn.addEventListener("click", () => {
        if (selectConsolas) selectConsolas.selectedIndex = 0;
        if (selectGenero) selectGenero.selectedIndex = 0;
        if (selectOrdenar) selectOrdenar.selectedIndex = 0;
        renderTendenciasCategoria(games);
      });
    }
  
    // Al cargar la página de categoría, forzamos la carga de juegos si no lo están aún
    if (games.length === 0) {
      fetch("/games.json")
        .then((response) => response.json())
        .then((data) => {
          games = data.games;
          // Cargar también "Más Vendido"
          fetch("/data/masVendido.json")
            .then((response) => response.json())
            .then((dataMas) => {
              const masVendido = dataMas.loMasVendido;
              games = games.concat(masVendido);
              handleFilters();
            })
            .catch((error) => {
              console.error("Error cargando masVendido:", error);
              handleFilters();
            });
        })
        .catch((error) => console.error("Error al cargar los juegos:", error));
    } else {
      handleFilters();
    }
  });
}

// ====================
// Delegación de eventos para agregar productos al carrito
// ====================
document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn")) {
    e.preventDefault();
    const productCard = e.target.closest(".juego, .product");
    if (!productCard) return;
    const productName = productCard.querySelector("h3")?.textContent || "Producto";
    const productPrice = parseFloat(
      productCard.querySelector(".discount_price")?.textContent.replace(/[^\d.]/g, "") || "0"
    );
    const productImage = productCard.querySelector("img")?.src || "";
    addToCart(productName, productPrice, productImage);
  }
});


// ============
function renderTendencias(gamesList) {
  // Selecciona el contenedor principal de resultados (ya definido en tu HTML)
  const resultContainer = document.querySelector(".result-container");
  const tendenciasContainer = document.getElementById("tendencias");
  if (!resultContainer || !tendenciasContainer) return;
  
  // Verifica si ya existe un contenedor para el encabezado, de lo contrario créalo
  let headerElement = document.getElementById("result-header");
  if (!headerElement) {
    headerElement = document.createElement("div");
    headerElement.id = "result-header";
    // Opcional: puedes aplicar estilos adicionales a este contenedor en tu CSS
    resultContainer.insertBefore(headerElement, tendenciasContainer);
  }
  // Establece el contenido del encabezado con la cantidad total de juegos encontrados
  headerElement.innerHTML = `<h2>${gamesList.length} juegos encontrados</h2>`;
  
  // Limpia el contenedor de juegos
  tendenciasContainer.innerHTML = "";
  gamesList.forEach((game) => {
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
          <span class="discount_price">${game.pricing.discount_price}</span>
        </p>
        <button class="btn">Agregar al Carrito</button>
      </div>
    `;
    tendenciasContainer.insertAdjacentHTML("beforeend", gameHTML);
  });
  
  // Configurar reproducción de video al pasar el mouse
  document.querySelectorAll(".media-container").forEach((container) => {
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
}


// Código para el modal de login/registro
document.addEventListener("DOMContentLoaded", function () {
  const openModal = document.getElementById("open-modal");
  const closeModal = document.getElementById("close-modal");
  const modal = document.getElementById("myModal");
  const formsWrapper = document.getElementById("formsWrapper");
  const toRegister = document.getElementById("toRegister");
  const toLogin = document.getElementById("toLogin");

  if (openModal) {
    openModal.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.add("active");
    });
  }

  if (closeModal) {
    closeModal.addEventListener("click", function () {
      modal.classList.remove("active");
    });
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  }

  if (toRegister) {
    toRegister.addEventListener("click", function (e) {
      e.preventDefault();
      formsWrapper.classList.add("show-register");
    });
  }

  if (toLogin) {
    toLogin.addEventListener("click", function (e) {
      e.preventDefault();
      formsWrapper.classList.remove("show-register");
    });
  }
});
