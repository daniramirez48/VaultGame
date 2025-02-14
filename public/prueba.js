// Inicializar carrito
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cartCount = cart.length;

// Elementos del DOM
const cartCountElement = document.getElementById("cart-count");
const cartItemsContainer = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const notificationsContainer = document.getElementById('notifications-container');
const emptyCartMessage = document.getElementById('empty-cart-message');

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
    if (!cartItemsContainer || !totalPriceElement || !emptyCartMessage) return;

    // Mostrar/ocultar mensaje de carrito vacío
    emptyCartMessage.style.display = cart.length === 0 ? 'block' : 'none';
    
    // Limpiar contenedor
    cartItemsContainer.innerHTML = '';

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

// Eliminar producto del carrito
cartItemsContainer?.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
        cart.splice(e.target.dataset.index, 1);
        updateCartStorage();
        
        // Mostrar mensaje si el carrito quedó vacío
        if (cart.length === 0) {
            emptyCartMessage.style.display = 'block';
        }
    }
});

// Vaciar carrito
document.getElementById("clear-cart")?.addEventListener("click", () => {
    cart = [];
    updateCartStorage();
    emptyCartMessage.style.display = 'block'; // Mostrar mensaje vacío
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

// Renderizar carrito al cargar la página
renderCart();