const STORELY_STORES_KEY = "storelyStores";
const STORELY_SESSION_KEY = "storelySession";
const STORELY_SUBSCRIPTION_KEY = "storelySubscription";
const STORELY_USERS_KEY = "storelyUsers";
const STORELY_AD_COUNTER_KEY = "storelyAdCounter";
const STORELY_CART_PREFIX = "storelyCart_";
const STORELY_DATA_VERSION_KEY = "storelyDataVersion";
const STORELY_DATA_VERSION = "3";
const SITE_NAME = "Shayeb Shop";
const SITE_NAME_AR = "شايب شوب";
const SITE_TAGLINE = "منصة متخصصة للإلكترونيات والألبسة";
const PLATFORM_COMMISSION = () => (window.ALSHAYEB_DB_CONFIG?.platformCommission ?? 0.10);

const STORELY_CATEGORIES = [
  "إلكترونيات",
  "ألبسة",
  "إكسسوارات",
  "أحذية",
  "شنط",
  "ساعات",
  "سماعات",
  "هواتف",
  "أخرى"
];

function storelyConfig() {
  return window.ALSHAYEB_DB_CONFIG || {};
}

function storelyIsFounder(user) {
  const u = user || storelyCurrentUser();
  if (!u?.email) return false;
  const founderEmail = storelyConfig().founderEmail?.toLowerCase();
  if (u.role === "founder") return true;
  return founderEmail && u.email.toLowerCase() === founderEmail;
}

function storelyActiveStores(stores) {
  return (stores || storelyGetStores()).filter((s) => !s.banned);
}

function storelyMoney(value) {
  return `${Number(value || 0).toLocaleString("ar-SY")} ل.س`;
}

function storelyCommission(amount) {
  return Math.round(Number(amount || 0) * PLATFORM_COMMISSION());
}

function storelySellerAmount(amount) {
  return Number(amount || 0) - storelyCommission(amount);
}

function storelyMigrateData() {
  if (localStorage.getItem(STORELY_DATA_VERSION_KEY) === STORELY_DATA_VERSION) return;
  localStorage.removeItem(STORELY_STORES_KEY);
  localStorage.setItem(STORELY_DATA_VERSION_KEY, STORELY_DATA_VERSION);
}

storelyMigrateData();

let _dbMode = false;
let _storesCache = [];
let _initPromise = null;

async function storelyInit() {
  if (!_initPromise) {
    _initPromise = (async () => {
      if (!dbIsConfigured()) return;
      try {
        await dbRestoreSession();
        _storesCache = await dbFetchAllStores(true);
        _dbMode = true;
        const user = dbCurrentUser();
        if (user) localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify(user));
      } catch (err) {
        console.warn("Database unavailable, using local storage:", err.message);
        _dbMode = false;
      }
    })();
  }
  return _initPromise;
}

function storelyUsingDatabase() {
  return _dbMode;
}

async function storelyRefreshStores() {
  if (_dbMode) _storesCache = await dbFetchAllStores(true);
  return storelyGetStores();
}

function storelyGetStores(includeBanned = false) {
  const list = _dbMode ? _storesCache : (JSON.parse(localStorage.getItem(STORELY_STORES_KEY)) || []);
  const stores = Array.isArray(list) ? list : [];
  return includeBanned ? stores : stores.filter((s) => !s.banned);
}

async function storelySaveStoresAsync(stores) {
  if (_dbMode) {
    _storesCache = stores;
    await dbSaveAllStores(stores);
    return;
  }
  storelySaveStores(stores);
}

function storelySaveStores(stores) {
  if (_dbMode) {
    _storesCache = stores;
    dbSaveAllStores(stores).catch((e) => console.error(e));
    return;
  }
  localStorage.setItem(STORELY_STORES_KEY, JSON.stringify(stores));
}

function storelySlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function storelyCurrentStore() {
  const session = storelyCurrentUser();
  if (!session?.storeId) return null;
  return storelyGetStores(true).find((store) => store.id === session.storeId) || null;
}

function storelyGetUsers() {
  return JSON.parse(localStorage.getItem(STORELY_USERS_KEY)) || [];
}

function storelySaveUsers(users) {
  localStorage.setItem(STORELY_USERS_KEY, JSON.stringify(users));
}

function storelyCurrentUser() {
  if (_dbMode) return dbCurrentUser() || JSON.parse(localStorage.getItem(STORELY_SESSION_KEY));
  return JSON.parse(localStorage.getItem(STORELY_SESSION_KEY));
}

function storelyIsLoggedIn() {
  return Boolean(storelyCurrentUser()?.userId);
}

function storelyRequireProductAccess(targetUrl) {
  if (storelyIsLoggedIn()) {
    window.location.href = targetUrl;
    return true;
  }
  localStorage.setItem("storelyRedirectAfterLogin", targetUrl);
  window.location.href = "login.html";
  return false;
}

async function storelyRequireLoginAsync(redirectTo) {
  await storelyInit();
  if (storelyIsLoggedIn()) return true;
  if (redirectTo) localStorage.setItem("storelyRedirectAfterLogin", redirectTo);
  window.location.href = "login.html";
  return false;
}

function storelyRequireLogin(redirectTo) {
  if (storelyIsLoggedIn()) return true;
  if (redirectTo) localStorage.setItem("storelyRedirectAfterLogin", redirectTo);
  window.location.href = "login.html";
  return false;
}

