function appCloseMenu() {
  document.body.classList.remove("menu-open");
}

function appOpenMenu() {
  document.body.classList.toggle("menu-open");
}

function appPageName() {
  return location.pathname.split("/").pop() || "index.html";
}

function appIsAuthPage() {
  const page = appPageName();
  return page === "login.html" || page === "forgot-password.html" || page === "reset-password.html";
}

function appIsProtectedPage() {
  return ["account-info.html", "settings.html", "dashboard.html", "checkout.html", "admin.html"].includes(appPageName());
}

function appRequireLogin() {
  if (appIsAuthPage() || !appIsProtectedPage() || storelyIsLoggedIn()) return true;
  const target = appPageName() + location.search + location.hash;
  localStorage.setItem("storelyRedirectAfterLogin", target);
  window.location.href = "login.html";
  return false;
}

function appRefreshNav() {
  document.querySelector(".app-topbar")?.remove();
  document.querySelector(".app-bottomnav")?.remove();
  document.getElementById("appMenuOverlay")?.remove();
  document.getElementById("appSideMenu")?.remove();
  document.body.classList.remove("menu-open", "has-bottomnav");
  if (appIsAuthPage()) return;
  if (!appRequireLogin()) return;
  appMountNav();
  storelyUpdateCartBadge();
}

function appMountNav() {
  if (document.body.dataset.noShell === "1" || document.querySelector(".app-topbar")) return;

  const loggedIn = storelyIsLoggedIn();
  const user = storelyCurrentUser();
  const cartCount = storelyCartCount();
  const path = appPageName();
  const brand = APP_CONFIG.siteNameAr || APP_CONFIG.siteName || storelyT("siteName");
  const lang = storelyGetLang();
  const badge = cartCount > 0 ? `<span class="badge">${cartCount}</span>` : "";
  const accountPages = ["profile.html", "account-info.html", "settings.html"];
  const isAccount = accountPages.includes(path);

  const top = document.createElement("header");
  top.className = "app-topbar";
  top.innerHTML = `
    <button type="button" class="menu-btn" id="menuBtn" aria-label="menu">☰</button>
    <button type="button" class="lang-chip-btn" id="langToggleBtn">${lang === "ar" ? "EN" : "AR"}</button>
    <a class="topbar-brand" href="index.html">${brand}</a>
    <a class="topbar-icon-btn" href="notifications.html" title="${storelyT("notifications")}">🔔</a>
    <a class="topbar-cart" href="cart.html" title="${storelyT("cart")}">🛒${badge}</a>
    ${loggedIn ? "" : `<a class="topbar-login" href="login.html">${storelyT("login")}</a>`}
  `;
  document.body.insertBefore(top, document.body.firstChild);

  const overlay = document.createElement("div");
  overlay.className = "menu-overlay";
  overlay.id = "appMenuOverlay";

  const menu = document.createElement("nav");
  menu.className = "app-side-menu";
  menu.id = "appSideMenu";
  menu.innerHTML = `
    <div class="menu-user">
      <span class="menu-avatar">${loggedIn && user?.avatar ? `<img src="${user.avatar}" alt="">` : (loggedIn ? (user.name || "م").charAt(0) : "ش")}</span>
      <div><strong>${loggedIn ? (user.name || storelyT("account")) : storelyT("siteName")}</strong><small>${loggedIn ? (user.email || "") : storelyT("login")}</small></div>
      <button type="button" class="menu-close" id="menuClose">×</button>
    </div>
    <a href="index.html" class="menu-link${path === "index.html" ? " active" : ""}">🏠 ${storelyT("home")}</a>
    <a href="categories.html" class="menu-link${path === "categories.html" ? " active" : ""}">📂 ${storelyT("categories")}</a>
    <a href="favorites.html" class="menu-link${path === "favorites.html" ? " active" : ""}">❤️ ${storelyT("favorites")}</a>
    <a href="cart.html" class="menu-link${path === "cart.html" ? " active" : ""}">🛒 ${storelyT("cart")}</a>
    <a href="profile.html" class="menu-link${path === "profile.html" ? " active" : ""}">👤 ${storelyT("account")}</a>
    <a href="notifications.html" class="menu-link${path === "notifications.html" ? " active" : ""}">🔔 ${storelyT("notifications")}</a>
    <a href="help.html" class="menu-link${path === "help.html" ? " active" : ""}">❓ ${storelyT("help")}</a>
    ${loggedIn ? `<a href="settings.html" class="menu-link${path === "settings.html" ? " active" : ""}">⚙️ ${storelyT("settings")}</a>` : ""}
    <hr>
    ${loggedIn ? `<a href="#" class="menu-link" id="logoutLink">🚪 ${storelyT("logout")}</a>` : `<a href="login.html" class="menu-link">🔐 ${storelyT("login")}</a>`}
  `;

  const bottom = document.createElement("nav");
  bottom.className = "app-bottomnav";
  bottom.innerHTML = `
    <a href="index.html" class="${path === "index.html" ? "active" : ""}"><span>🏠</span><small>${storelyT("home")}</small></a>
    <a href="categories.html" class="${path === "categories.html" ? "active" : ""}"><span>🚚</span><small>${storelyT("delivery")}</small></a>
    <a href="favorites.html" class="${path === "favorites.html" ? "active" : ""}"><span>❤️</span><small>${storelyT("favorites")}</small></a>
    <a href="cart.html" class="${path === "cart.html" ? "active" : ""}"><span>🛒</span><small>${storelyT("cart")}</small></a>
    <a href="profile.html" class="${isAccount ? "active" : ""}"><span>👤</span><small>${storelyT("account")}</small></a>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(menu);
  document.body.appendChild(bottom);

  top.querySelector("#menuBtn").addEventListener("click", appOpenMenu);
  overlay.addEventListener("click", appCloseMenu);
  menu.querySelector("#menuClose").addEventListener("click", appCloseMenu);
  menu.querySelector("#logoutLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    storelyLogout();
    window.location.href = "login.html";
  });
  top.querySelector("#langToggleBtn")?.addEventListener("click", () => {
    storelySetLang(storelyGetLang() === "ar" ? "en" : "ar");
    window.location.reload();
  });
  document.body.classList.add("has-bottomnav");
}

storelyRefreshAppShell = appRefreshNav;

storelyInit().then(() => {
  if (appIsAuthPage()) return;
  if (!appRequireLogin()) return;
  appMountNav();
  storelyUpdateCartBadge();
});
