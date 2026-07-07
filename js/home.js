let _activeCategory = "الكل";
let _searchQuery = "";

storelyInit().then(() => {
  const productsContainer = document.getElementById("featuredProducts");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  const stores = storelyActiveStores();

  storelyUpdateCartBadge();

  const categories = ["الكل", ...STORELY_CATEGORIES];
  categoryFilter.innerHTML = categories.map((cat) =>
    `<button type="button" class="cat-chip${_activeCategory === cat ? " active" : ""}" data-cat="${cat}">${cat}</button>`
  ).join("");

  categoryFilter.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-chip");
    if (!btn) return;
    _activeCategory = btn.dataset.cat;
    categoryFilter.querySelectorAll(".cat-chip").forEach((el) => el.classList.toggle("active", el.dataset.cat === _activeCategory));
    renderProducts(stores);
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      _searchQuery = searchInput.value.trim().toLowerCase();
      renderProducts(stores);
    });
  }

  renderProducts(stores);
  renderBrowsePrompt();

  function renderBrowsePrompt() {
    const box = document.getElementById("welcomeBand");
    if (!box) return;
    if (storelyIsLoggedIn()) {
      box.innerHTML = `
        <div class="login-prompt-card logged-in">
          <div>
            <h2>أهلاً ${storelyCurrentUser().name || ""}</h2>
            <p>استخدم الشريط السفلي: بروفايل · مساعدة · إعدادات</p>
          </div>
        </div>`;
      return;
    }
    box.innerHTML = `
      <div class="login-prompt-card">
        <div>
          <h2>تصفّح بحرية — اشترِ بعد تسجيل الدخول</h2>
          <p>يمكنك مشاهدة المنتجات وإضافتها للسلة. لإتمام الشراء والدفع سجّل دخولك.</p>
        </div>
        <a class="primary-btn large" href="login.html">تسجيل الدخول للشراء</a>
      </div>`;
  }

  function renderProducts(allStores) {
    if (!productsContainer) return;
    let products = allStores.flatMap((store) =>
      (store.products || []).map((p) => ({ ...p, storeName: store.storeName, storeSlug: store.slug, storeId: store.id }))
    );
    products = products.filter((p) => storelyIsAllowedCategory(p.category));
    if (_activeCategory !== "الكل") products = products.filter((p) => p.category === _activeCategory);
    if (_searchQuery) products = products.filter((p) => p.title.toLowerCase().includes(_searchQuery));

    if (!products.length) {
      productsContainer.innerHTML = storelyEmptyState("لا منتجات", "جرّب تصنيفاً آخر أو ابحث بكلمة مختلفة.", "", "");
      return;
    }

    productsContainer.innerHTML = products.map((product) => `
      <article class="trendy-card" onclick="location.href='store.html?slug=${product.storeSlug}'">
        <div class="trendy-img" style="${storelyMediaStyle(product.image, "assets/images/product-electronics.svg")}"></div>
        <div class="trendy-body">
          <span class="trendy-cat">${product.category}</span>
          <h3>${product.title}</h3>
          <p>${product.storeName}</p>
          <strong>${storelyMoney(product.price)}</strong>
        </div>
      </article>
    `).join("");
  }
});
