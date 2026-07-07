let _activeCategory = "الكل";
let _searchQuery = "";
let _homeTab = "all";

const POPULAR_TAGS = {
  ar: ["سماعات", "قميص", "فستان", "شاحن", "أطفال", "إلكترونيات"],
  en: ["Headphones", "Shirt", "Dress", "Charger", "Kids", "Electronics"]
};

storelyInit().then(() => {
  storelyApplyLang();
  const t = (key) => storelyT(key);
  const lang = storelyGetLang();
  const stores = storelyGetStores();
  const userName = storelyIsLoggedIn() ? storelyCurrentUser().name : null;
  _activeCategory = t("all");

  const productsContainer = document.getElementById("featuredProducts");
  const categoryFilter = document.getElementById("categoryFilter");
  const flashProducts = document.getElementById("flashProducts");
  const searchInput = document.getElementById("searchInput");
  const cameraSearchBtn = document.getElementById("cameraSearchBtn");
  const cameraSearchInput = document.getElementById("cameraSearchInput");

  const desktopPersonalTitle = document.getElementById("desktopPersonalTitle");
  if (desktopPersonalTitle) {
    desktopPersonalTitle.textContent = userName
      ? `${t("hello")} ${userName}, ${t("pickedForYou")}`
      : t("pickedForYou");
  }
  const desktopPersonalSub = document.getElementById("desktopPersonalSub");
  if (desktopPersonalSub) desktopPersonalSub.textContent = t("pricesNote");
  const desktopPopularTitle = document.getElementById("desktopPopularTitle");
  if (desktopPopularTitle) desktopPopularTitle.textContent = lang === "en" ? "Popular Products" : "المنتجات الشائعة";
  const desktopPicksTitle = document.getElementById("desktopPicksTitle");
  if (desktopPicksTitle) desktopPicksTitle.textContent = t("pickedForYou");
  const desktopViewAll = document.getElementById("desktopViewAll");
  if (desktopViewAll) desktopViewAll.textContent = `${t("viewAll")} ›`;

  document.title = `${storelySiteName()} | ${storelyT("siteTagline")}`;

  const urlCatKey = new URLSearchParams(location.search).get("cat");
  if (urlCatKey && typeof desktopCatFromKey === "function") {
    const mapped = desktopCatFromKey(urlCatKey);
    if (mapped) _activeCategory = mapped;
  }

  const savedCat = localStorage.getItem("storelySelectedCategory");
  if (savedCat) {
    _activeCategory = savedCat;
    localStorage.removeItem("storelySelectedCategory");
  }

  document.getElementById("promoTag").textContent = t("promoTag");
  document.getElementById("promoTitle").textContent = t("promoTitle");
  document.getElementById("categoryTitle").textContent = t("categories");
  document.getElementById("productsTitle").textContent = t("pickedForYou");
  document.getElementById("flashTitle").textContent = t("flashSale");
  document.getElementById("popularSearchTitle").textContent = t("popularSearch");
  document.getElementById("viewAllCategories").textContent = `${t("viewAll")} ›`;
  document.getElementById("viewAllPicks").textContent = `${t("viewAll")} ›`;
  document.getElementById("promoLink").textContent = `${t("viewAll")} ›`;
  document.getElementById("appFooter").textContent = `${storelySiteName()} · ${t("pricesNote")}`;
  searchInput.placeholder = t("searchPlaceholder");

  const homeTabs = [
    { id: "all", label: t("all") },
    { id: "women", label: t("women"), cat: "ألبسة نسائية" },
    { id: "men", label: t("men"), cat: "ألبسة رجالية" },
    { id: "kids", label: t("kids"), cat: "ألبسة أطفال" },
    { id: "electronics", label: t("electronics"), cat: "إلكترونيات" }
  ];

  if (urlCatKey) {
    const tab = homeTabs.find((x) => x.id === urlCatKey);
    if (tab) _homeTab = tab.id;
  }

  document.getElementById("homeCategoryTabs").innerHTML = homeTabs.map((tab) =>
    `<button type="button" class="home-cat-tab${_homeTab === tab.id ? " active" : ""}" data-tab="${tab.id}" data-cat="${tab.cat || ""}">${tab.label}</button>`
  ).join("");

  document.getElementById("popularTags").innerHTML = POPULAR_TAGS[lang].map((tag) =>
    `<button type="button" class="popular-tag" data-tag="${tag}">${tag}</button>`
  ).join("");

  const categories = [t("all"), ...STORELY_CATEGORIES];
  categoryFilter.innerHTML = categories.map((cat) => {
    const label = cat === t("all") ? t("all") : storelyCategoryLabel(cat);
    const value = cat === t("all") ? t("all") : cat;
    return `<button type="button" class="cat-chip${_activeCategory === value ? " active" : ""}" data-cat="${value}">${label}</button>`;
  }).join("");

  categoryFilter.addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-chip");
    if (!btn) return;
    _activeCategory = btn.dataset.cat;
    categoryFilter.querySelectorAll(".cat-chip").forEach((el) => el.classList.toggle("active", el.dataset.cat === _activeCategory));
    renderAll(stores);
  });

  document.getElementById("homeCategoryTabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".home-cat-tab");
    if (!btn) return;
    _homeTab = btn.dataset.tab;
    document.querySelectorAll(".home-cat-tab").forEach((el) => el.classList.toggle("active", el.dataset.tab === _homeTab));
    if (btn.dataset.cat) _activeCategory = btn.dataset.cat;
    else if (_homeTab === "all") _activeCategory = t("all");
    categoryFilter.querySelectorAll(".cat-chip").forEach((el) => el.classList.toggle("active", el.dataset.cat === _activeCategory));
    renderAll(stores);
  });

  document.getElementById("popularTags").addEventListener("click", (e) => {
    const tag = e.target.closest(".popular-tag");
    if (!tag) return;
    searchInput.value = tag.dataset.tag;
    _searchQuery = tag.dataset.tag.toLowerCase();
    renderAll(stores);
  });

  searchInput?.addEventListener("input", () => {
    _searchQuery = searchInput.value.trim().toLowerCase();
    renderAll(stores);
  });

  cameraSearchBtn?.addEventListener("click", () => cameraSearchInput.click());
  cameraSearchInput?.addEventListener("change", () => {
    if (cameraSearchInput.files?.length) storelyToast(t("cameraTip"));
  });

  startFlashTimer();
  renderAll(stores);
  renderBrowsePrompt();

  function startFlashTimer() {
    let seconds = 2 * 3600 + 15 * 60 + 40;
    const el = document.getElementById("flashTimer");
    setInterval(() => {
      seconds = Math.max(0, seconds - 1);
      const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
      const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
      const s = String(seconds % 60).padStart(2, "0");
      el.textContent = `${h}:${m}:${s}`;
    }, 1000);
  }

  function filterProducts(allStores) {
    let products = allStores.flatMap((store) =>
      (store.products || []).map((p) => ({ ...p, storeName: store.storeName, storeSlug: store.slug, storeId: store.id }))
    );
    if (_activeCategory !== t("all")) products = products.filter((p) => p.category === _activeCategory);
    if (_homeTab === "offers") products = products.filter((p) => p.featured || (p.sales || 0) > 8);
    if (_searchQuery) products = products.filter((p) =>
      p.title.toLowerCase().includes(_searchQuery) ||
      p.category.toLowerCase().includes(_searchQuery) ||
      storelyCategoryLabel(p.category).toLowerCase().includes(_searchQuery)
    );
    return products;
  }

  function productCard(product, horizontal = false) {
    const fav = storelyIsFavorite(product.storeId, product.id);
    return `
      <article class="trendy-card${horizontal ? " horizontal" : ""}" data-store="${product.storeId}" data-product="${product.id}">
        <button type="button" class="fav-btn${fav ? " active" : ""}" data-fav="${product.storeId}:${product.id}">♥</button>
        <div class="trendy-img" style="${storelyMediaStyle(product.image, "assets/images/product-electronics.svg")}"></div>
        <div class="trendy-body">
          ${product.featured ? `<span class="badge-fast">${t("fastDelivery")}</span>` : ""}
          <span class="trendy-cat">${storelyCategoryLabel(product.category)}</span>
          <h3>${product.title}</h3>
          <p>${product.storeName}</p>
          <div class="trendy-footer">
            <strong>${storelyMoney(product.price)}</strong>
            <button type="button" class="mini-add-btn" data-add="${product.storeId}:${product.id}">+</button>
          </div>
        </div>
      </article>`;
  }

  function bindProductActions(container) {
    container.querySelectorAll(".trendy-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".fav-btn, .mini-add-btn")) return;
        const storeId = card.dataset.store;
        const productId = card.dataset.product;
        storelyAddBrowseHistory(storeId, productId);
        const slug = stores.find((s) => s.id === storeId)?.slug;
        if (slug) window.location.href = `store.html?slug=${slug}`;
      });
    });
    container.querySelectorAll(".fav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const [storeId, productId] = btn.dataset.fav.split(":");
        const added = storelyToggleFavorite(storeId, productId);
        btn.classList.toggle("active", added);
        storelyToast(added ? t("addedFav") : t("removedFav"));
      });
    });
    container.querySelectorAll(".mini-add-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const [storeId, productId] = btn.dataset.add.split(":");
        await storelyRequestAddToCartAsync(storeId, productId);
      });
    });
  }

  function desktopProductCard(product) {
    const fav = storelyIsFavorite(product.storeId, product.id);
    return `
      <article class="desktop-product-card" data-store="${product.storeId}" data-product="${product.id}" data-slug="${product.storeSlug}">
        <span class="badge-bestseller">${lang === "en" ? "BEST SELLER" : "الأكثر مبيعاً"}</span>
        <button type="button" class="fav-corner${fav ? " active" : ""}" data-fav="${product.storeId}:${product.id}">♥</button>
        <div class="img" style="${storelyMediaStyle(product.image, "assets/images/product-electronics.svg")}"></div>
        <div class="body">
          <h3>${product.title}</h3>
          <div class="price">${storelyMoney(product.price)}</div>
        </div>
      </article>`;
  }

  function bindDesktopProducts(container) {
    if (!container) return;
    container.querySelectorAll(".desktop-product-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".fav-corner")) return;
        const storeId = card.dataset.store;
        const productId = card.dataset.product;
        storelyAddBrowseHistory(storeId, productId);
        const slug = card.dataset.slug || stores.find((s) => s.id === storeId)?.slug;
        if (slug) window.location.href = `store.html?slug=${slug}`;
      });
    });
    container.querySelectorAll(".fav-corner").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const [storeId, productId] = btn.dataset.fav.split(":");
        const added = storelyToggleFavorite(storeId, productId);
        btn.classList.toggle("active", added);
        storelyToast(added ? t("addedFav") : t("removedFav"));
      });
    });
  }

  function renderDesktop(allStores, products) {
    const popular = document.getElementById("desktopPopularProducts");
    const picked = document.getElementById("desktopPickedProducts");
    if (!popular && !picked) return;
    const list = products.length ? products : filterProducts(allStores);
    if (popular) {
      popular.innerHTML = list.slice(0, 10).map(desktopProductCard).join("");
      bindDesktopProducts(popular);
    }
    if (picked) {
      picked.innerHTML = list.slice(0, 10).map(desktopProductCard).join("");
      bindDesktopProducts(picked);
    }
  }

  function renderAll(allStores) {
    const products = filterProducts(allStores);
    if (!products.length) {
      productsContainer.innerHTML = storelyEmptyState(t("noProducts"), t("tryAnother"), "", "");
      flashProducts.innerHTML = "";
      renderDesktop(allStores, []);
      return;
    }
    flashProducts.innerHTML = products.slice(0, 6).map((p) => productCard(p, true)).join("");
    productsContainer.innerHTML = products.map((p) => productCard(p)).join("");
    bindProductActions(flashProducts);
    bindProductActions(productsContainer);
    renderDesktop(allStores, products);
  }

  function renderBrowsePrompt() {
    const box = document.getElementById("welcomeBand");
    if (!box) return;
    if (storelyIsLoggedIn()) {
      box.innerHTML = `<div class="login-prompt-card logged-in"><div><h2>${t("hello")} ${storelyCurrentUser().name || ""}</h2><p>${t("enjoyShopping")}</p></div></div>`;
      return;
    }
    box.innerHTML = `<div class="login-prompt-card"><div><h2>${t("browseFree")}</h2><p>${t("browseSignIn")}</p></div><a class="primary-btn large" href="login.html">${t("signIn")}</a></div>`;
  }
});
