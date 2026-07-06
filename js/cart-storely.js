storelyInit().then(async () => {
  if (!storelyIsLoggedIn()) {
    localStorage.setItem("storelyRedirectAfterLogin", "cart.html");
    window.location.href = "login.html";
    return;
  }

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
      container.innerHTML = `
        <div class="empty-page">
          <h2>السلة فارغة</h2>
          <p>تصفح متاجر ALSHAYEB SHOP وأضف ما يعجبك.</p>
          <a class="primary-btn" href="index.html">تصفح المنتجات</a>
        </div>`;
      totalEl.textContent = storelyMoney(0);
      checkoutBtn.className = "secondary-btn full";
      checkoutBtn.href = "index.html";
      checkoutBtn.textContent = "تصفح المنتجات";
      return;
    }

    container.innerHTML = items.map((item) => `
      <div class="product-row">
        <div>
          <div class="row-product-image" style="${storelyMediaStyle(item.product.image)}"></div>
          <strong>${item.product.title}</strong>
          <span>${item.store.storeName} - ${item.product.category}</span>
        </div>
        <b>${storelyMoney(item.product.price)}</b>
        <span>الكمية: ${item.qty}</span>
        <button class="danger-btn" onclick="removeCartItem('${item.storeId}','${item.productId}')">إزالة</button>
      </div>
    `).join("");

    totalEl.textContent = storelyMoney(items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0));
  }

  window.removeCartItem = async (storeId, productId) => {
    const cart = (await storelyGetCartAsync()).filter((i) => !(i.storeId === storeId && i.productId === productId));
    await storelySaveCartAsync(cart);
    storelyUpdateCartBadge();
    renderCart();
  };

  renderCart();
});
