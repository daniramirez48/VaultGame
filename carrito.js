// Obtener elementos
const cartItemsContainer = document.getElementById("cart-items");
const totalPriceElement = document.getElementById("total-price");
const clearCartButton = document.getElementById("clear-cart");

// Cargar carrito desde localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Renderizar el carrito
function renderCart() {
    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Tu carrito está vacío.</p>";
        totalPriceElement.textContent = "€0.00";
        return;
    }

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

// Eliminar un producto del carrito
cartItemsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
        const index = e.target.dataset.index;
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
});

// Vaciar el carrito
clearCartButton.addEventListener("click", () => {
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
});

// Inicializar el carrito
renderCart();
