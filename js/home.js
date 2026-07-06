let _activeCategory = "الكل";

storelyInit().then(() => {
  const storesContainer = document.getElementById("featuredStores");
  const productsContainer = document.getElementById("featuredProducts");
  const categoryFilter = document.getElementById("categoryFilter");
  const navAuthBtn = document.getElementById("navAuthBtn");
  const stores = storelyActiveStores();

  storelyUpdateCartBadge();

  if (storelyIsLoggedIn()) {
    const user = storelyCurrentUser();
    if (storelyIsFounder(user)) {
      navAuthBtn.textContent = "الإدارة";
      navAuthBtn.href = "admin.html";
    } else if (user.storeId) {
      navAuthBtn.textContent = "متجري";
      navAuthBtn.href = "dashboard.html";
    } else {
      navAuthBtn.textContent = "حسابي";
      navAuthBtn.href = "dashboard.html";
    }
  }

  if (storesContainer) {
    if (!stores.length) {
      storesContainer.innerHTML = storelyEmptyState("لا متاجر", "لا توجد متاجر حالياً.", "", "");
    } else {
      storesContainer.innerHTML = stores.map((store, i) => `
        <article class="store-card" style="animation-delay:${i * 0.08}s">
          <div class="store-banner" style="${storelyMediaStyle(store.banner, "assets/images/store-banner.svg")}"></div>
          <div class="store-card-body">
            <div class="store-avatar">${store.logo || store.storeName.charAt(0)}</div>
            <h3>${store.storeName}</h3>
            <p>${store.tagline}</p>
            <a class="secondary-btn" href="store.html?slug=${store.slug}">عرض المتجر</a>
          </div>
        </article>
      `).join("");
    }
  }

  const categories = ["الكل", "إلكترونيات", "ألبسة"];
  if (categoryFilter) {
    categoryFilter.innerHTML = categories.map((cat) =>
      `<button type="button" class="category-pill${_activeCategory === cat ? " active" : ""}" data-cat="${cat}">${cat}</button>`
    ).join("");
    categoryFilter.addEventListener("click", (e) => {
      const btn = e.target.closest(".category-pill");
      if (!btn) return;
      _activeCategory = btn.dataset.cat;
      categoryFilter.querySelectorAll(".category-pill").forEach((el) => el.classList.toggle("active", el.dataset.cat === _activeCategory));
      renderProducts(stores);
    });
  }

  renderProducts(stores);

  function renderProducts(allStores) {
    if (!productsContainer) return;
    let products = allStores.flatMap((store) =>
      (store.products || []).map((p) => ({ ...p, storeId: store.id, storeName: store.storeName, storeSlug: store.slug }))
    );
    if (_activeCategory !== "الكل") products = products.filter((p) => p.category === _activeCategory);

    if (!products.length) {
      productsContainer.innerHTML = storelyEmptyState("لا منتجات", "لا توجد منتجات حالياً.", "", "");
      return;
    }

    productsContainer.innerHTML = products.map((product, i) => `
      <article class="product-card product-clickable" style="animation-delay:${i * 0.06}s" role="button" tabindex="0"
        onclick="openProduct('${product.storeSlug}','${product.id}')"
        onkeydown="if(event.key==='Enter')openProduct('${product.storeSlug}','${product.id}')">
        <div class="product-image" style="${storelyMediaStyle(product.image, "assets/images/product-electronics.svg")}"></div>
        <span>${product.category}</span>
        <h3>${product.title}</h3>
        <p>${product.storeName}</p>
        <div class="product-footer">
          <strong>${storelyMoney(product.price)}</strong>
          <span class="product-hint">عرض المنتج ←</span>
        </div>
      </article>
    `).join("");
  }
});

function openProduct(storeSlug, productId) {
  storelyRequireProductAccess(`store.html?slug=${storeSlug}#${productId}`);
}
