storelyInit().then(async () => {
  const cartStores = storelyGetStores();

  async function getCartDetailed() {
    const cart = await storelyGetCartAsync();
    return cart.map((item) => {
      const store = cartStores.find((s) => s.id === item.storeId);
      const product = store?.products.find((p) => p.id === item.productId);
      return product ? { ...item, product, store } : null;
    }).filter(Boolean);
  }

  async function renderCart() {
    const items = await getCartDetailed();
    const container = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!items.length) {
      container.innerHTML = storelyEmptyState("السلة فارغة", "تصفّح المنتجات وأضف ما يعجبك.", "تصفح المنتجات", "index.html#products");
      totalEl.textContent = storelyMoney(0);
      checkoutBtn.className = "secondary-btn full";
      checkoutBtn.href = "index.html#products";
      checkoutBtn.textContent = "تصفح المنتجات";
      checkoutBtn.onclick = null;
      return;
    }

    container.innerHTML = items.map((item) => `
      <div class="product-row">
        <div>
          <div class="row-product-image" style="${storelyMediaStyle(item.product.image, "assets/images/product-electronics.svg")}"></div>
          <strong>${item.product.title}</strong>
          <span>${item.store.storeName} · ${item.product.category}</span>
        </div>
        <b>${storelyMoney(item.product.price)}</b>
        <span>× ${item.qty}</span>
        <button class="danger-btn" onclick="removeCartItem('${item.storeId}','${item.productId}')">إزالة</button>
      </div>
    `).join("");

    totalEl.textContent = storelyMoney(items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0));
    checkoutBtn.className = "primary-btn full";
    checkoutBtn.textContent = storelyIsLoggedIn() ? "ادفع الآن" : "سجّل دخولك للدفع";
    checkoutBtn.href = "#";
    checkoutBtn.onclick = (event) => {
      event.preventDefault();
      if (!storelyIsLoggedIn()) {
        localStorage.setItem("storelyRedirectAfterLogin", "checkout.html?plan=cart");
        window.location.href = "login.html";
        return;
      }
      window.location.href = "checkout.html?plan=cart";
    };
  }

  window.removeCartItem = async (storeId, productId) => {
    const cart = (await storelyGetCartAsync()).filter((i) => !(i.storeId === storeId && i.productId === productId));
    await storelySaveCartAsync(cart);
    storelyUpdateCartBadge();
    renderCart();
  };

  renderCart();
  storelyUpdateCartBadge();
});
