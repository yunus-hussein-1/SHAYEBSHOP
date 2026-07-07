const DESKTOP_CATS = [
  { key: "women", ar: "امرأة", en: "Women", cat: "ألبسة نسائية" },
  { key: "men", ar: "رجل", en: "Men", cat: "ألبسة رجالية" },
  { key: "kids", ar: "أطفال", en: "Kids", cat: "ألبسة أطفال" },
  { key: "electronics", ar: "إلكترونيات", en: "Electronics", cat: "إلكترونيات" }
];

function desktopCatFromKey(key) {
  return DESKTOP_CATS.find((c) => c.key === key)?.cat || null;
}

function desktopPage() {
  return location.pathname.split("/").pop() || "index.html";
}

function desktopIsAuth() {
  return ["forgot-password.html", "reset-password.html"].includes(desktopPage());
}

function desktopT(key) {
  return typeof storelyT === "function" ? storelyT(key) : key;
}

function desktopMountShell() {
  if (desktopIsAuth() || document.body.dataset.noShell === "1" || document.getElementById("desktopShell")) return;

  const lang = typeof storelyGetLang === "function" ? storelyGetLang() : "ar";
  const t = (k) => desktopT(k);
  const name = typeof storelySiteName === "function" ? storelySiteName() : "Shaib Shop";
  const path = desktopPage();
  const cartCount = typeof storelyCartCount === "function" ? storelyCartCount() : 0;

  const shell = document.createElement("div");
  shell.id = "desktopShell";
  shell.className = "desktop-only";
  shell.innerHTML = `
    <div class="desktop-util">
      <div class="desktop-util-inner">
        <div class="desktop-util-links">
          <a href="help.html">${t("help")}</a>
          <a href="sell.html">${lang === "en" ? "Sell on Shaib Shop" : "بيع على شايب شوب"}</a>
          <a href="settings.html">${t("myCoupons")}</a>
        </div>
        <div class="desktop-util-links">
          <button type="button" class="desktop-lang-btn" id="desktopLangBtn">${lang === "ar" ? "EN" : "AR"}</button>
        </div>
      </div>
    </div>
    <header class="desktop-header">
      <div class="desktop-header-inner">
        <a href="index.html" class="desktop-logo">
          ${name}
          <small>plus</small>
        </a>
        <div class="desktop-search-wrap">
          <button type="button" class="desktop-cam-btn" id="desktopCamBtn" title="camera">📷</button>
          <input type="search" id="desktopSearch" placeholder="${t("searchPlaceholder")}">
          <button type="button" class="desktop-search-btn">🔍</button>
        </div>
        <div class="desktop-header-actions">
          <a href="${storelyIsLoggedIn?.() ? "profile.html" : "login.html"}"><span class="icon">👤</span>${storelyIsLoggedIn?.() ? t("account") : t("login")}</a>
          <a href="favorites.html"><span class="icon">❤️</span>${t("favorites")}</a>
          <a href="cart.html"><span class="icon">🛒</span>${t("cart")}${cartCount ? ` (${cartCount})` : ""}</a>
        </div>
      </div>
    </header>
    <nav class="desktop-cat-nav">
      <div class="desktop-cat-nav-inner" id="desktopCatNav"></div>
    </nav>
  `;

  document.body.insertBefore(shell, document.body.firstChild);

  const catNav = document.getElementById("desktopCatNav");
  const activeKey = new URLSearchParams(location.search).get("cat") || "";
  catNav.innerHTML = DESKTOP_CATS.map((c) =>
    `<a href="index.html?cat=${c.key}" data-cat-key="${c.key}" class="desktop-cat-link${activeKey === c.key ? " active" : ""}">${lang === "en" ? c.en : c.ar}</a>`
  ).join("");

  const footer = document.createElement("footer");
  footer.className = "desktop-footer desktop-only";
  footer.id = "desktopFooter";
  footer.innerHTML = `
    <div class="desktop-footer-inner">
      <div class="desktop-footer-col">
        <h4>${name}</h4>
        <a href="help.html">${lang === "en" ? "About Us" : "من نحن"}</a>
        <a href="help.html">${lang === "en" ? "Contact" : "تواصل معنا"}</a>
        <a href="help.html">${lang === "en" ? "Security" : "الأمان"}</a>
      </div>
      <div class="desktop-footer-col">
        <h4>${t("campaigns")}</h4>
        <a href="index.html">${lang === "en" ? "Offers" : "العروض"}</a>
        <a href="favorites.html">${t("favorites")}</a>
      </div>
      <div class="desktop-footer-col">
        <h4>${lang === "en" ? "Seller" : "البائع"}</h4>
        <a href="sell.html">${lang === "en" ? "Sell on Shaib Shop" : "بيع على شايب شوب"}</a>
        <a href="settings.html">${t("settings")}</a>
      </div>
      <div class="desktop-footer-col">
        <h4>${t("help")}</h4>
        <a href="help.html">${lang === "en" ? "FAQ" : "الأسئلة الشائعة"}</a>
        <a href="help.html">${lang === "en" ? "Live Support" : "دعم مباشر"}</a>
        <a href="help.html">${lang === "en" ? "Returns" : "الإرجاع"}</a>
      </div>
    </div>
    <div class="desktop-footer-bottom">© ${name} · ${t("pricesNote")}</div>
  `;
  document.body.appendChild(footer);

  document.getElementById("desktopLangBtn")?.addEventListener("click", () => {
    storelySetLang(lang === "ar" ? "en" : "ar");
    window.location.reload();
  });

  const desktopSearch = document.getElementById("desktopSearch");
  const mobileSearch = document.getElementById("searchInput");
  if (desktopSearch && mobileSearch) {
    desktopSearch.addEventListener("input", () => {
      mobileSearch.value = desktopSearch.value;
      mobileSearch.dispatchEvent(new Event("input"));
    });
  }
  document.getElementById("desktopCamBtn")?.addEventListener("click", () => {
    document.getElementById("cameraSearchBtn")?.click();
  });
}