function storelyMediaStyle(image, fallback = "assets/images/product-placeholder.svg") {
  const source = image || fallback;
  if (source.startsWith("linear-gradient")) return `background:${source}`;
  return `background-image:url('${source}');`;
}

function storelyImageFromFile(input) {
  return new Promise((resolve) => {
    const file = input.files && input.files[0];
    if (!file) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function storelyCategoryOptions(selected = "") {
  return STORELY_CATEGORIES.map((cat) =>
    `<option value="${cat}"${cat === selected ? " selected" : ""}>${cat}</option>`
  ).join("");
}

function storelyPlanLabel() {
  return "";
}

/* -------------------- سلة المشتريات -------------------- */

function storelyCartKey() {
  const user = storelyCurrentUser();
  return user?.userId ? STORELY_CART_PREFIX + user.userId : null;
}

async function storelyGetCartAsync() {
  if (_dbMode) return dbGetCart();
  return storelyGetCart();
}

async function storelySaveCartAsync(items) {
  if (_dbMode) {
    await dbSaveCart(items);
    return;
  }
  storelySaveCart(items);
}

function storelyGetCart() {
  const key = storelyCartKey();
  if (!key) return [];
  return JSON.parse(localStorage.getItem(key)) || [];
}

function storelySaveCart(items) {
  const key = storelyCartKey();
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(items));
}

async function storelyAddToCartAsync(storeId, productId) {
  const cart = await storelyGetCartAsync();
  const existing = cart.find((item) => item.storeId === storeId && item.productId === productId);
  if (existing) existing.qty += 1;
  else cart.push({ storeId, productId, qty: 1 });
  await storelySaveCartAsync(cart);
  return cart;
}

function storelyAddToCart(storeId, productId) {
  const cart = storelyGetCart();
  const existing = cart.find((item) => item.storeId === storeId && item.productId === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ storeId, productId, qty: 1 });
  }
  storelySaveCart(cart);
  return cart;
}

function storelyRemoveFromCart(storeId, productId) {
  const cart = storelyGetCart().filter((item) => !(item.storeId === storeId && item.productId === productId));
  storelySaveCart(cart);
  return cart;
}

function storelyClearCart() {
  storelySaveCart([]);
}

function storelyCartCount() {
  return storelyGetCart().reduce((sum, item) => sum + item.qty, 0);
}

function storelyUpdateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;
  badge.textContent = storelyIsLoggedIn() ? storelyCartCount() : "0";
}

async function storelyRequestAddToCartAsync(storeId, productId, returnUrl) {
  await storelyInit();
  if (!storelyIsLoggedIn()) {
    localStorage.setItem("storelyPendingCartAdd", JSON.stringify({ storeId, productId }));
    localStorage.setItem("storelyRedirectAfterLogin", returnUrl || window.location.pathname + window.location.search);
    window.location.href = "login.html";
    return false;
  }
  await storelyAddToCartAsync(storeId, productId);
  storelyUpdateCartBadge();
  if (storelyShouldShowAd()) storelyShowAdModal();
  else storelyToast("تمت إضافة المنتج إلى السلة");
  return true;
}

function storelyRequestAddToCart(storeId, productId, returnUrl) {
  if (!storelyIsLoggedIn()) {
    localStorage.setItem("storelyPendingCartAdd", JSON.stringify({ storeId, productId }));
    localStorage.setItem("storelyRedirectAfterLogin", returnUrl || window.location.pathname + window.location.search);
    window.location.href = "login.html";
    return false;
  }
  storelyAddToCart(storeId, productId);
  storelyUpdateCartBadge();
  if (storelyShouldShowAd()) {
    storelyShowAdModal();
  } else {
    storelyToast("تمت إضافة المنتج إلى السلة");
  }
  return true;
}

/* -------------------- إعلانات دورية -------------------- */

function storelyShouldShowAd() {
  const count = Number(localStorage.getItem(STORELY_AD_COUNTER_KEY) || 0) + 1;
  localStorage.setItem(STORELY_AD_COUNTER_KEY, count);
  return count % 4 === 0;
}

function storelyShowAdModal() {
  if (document.querySelector(".ad-overlay")) return;
  const overlay = document.createElement("div");
  overlay.className = "ad-overlay";
  overlay.innerHTML = `
    <div class="ad-modal">
      <span class="ad-tag">إعلان</span>
      <div class="ad-modal-img" style="background-image:url('assets/images/marketplace-hero.svg')"></div>
      <h3>Shayeb Shop</h3>
      <p>منصة متخصصة للإلكترونيات والألبسة</p>
      <div class="ad-actions">
        <button class="secondary-btn" type="button" id="storelyAdClose">متابعة</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  document.getElementById("storelyAdClose").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) overlay.remove();
  });
}

function storelyInitBrowseAd() {
  if (document.body.dataset.adInit === "1") return;
  document.body.dataset.adInit = "1";
  setTimeout(() => {
    if (storelyShouldShowAd()) storelyShowAdModal();
  }, 2200);
}

/* -------------------- إشعار سريع -------------------- */

function storelyToast(text) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1800);
}

function storelyEmptyState(title, text, btnLabel, btnHref) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">🛍️</div>
      <h3>${title}</h3>
      <p>${text}</p>
      ${btnLabel ? `<a class="primary-btn" href="${btnHref}">${btnLabel}</a>` : ""}
    </div>`;
}
