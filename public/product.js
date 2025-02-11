// Carrito y Notificaciones
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartCount = cart.length;

const cartCountElement = document.getElementById("cart-count");
if (cartCountElement) {
    cartCountElement.textContent = cartCount;
}

// Función para mostrar notificaciones
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
    const container = document.getElementById('notifications-container');
    if (container) {
        container.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }
}

// Función para añadir al carrito
function addToCart(productName, productPrice, productImage) {
    cart.push({ name: productName, price: productPrice, image: productImage });
    localStorage.setItem("cart", JSON.stringify(cart));
    cartCount++;
    if (cartCountElement) cartCountElement.textContent = cartCount;
    showNotification(productName, productImage);
}

// Función para cambiar imagen
function changeImage(targetElementId, newImageSrc) {
    const mainImage = document.getElementById(targetElementId);
    if (!mainImage) return;

    const tempImage = new Image();
    tempImage.src = newImageSrc;

    tempImage.onload = () => {
        mainImage.classList.add('zoom-fade');
        setTimeout(() => {
            mainImage.src = newImageSrc;
            mainImage.alt = "Imagen ampliada del producto";
        }, 250);
        mainImage.addEventListener('animationend', () => {
            mainImage.classList.remove('zoom-fade');
        }, { once: true });
    };
}

// Cargar datos del juego
async function loadGameDetails() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = parseInt(urlParams.get("id"));

        // Cargar ambos JSONs
        const [gamesResponse, masVendidoResponse] = await Promise.all([
            fetch('games.json'),
            fetch('/data/masVendido.json')
        ]);

        const gamesData = await gamesResponse.json();
        const masVendidoData = await masVendidoResponse.json();

        // Combinar todos los juegos
        const allGames = [
            ...gamesData.games,
            ...masVendidoData.loMasVendido
        ];

        // Buscar el juego por ID
        const game = allGames.find(g => g.id === gameId);

        if (!game) {
            document.querySelector(".product-detail").innerHTML = "<h2>Juego no encontrado</h2>";
            return;
        }

        // Obtener referencias a los elementos de la UI
        const elements = {
            title: document.getElementById("product-title"),
            stars: document.getElementById("stars"),
            reviews: document.getElementById("reviews"),
            image: document.getElementById("product-image"),
            originalPrice: document.getElementById("original-price"),
            discountPrice: document.getElementById("discount-price"),
            discountPercentage: document.getElementById("discount-percentage"),
            platforms: document.getElementById("platforms"),
            description: document.getElementById("product-description"),
            features: document.getElementById("product-features"),
            gallery: document.getElementById("product-gallery"),
            editionsContainer: document.querySelector(".edicionesSlider")
        };

        // Llenar datos básicos
        if (elements.title) elements.title.textContent = game.title;
        if (elements.stars) elements.stars.textContent = game.rating.stars;
        if (elements.reviews) elements.reviews.textContent = `(${game.rating.reviews} reseñas)`;
        if (elements.image) {
            elements.image.src = game.images.main;
            elements.image.alt = game.title;
        }

        // Precios
        if (elements.originalPrice) elements.originalPrice.textContent = game.pricing.original_price;
        if (elements.discountPrice) elements.discountPrice.textContent = game.pricing.discount_price;
        if (elements.discountPercentage) elements.discountPercentage.textContent = game.pricing.discount_percentage;

        // Plataformas
        if (elements.platforms) {
            elements.platforms.innerHTML = "<span>Plataformas:</span> ";
            game.platforms.forEach(platform => {
                const icon = document.createElement("i");
                icon.className = platform === "Windows" ? "fab fa-windows" :
                               platform === "MacOS" ? "fab fa-apple" :
                               platform === "PS5" ? "fab fa-playstation" :
                               platform === "Xbox" ? "fab fa-xbox" : "";
                elements.platforms.appendChild(icon);
            });
        }

        // Descripción y características
        if (elements.description) elements.description.textContent = game.description;
        if (elements.features) {
            elements.features.innerHTML = "";
            game.features.forEach(feature => {
                const li = document.createElement("li");
                li.textContent = feature;
                elements.features.appendChild(li);
            });
        }

        // Galería de imágenes
        if (elements.gallery) {
            elements.gallery.innerHTML = "";
            game.images.gallery.forEach(imgSrc => {
                const img = document.createElement("img");
                img.src = imgSrc;
                img.alt = game.title;
                img.style.cursor = "pointer";
                img.onclick = () => changeImage('product-image', imgSrc);
                elements.gallery.appendChild(img);
            });
        }

        // **Sección de Ediciones** - Si hay ediciones disponibles, las mostramos
        if (elements.editionsContainer && game.editions) {
            elements.editionsContainer.innerHTML = ""; // Limpiar ediciones anteriores
            game.editions.forEach(edition => {
                const editionHTML = `
                    <div class="edicionCard">
                        <picture>
                            <img src="${edition.image}" alt="${edition.name}">
                        </picture>
                        <div class="edicionInfo">
                            <h3 class="edicionName">${edition.editionName}</h3>
                            <ul class="edicionDetails">
                                ${edition.editionDetails.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                            <div class="edicionPrice">
                                <span class="retailPrice">${edition.retailPrice}</span>
                                <span class="discountedPrice">${edition.discountedPrice}</span>
                                <span class="discountPercent">${edition.discountPercent}</span>
                            </div>
                            <div class="edicionAction">
                               <button class="btnEdicion">Agregar al Carrito</button>
                            </div>
                        </div>
                    </div>
                `;
                elements.editionsContainer.insertAdjacentHTML('beforeend', editionHTML);
            });
        }

        // Botón de carrito
        const addToCartButton = document.querySelector(".btn-cart");
        if (addToCartButton) {
            addToCartButton.addEventListener("click", () => {
                const productPrice = parseFloat(game.pricing.discount_price.replace('€', ''));
                addToCart(game.title, productPrice, game.images.main);
            });
        }

    } catch (error) {
        console.error("Error cargando los datos:", error);
        document.querySelector(".product-detail").innerHTML = "<h2>Error cargando los datos del juego</h2>";
    }
}

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', loadGameDetails);
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