function desktopRefreshCartCount() {
  const cartLink = document.querySelector(".desktop-header-actions a[href='cart.html']");
  if (!cartLink || typeof storelyCartCount !== "function" || typeof storelyT !== "function") return;
  const count = storelyCartCount();
  const label = storelyT("cart");
  cartLink.innerHTML = `<span class="icon">🛒</span>${label}${count ? ` (${count})` : ""}`;
}

function desktopSummaryHtml({ title, subtotal, shipping, total, showDiscount = true, btnText, btnId, btnDisabled = false }) {
  const t = (k) => desktopT(k);
  return `
    <div class="desktop-summary">
      <h2>${title || t("cartSummary")}</h2>
      <div class="desktop-summary-row"><span>${t("subtotal")}</span><strong>${subtotal}</strong></div>
      <div class="desktop-summary-row">
        <span>${t("shipping")}</span>
        <span><s style="opacity:.5">${shipping}</s> <span class="free-badge">${t("free")}</span></span>
      </div>
      <div class="desktop-shipping-note">📦 ${t("fastShipNote")}</div>
      <div class="desktop-summary-row total"><span>${t("total")}</span><strong>${total}</strong></div>
      ${showDiscount ? `<input type="text" class="desktop-discount-input" placeholder="+ ${t("discountCode")}" readonly>` : ""}
      <button type="button" class="primary-btn full" id="${btnId || "desktopCheckoutBtn"}" ${btnDisabled ? "disabled" : ""}>${btnText || t("confirmCart")}</button>
    </div>`;
}

function desktopMountAccountSidebar(containerId, active = "") {
  const box = document.getElementById(containerId);
  if (!box) return;
  const lang = storelyGetLang();
  const t = (k) => desktopT(k);
  const user = storelyIsLoggedIn?.() ? storelyCurrentUser() : null;
  const name = user?.name || storelySiteName();
  const email = user?.email || (lang === "en" ? "Guest" : "زائر");
  const member = t("member");

  const orders = [
    { href: "cart.html", icon: "📦", key: "myOrders" },
    { href: "favorites.html", icon: "⭐", key: "myReviews", fallback: lang === "en" ? "My Reviews" : "تقييماتي" },
    { href: "help.html", icon: "✉️", key: "sellerMessages", fallback: lang === "en" ? "Seller Messages" : "رسائل البائع" },
    { href: "index.html", icon: "🛍️", key: "buyAgain" }
  ];
  const personal = [
    { href: "account-info.html", icon: "👤", key: "myUserInfo", id: "userInfo" },
    { href: "account-info.html#address", icon: "📍", key: "myAddress", fallback: lang === "en" ? "My Address" : "معلومات عنواني" },
    { href: "settings.html", icon: "💳", key: "savedCards", fallback: lang === "en" ? "Saved Cards" : "بطاقاتي المسجلة" },
    { href: "settings.html", icon: "🔔", key: "adPrefs", fallback: lang === "en" ? "Ad Preferences" : "تفضيلات الإعلانات" },
    { href: "settings.html", icon: "🔒", key: "changePassword", fallback: lang === "en" ? "Change Password" : "تغيير كلمة المرور" },
    { href: "help.html", icon: "❓", key: "help" }
  ];

  const link = (item) => {
    const label = t(item.key) !== item.key ? t(item.key) : (item.fallback || item.key);
    const isActive = active === item.id || active === item.key || (active === "profile" && item.href === "profile.html");
    return `<a href="${item.href}" class="desktop-side-link${isActive ? " active" : ""}"><span>${item.icon}</span>${label}</a>`;
  };

  box.innerHTML = `
    <div class="desktop-account-sidebar">
      <div class="desktop-profile-card">
        <h3>${name}</h3>
        <p>${email}</p>
        <span class="desktop-member-pill">${member}</span>
      </div>
      <div class="desktop-side-menu">
        <h4>${t("myOrders")}</h4>
        ${orders.map(link).join("")}
      </div>
      <div class="desktop-side-menu">
        <h4>${lang === "en" ? "Just For You" : "فقط لأجلك"}</h4>
        <a href="settings.html" class="desktop-side-link"><span>🎟️</span>${t("myCoupons")}</a>
        <a href="favorites.html" class="desktop-side-link"><span>🕒</span>${t("browsingHistory")}</a>
      </div>
      <div class="desktop-side-menu">
        <h4>${lang === "en" ? "My Account & Help" : "حسابي والمساعدة"}</h4>
        ${personal.map(link).join("")}
      </div>
    </div>`;
}

storelyInit?.().then(() => {
  if (!desktopIsAuth()) desktopMountShell();
});
