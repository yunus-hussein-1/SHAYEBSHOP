let _activeCategory = "الكل";
let _searchQuery = "";
let _homeTab = "all";

const POPULAR_TAGS = {
  ar: ["سماعات", "قميص", "فستان", "شاحن", "أطفال", "إلكترونيات"],
  en: ["Headphones", "Shirt", "Dress", "Charger", "Kids", "Electronics"]
};

storelyInit().then(() => {
  storelyApplyLang();
  const lang = storelyGetLang();
  const t = (key) => storelyT(key);
  _activeCategory = t("all");

  const productsContainer = document.getElementById("featuredProducts");
  const categoryFilter = document.getElementById("categoryFilter");
  const flashProducts = document.getElementById("flashProducts");
  const searchInput = document.getElementById("searchInput");
  const cameraSearchBtn = document.getElementById("cameraSearchBtn");
  const cameraSearchInput = document.getElementById("cameraSearchInput");
  const stores = storelyActiveStores();

  const savedCat = localStorage.getItem("storelySelectedCategory");
  if (savedCat) {
    _activeCategory = savedCat;
    localStorage.removeItem("storelySelectedCategory");
  }

  document.getElementById("categoryTitle").textContent = t("categories");
  document.getElementById("productsTitle").textContent = t("pickedForYou");
  document.getElementById("flashTitle").textContent = t("flashSale");
  document.getElementById("popularSearchTitle").textContent = t("popularSearch");
  document.getElementById("viewAllCategories").textContent = `${t("viewAll")} ›`;
  document.getElementById("viewAllPicks").textContent = `${t("viewAll")} ›`;
  document.getElementById("promoLink").textContent = `${t("viewAll")} ›`;
  document.getElementById("appFooter").textContent = `${t("siteName")} · ${lang === "en" ? "All prices in SYP" : "جميع الأسعار بالليرة السورية"}`;
  searchInput.placeholder = t("searchPlaceholder");

  const homeTabs = [
    { id: "all", ar: "الكل", en: "All" },
    { id: "women", ar: "نساء", en: "Women", cat: "ألبسة نسائية" },
    { id: "men", ar: "رجال", en: "Men", cat: "ألبسة رجالية" },
    { id: "offers", ar: "عروض", en: "Offers" },
    { id: "electronics", ar: "إلكترونيات", en: "Electronics", cat: "إلكترونيات" }
  ];

  document.getElementById("homeCategoryTabs").innerHTML = homeTabs.map((tab) =>
    `<button type="button" class="home-cat-tab${_homeTab === tab.id ? " active" : ""}" data-tab="${tab.id}" data-cat="${tab.cat || ""}">${lang === "en" ? tab.en : tab.ar}</button>`
  ).join("");

  document.getElementById("popularTags").innerHTML = POPULAR_TAGS[lang].map((tag) =>
    `<button type="button" class="popular-tag" data-tag="${tag}">${tag}</button>`
  ).join("");

  const categories = [t("all"), ...STORELY_CATEGORIES];
  categoryFilter.innerHTML = categories.map((cat) =>
    `<button type="button" class="cat-chip${_activeCategory === cat ? " active" : ""}" data-cat="${cat}">${cat}</button>`
  ).join("");

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
    if (cameraSearchInput.files?.length) {
      storelyToast(lang === "en" ? "Image selected. Type product name to refine results." : "تم اختيار صورة. اكتب اسم المنتج لنتائج أدق.");
    }
  });

  document.querySelector('[data-role="notifications"]')?.addEventListener("click", () => {
    window.location.href = "notifications.html";
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
    if (_searchQuery) products = products.filter((p) => p.title.toLowerCase().includes(_searchQuery) || p.category.toLowerCase().includes(_searchQuery));
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
          <span class="trendy-cat">${product.category}</span>
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
        storelyToast(added ? (lang === "en" ? "Added to favorites" : "أُضيف للمفضلة") : (lang === "en" ? "Removed from favorites" : "أُزيل من المفضلة"));
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

  function renderAll(allStores) {
    const products = filterProducts(allStores);
    if (!products.length) {
      productsContainer.innerHTML = storelyEmptyState(lang === "en" ? "No products" : "لا منتجات", lang === "en" ? "Try another filter." : "جرّب تصنيفاً آخر.", "", "");
      flashProducts.innerHTML = "";
      return;
    }
    flashProducts.innerHTML = products.slice(0, 6).map((p) => productCard(p, true)).join("");
    productsContainer.innerHTML = products.map((p) => productCard(p)).join("");
    bindProductActions(flashProducts);
    bindProductActions(productsContainer);
  }

  function renderBrowsePrompt() {
    const box = document.getElementById("welcomeBand");
    if (!box) return;
    if (storelyIsLoggedIn()) {
      box.innerHTML = `<div class="login-prompt-card logged-in"><div><h2>${lang === "en" ? "Hello" : "أهلاً"} ${storelyCurrentUser().name || ""}</h2><p>${lang === "en" ? "Enjoy shopping at Alshayeb Store" : "تسوق ممتع من متجر الشايب"}</p></div></div>`;
      return;
    }
    box.innerHTML = `<div class="login-prompt-card"><div><h2>${lang === "en" ? "Browse freely" : "تصفّح بحرية"}</h2><p>${lang === "en" ? "Sign in to checkout and pay with Sham Cash." : "سجّل دخولك لإتمام الشراء والدفع عبر شام كاش."}</p></div><a class="primary-btn large" href="login.html">${storelyT("login")}</a></div>`;
  }
});
