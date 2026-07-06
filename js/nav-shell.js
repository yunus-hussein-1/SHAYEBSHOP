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
  return ["profile.html", "settings.html", "dashboard.html", "checkout.html", "admin.html"].includes(appPageName());
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
  const brand = APP_CONFIG.siteName || APP_CONFIG.siteNameAr || "ALSHAYEB SHOP";
  const badge = cartCount > 0 ? `<span class="badge">${cartCount}</span>` : "";

  const top = document.createElement("header");
  top.className = "app-topbar";
  top.innerHTML = loggedIn ? `
    <button type="button" class="menu-btn" id="menuBtn" aria-label="القائمة">☰</button>
    <a class="topbar-brand" href="index.html">${brand}</a>
    <a class="topbar-cart" href="cart.html" title="السلة">🛒${badge}</a>
  ` : `
    <a class="topbar-brand" href="index.html">${brand}</a>
    <a class="topbar-cart" href="cart.html" title="السلة">🛒${badge}</a>
    <a class="topbar-login" href="login.html">تسجيل الدخول</a>
  `;
  document.body.insertBefore(top, document.body.firstChild);

  if (loggedIn) {
    const overlay = document.createElement("div");
    overlay.className = "menu-overlay";
    overlay.id = "appMenuOverlay";

    const menu = document.createElement("nav");
    menu.className = "app-side-menu";
    menu.id = "appSideMenu";
    menu.innerHTML = `
      <div class="menu-user">
        <span class="menu-avatar">${user.avatar ? `<img src="${user.avatar}" alt="">` : (user.name || "م").charAt(0)}</span>
        <div><strong>${user.name || "عضو"}</strong><small>${user.email || ""}</small></div>
        <button type="button" class="menu-close" id="menuClose">×</button>
      </div>
      <a href="profile.html" class="menu-link${path === "profile.html" ? " active" : ""}">👤 بروفايل</a>
      <a href="help.html" class="menu-link${path === "help.html" ? " active" : ""}">❓ مساعدة</a>
      <a href="settings.html" class="menu-link${path === "settings.html" ? " active" : ""}">⚙️ إعدادات</a>
      <hr>
      <a href="index.html" class="menu-link">🏠 الرئيسية</a>
      <a href="cart.html" class="menu-link">🛒 سلة المشتريات ${cartCount > 0 ? `(${cartCount})` : ""}</a>
      <a href="#" class="menu-link" id="logoutLink">🚪 تسجيل خروج</a>
    `;

    const bottom = document.createElement("nav");
    bottom.className = "app-bottomnav";
    bottom.innerHTML = `
      <a href="index.html" class="${path === "index.html" ? "active" : ""}"><span>🏠</span><small>الرئيسية</small></a>
      <a href="cart.html" class="${path === "cart.html" ? "active" : ""}"><span>🛒</span><small>السلة</small></a>
      <a href="profile.html" class="${path === "profile.html" ? "active" : ""}"><span>👤</span><small>بروفايل</small></a>
      <a href="help.html" class="${path === "help.html" ? "active" : ""}"><span>❓</span><small>مساعدة</small></a>
      <a href="settings.html" class="${path === "settings.html" ? "active" : ""}"><span>⚙️</span><small>إعدادات</small></a>
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
    document.body.classList.add("has-bottomnav");
  } else {
    const bottom = document.createElement("nav");
    bottom.className = "app-bottomnav app-bottomnav-guest";
    bottom.innerHTML = `
      <a href="index.html" class="${path === "index.html" ? "active" : ""}"><span>🏠</span><small>الرئيسية</small></a>
      <a href="cart.html" class="${path === "cart.html" ? "active" : ""}"><span>🛒</span><small>السلة</small></a>
      <a href="help.html" class="${path === "help.html" ? "active" : ""}"><span>❓</span><small>مساعدة</small></a>
      <a href="login.html" class="${path === "login.html" ? "active" : ""}"><span>🔐</span><small>دخول</small></a>
    `;
    document.body.appendChild(bottom);
    document.body.classList.add("has-bottomnav");
  }
}

storelyRefreshAppShell = appRefreshNav;

storelyInit().then(() => {
  if (appIsAuthPage()) return;
  if (!appRequireLogin()) return;
  appMountNav();
  storelyUpdateCartBadge();
});
