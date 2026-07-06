storelyInit().then(() => {
  const app = document.getElementById("storeApp");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const stores = storelyActiveStores();
  const store = slug ? stores.find((item) => item.slug === slug) : null;

  if (!store) {
    app.innerHTML = `
      <nav class="navbar compact">
        <a class="brand" href="index.html">
          <img src="assets/images/shop-logo.svg" alt="Shayeb Shop" class="brand-logo">
          <div class="brand-text"><span class="brand-title">Shayeb Shop</span></div>
        </a>
        <a class="primary-btn" href="index.html">الرئيسية</a>
      </nav>
      <main class="empty-page"><div class="empty-state"><h1>المتجر غير موجود</h1><a class="primary-btn" href="index.html">العودة</a></div></main>
    `;
  } else {
    renderStore(app, store);
    const hash = location.hash.replace("#", "");
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
  }

  storelyUpdateCartBadge();
});

function renderStore(app, store) {
  document.title = `${store.storeName} | Shayeb Shop`;
  const products = store.products || [];

  app.innerHTML = `
    <nav class="navbar compact">
      <a class="brand" href="index.html">
        <img src="assets/images/shop-logo.svg" alt="Shayeb Shop" class="brand-logo">
        <div class="brand-text"><span class="brand-title">Shayeb Shop</span></div>
      </a>
      <div class="navbar-actions">
        <a class="cart-link" href="cart.html">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          <span class="cart-badge" id="cartCount">0</span>
        </a>
        <a class="secondary-btn" href="login.html">دخول</a>
      </div>
    </nav>

    <main class="public-store">
      <section class="store-hero">
        <div class="store-cover" style="${storelyMediaStyle(store.banner, "assets/images/store-banner.svg")}"></div>
        <div class="store-profile">
          <div class="store-avatar large">${store.logo || store.storeName.charAt(0)}</div>
          <div><h1>${store.storeName}</h1><p>${store.tagline}</p></div>
        </div>
      </section>

      <section id="products" class="section-band">
        <h2>المنتجات</h2>
        <div class="product-grid" style="margin-top:20px;">
          ${products.map((product) => `
            <article class="product-card" id="${product.id}">
              <div class="product-image" style="${storelyMediaStyle(product.image, "assets/images/product-electronics.svg")}"></div>
              <span>${product.category}</span>
              <h3>${product.title}</h3>
              <div class="product-footer">
                <strong>${storelyMoney(product.price)}</strong>
                <button class="primary-btn" onclick="addToCart('${store.id}','${product.id}')">أضف للسلة</button>
              </div>
            </article>
          `).join("") || storelyEmptyState("لا منتجات", "", "", "")}
        </div>
      </section>
    </main>
  `;
}

async function addToCart(storeId, productId) {
  await storelyRequestAddToCartAsync(storeId, productId, location.href);
}
