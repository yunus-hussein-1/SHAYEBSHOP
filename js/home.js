let _activeCategory = "الكل";
let _searchQuery = "";
let _tabFilter = "featured";

const HOME_I18N = {
  ar: {
    all: "الكل",
    noProducts: "لا منتجات",
    noProductsText: "جرّب تصنيفاً آخر أو ابحث بكلمة مختلفة.",
    welcomeTitle: "متجر الشايب",
    welcomeSub: "تسوق بأسلوب تطبيقات حديثة",
    profile: "الحساب",
    searchPlaceholder: "ابحث عن ماركة أو منتج أو فئة",
    featured: "عروض مميزة",
    history: "سجل التصفح",
    notifications: "الإشعارات",
    categories: "كل الفئات",
    picks: "قطع لك خصيصاً",
    cameraTip: "تم اختيار صورة. أضف اسم المنتج في البحث لإظهار نتائج أدق.",
    hello: "أهلاً",
    useBottom: "استخدم الشريط السفلي: بروفايل · مساعدة · إعدادات",
    browseFree: "تصفّح بحرية — اشترِ بعد تسجيل الدخول",
    browseInfo: "يمكنك مشاهدة المنتجات وإضافتها للسلة. لإتمام الشراء والدفع سجّل دخولك.",
    loginBuy: "تسجيل الدخول للشراء"
  },
  en: {
    all: "All",
    noProducts: "No products",
    noProductsText: "Try another category or search term.",
    welcomeTitle: "Alshayeb Store",
    welcomeSub: "Mobile-style shopping experience",
    profile: "Account",
    searchPlaceholder: "Search brand, product, or category",
    featured: "Featured",
    history: "Browsing History",
    notifications: "Notifications",
    categories: "All Categories",
    picks: "Picked for You",
    cameraTip: "Image selected. Add keyword in search for better matches.",
    hello: "Hello",
    useBottom: "Use bottom bar: Profile · Help · Settings",
    browseFree: "Browse freely — sign in to checkout",
    browseInfo: "You can explore products and cart. Sign in to complete checkout.",
    loginBuy: "Sign in to Buy"
  }
};

storelyInit().then(() => {
  const lang = storelyGetLang();
  const t = HOME_I18N[lang];
  _activeCategory = t.all;
  const productsContainer = document.getElementById("featuredProducts");
  const categoryFilter = document.getElementById("categoryFilter");
  const searchInput = document.getElementById("searchInput");
  const cameraSearchBtn = document.getElementById("cameraSearchBtn");
  const cameraSearchInput = document.getElementById("cameraSearchInput");
  const stores = storelyActiveStores();

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
  document.getElementById("homeWelcomeTitle").textContent = t.welcomeTitle;
  document.getElementById("homeWelcomeSub").textContent = t.welcomeSub;
  document.getElementById("profileBtnLabel").textContent = t.profile;
  document.getElementById("featuredTabLabel").textContent = t.featured;
  document.getElementById("historyTabLabel").textContent = t.history;
  document.getElementById("notifyTabLabel").textContent = t.notifications;
  document.getElementById("categoryTitle").textContent = t.categories;
  document.getElementById("productsTitle").textContent = t.picks;
  searchInput.placeholder = t.searchPlaceholder;

  storelyUpdateCartBadge();

  const categories = [t.all, ...STORELY_CATEGORIES];
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

  if (cameraSearchBtn && cameraSearchInput) {
    cameraSearchBtn.addEventListener("click", () => cameraSearchInput.click());
    cameraSearchInput.addEventListener("change", () => {
      if (cameraSearchInput.files?.length) storelyToast(t.cameraTip);
    });
  }

  document.querySelectorAll(".quick-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".quick-tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      _tabFilter = tab.dataset.role;
      renderProducts(stores);
    });
  });

  renderProducts(stores);
  renderBrowsePrompt();

  function renderBrowsePrompt() {
    const box = document.getElementById("welcomeBand");
    if (!box) return;
    if (storelyIsLoggedIn()) {
      box.innerHTML = `
        <div class="login-prompt-card logged-in">
          <div>
            <h2>${t.hello} ${storelyCurrentUser().name || ""}</h2>
            <p>${t.useBottom}</p>
          </div>
        </div>`;
      return;
    }
    box.innerHTML = `
      <div class="login-prompt-card">
        <div>
          <h2>${t.browseFree}</h2>
          <p>${t.browseInfo}</p>
        </div>
        <a class="primary-btn large" href="login.html">${t.loginBuy}</a>
      </div>`;
  }

  function renderProducts(allStores) {
    if (!productsContainer) return;
    let products = allStores.flatMap((store) =>
      (store.products || []).map((p) => ({ ...p, storeName: store.storeName, storeSlug: store.slug, storeId: store.id }))
    );
    if (_activeCategory !== t.all) products = products.filter((p) => p.category === _activeCategory);
    if (_searchQuery) products = products.filter((p) => p.title.toLowerCase().includes(_searchQuery));
    if (_tabFilter === "featured") products = products.filter((p) => p.featured || (p.sales || 0) > 10);
    if (_tabFilter === "history") products = products.slice().sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 8);

    if (!products.length) {
      productsContainer.innerHTML = storelyEmptyState(t.noProducts, t.noProductsText, "", "");
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
