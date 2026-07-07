const STORELY_STORES_KEY = "storelyStores";
const STORELY_SESSION_KEY = "storelySession";
const STORELY_SUBSCRIPTION_KEY = "storelySubscription";
const STORELY_USERS_KEY = "storelyUsers";
const STORELY_AD_COUNTER_KEY = "storelyAdCounter";
const STORELY_CART_PREFIX = "storelyCart_";
const STORELY_DATA_VERSION_KEY = "storelyDataVersion";
const STORELY_GUEST_CART_KEY = "storelyGuestCart";
const STORELY_DATA_VERSION = "4";
const SITE_NAME = "متجر الشايب";
const SITE_NAME_AR = "متجر الشايب";
const SITE_TAGLINE = "إلكترونيات وألبسة";
const PLATFORM_COMMISSION = () => (window.ALSHAYEB_DB_CONFIG?.platformCommission ?? 0.10);

const STORELY_CATEGORIES = [
  "إلكترونيات",
  "ألبسة نسائية",
  "ألبسة رجالية",
  "ألبسة أطفال"
];

const STORELY_PAYMENT_OPTIONS = [
  { id: "hand", label: "تسليم باليد — الدفع عند الاستلام (ل.س)" },
  { id: "sham_cash", label: "شام كاش — الدفع بالليرة السورية" }
];

const STORELY_LANG_KEY = "storelyLang";
const STORELY_FAVORITES_KEY = "storelyFavorites";
const STORELY_BROWSE_KEY = "storelyBrowseHistory";

function storelyShamCashNumber() {
  return storelyConfig().shamCashNumber || "";
}

function storelyShamCashAccountName() {
  return storelyConfig().shamCashAccountName || storelyConfig().siteNameAr || SITE_NAME_AR;
}

function storelyGetLang() {
  const lang = localStorage.getItem(STORELY_LANG_KEY) || "ar";
  return lang === "en" ? "en" : "ar";
}

function storelySetLang(lang) {
  const next = lang === "en" ? "en" : "ar";
  localStorage.setItem(STORELY_LANG_KEY, next);
  return next;
}

function storelyGetFavorites() {
  return JSON.parse(localStorage.getItem(STORELY_FAVORITES_KEY) || "[]");
}

function storelyIsFavorite(storeId, productId) {
  return storelyGetFavorites().some((item) => item.storeId === storeId && item.productId === productId);
}

function storelyToggleFavorite(storeId, productId) {
  const list = storelyGetFavorites();
  const idx = list.findIndex((item) => item.storeId === storeId && item.productId === productId);
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift({ storeId, productId, at: Date.now() });
  localStorage.setItem(STORELY_FAVORITES_KEY, JSON.stringify(list));
  return idx < 0;
}

function storelyAddBrowseHistory(storeId, productId) {
  const list = JSON.parse(localStorage.getItem(STORELY_BROWSE_KEY) || "[]")
    .filter((item) => !(item.storeId === storeId && item.productId === productId));
  list.unshift({ storeId, productId, at: Date.now() });
  localStorage.setItem(STORELY_BROWSE_KEY, JSON.stringify(list.slice(0, 30)));
}

function storelyGetBrowseHistory() {
  return JSON.parse(localStorage.getItem(STORELY_BROWSE_KEY) || "[]");
}

function storelyAllProductsFlat() {
  return storelyActiveStores().flatMap((store) =>
    (store.products || []).map((product) => ({
      ...product,
      storeId: store.id,
      storeName: store.storeName,
      storeSlug: store.slug
    }))
  );
}

function storelyResolveProducts(entries) {
  const products = storelyAllProductsFlat();
  return entries.map((entry) => {
    const product = products.find((p) => p.storeId === entry.storeId && p.id === entry.productId);
    return product ? { ...entry, product } : null;
  }).filter(Boolean);
}

function storelyConfig() {
  return window.APP_CONFIG || window.ALSHAYEB_DB_CONFIG || {};
}

function storelyIsFounder(user) {
  const u = user || storelyCurrentUser();
  if (!u?.email) return false;
  const founderEmail = storelyConfig().founderEmail?.toLowerCase();
  if (u.role === "founder") return true;
  return founderEmail && u.email.toLowerCase() === founderEmail;
}

function storelyUserRole(user) {
  const u = user || storelyCurrentUser();
  if (!u) return null;
  if (storelyIsFounder(u)) return "founder";
  if (u.storeId) return "seller";
  return u.role || "buyer";
}

function storelyIsSeller(user) {
  return storelyUserRole(user) === "seller";
}

function storelyIsBuyer(user) {
  const role = storelyUserRole(user);
  return role === "buyer";
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

function storelySeedDemoStores() {
  const demo = [
    {
      id: "demo-electronics",
      userId: "demo",
      slug: "tech-syria",
      ownerName: "متجر الشايب",
      storeName: "تك سوريا",
      tagline: "إلكترونيات بأسعار منافسة",
      storeLocation: "دمشق",
      location: "دمشق",
      logo: "ت",
      banner: "assets/images/store-banner.svg",
      rating: 4.8, sales: 120, revenue: 0, reviews: [],
      banned: false, agreedCommission: true, status: "active",
      products: [
        { id: "p1", title: "سماعات بلوتوث", price: 85000, category: "إلكترونيات", featured: true, sales: 45, image: "assets/images/product-electronics.svg" },
        { id: "p2", title: "شاحن سريع 65W", price: 42000, category: "إلكترونيات", featured: false, sales: 30, image: "assets/images/product-electronics.svg" }
      ]
    },
    {
      id: "demo-fashion",
      userId: "demo",
      slug: "style-shop",
      ownerName: "متجر الشايب",
      storeName: "ستايل شوب",
      tagline: "ألبسة عصرية للجميع",
      storeLocation: "حلب",
      location: "حلب",
      logo: "س",
      banner: "assets/images/store-banner.svg",
      rating: 4.6, sales: 80, revenue: 0, reviews: [],
      banned: false, agreedCommission: true, status: "active",
      products: [
        { id: "p3", title: "فستان صيفي", price: 95000, category: "ألبسة نسائية", featured: true, sales: 20, image: "assets/images/product-placeholder.svg" },
        { id: "p4", title: "قميص رجالي", price: 55000, category: "ألبسة رجالية", featured: false, sales: 15, image: "assets/images/product-placeholder.svg" },
        { id: "p5", title: "طقم أطفال", price: 38000, category: "ألبسة أطفال", featured: false, sales: 10, image: "assets/images/product-placeholder.svg" }
      ]
    }
  ];
  localStorage.setItem(STORELY_STORES_KEY, JSON.stringify(demo));
  return demo;
}

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
  let list = _dbMode ? _storesCache : (JSON.parse(localStorage.getItem(STORELY_STORES_KEY)) || []);
  if (!_dbMode && (!list || !list.length)) list = storelySeedDemoStores();
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
  const local = JSON.parse(localStorage.getItem(STORELY_SESSION_KEY) || "null");
  if (_dbMode) {
    return dbCurrentUser() || local;
  }
  return local;
}

function storelyIsLoggedIn() {
  const user = storelyCurrentUser();
  return Boolean(user?.userId);
}

function storelyLogout() {
  localStorage.removeItem(STORELY_SESSION_KEY);
  if (typeof dbSignOut === "function") dbSignOut().catch(() => {});
}

function storelyRequireProductAccess(targetUrl) {
  window.location.href = targetUrl;
  return true;
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
  return user?.userId ? STORELY_CART_PREFIX + user.userId : STORELY_GUEST_CART_KEY;
}

async function storelyMergeGuestCartOnLogin() {
  const guest = JSON.parse(localStorage.getItem(STORELY_GUEST_CART_KEY) || "[]");
  if (!guest.length || !storelyIsLoggedIn()) return;
  const userCart = _dbMode && storelyIsLoggedIn()
    ? await dbGetCart()
    : JSON.parse(localStorage.getItem(STORELY_CART_PREFIX + storelyCurrentUser().userId) || "[]");
  guest.forEach((item) => {
    const existing = userCart.find((i) => i.storeId === item.storeId && i.productId === item.productId);
    if (existing) existing.qty += item.qty;
    else userCart.push(item);
  });
  await storelySaveCartAsync(userCart);
  localStorage.removeItem(STORELY_GUEST_CART_KEY);
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

async function storelyGetCartAsync() {
  if (_dbMode && storelyIsLoggedIn()) return dbGetCart();
  return storelyGetCart();
}

async function storelySaveCartAsync(items) {
  if (_dbMode && storelyIsLoggedIn()) {
    await dbSaveCart(items);
    return;
  }
  if (!storelyIsLoggedIn()) {
    localStorage.setItem(STORELY_GUEST_CART_KEY, JSON.stringify(items));
    return;
  }
  storelySaveCart(items);
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
  const count = storelyCartCount();
  document.querySelectorAll(".topbar-cart").forEach((el) => {
    let badge = el.querySelector(".badge");
    if (count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "badge";
        el.appendChild(badge);
      }
      badge.textContent = count;
    } else if (badge) badge.remove();
  });
}

async function storelyRequestAddToCartAsync(storeId, productId, returnUrl) {
  await storelyInit();
  await storelyAddToCartAsync(storeId, productId);
  storelyUpdateCartBadge();
  if (storelyIsLoggedIn()) {
    storelyToast("تمت الإضافة للسلة");
  } else {
    storelyToast("تمت الإضافة — سجّل دخولك لإتمام الشراء");
  }
  return true;
}

function storelyRequestAddToCart(storeId, productId) {
  storelyAddToCart(storeId, productId);
  storelyUpdateCartBadge();
  storelyToast(storelyIsLoggedIn() ? "تمت الإضافة للسلة" : "تمت الإضافة — سجّل دخولك لإتمام الشراء");
  return true;
}

function storelyGetStoreOrders(storeId) {
  const orders = JSON.parse(localStorage.getItem("shayebOrders") || "[]");
  return orders.filter((o) => o.storeId === storeId);
}

async function storelyUpdateOrderDelivery(orderId, sellerDeliverySlot) {
  const orders = JSON.parse(localStorage.getItem("shayebOrders") || "[]");
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) throw new Error("الطلب غير موجود.");
  orders[idx].sellerDeliverySlot = sellerDeliverySlot;
  orders[idx].status = "scheduled";
  localStorage.setItem("shayebOrders", JSON.stringify(orders));
  return orders[idx];
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
      <h3>متجر الشايب</h3>
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

/* -------------------- البروفايل -------------------- */

function storelyValidateSyrianPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return true;
  if (digits.startsWith("9639") && digits.length === 12) return true;
  if (digits.startsWith("09") && digits.length === 10) return true;
  if (digits.startsWith("9") && digits.length === 9) return true;
  return false;
}

function storelyNormalizeSyrianPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("9639")) return "0" + digits.slice(3);
  if (digits.startsWith("09")) return digits;
  if (digits.startsWith("9") && digits.length === 9) return "0" + digits;
  return digits;
}

function storelySyncSession(updates) {
  const session = { ...storelyCurrentUser(), ...updates };
  localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify(session));
  return session;
}

async function storelyUpdateProfile(updates = {}) {
  await storelyInit();
  const user = storelyCurrentUser();
  if (!user?.userId) throw new Error("يجب تسجيل الدخول أولاً.");

  const {
    name, phone, avatar, location, deliveryAddress, deliveryTime, paymentMethod,
    currentPassword, newPassword
  } = updates;

  if (phone && !storelyValidateSyrianPhone(phone)) {
    throw new Error("رقم سوري غير صالح. مثال: 09xxxxxxxx");
  }
  const normalizedPhone = phone !== undefined ? storelyNormalizeSyrianPhone(phone) : undefined;

  if (storelyUsingDatabase()) {
    await dbUpdateProfile({
      name: name !== undefined ? name : user.name,
      phone: normalizedPhone !== undefined ? normalizedPhone : user.phone,
      avatar: avatar !== undefined ? avatar : user.avatar,
      location: location !== undefined ? location : user.location,
      deliveryAddress: deliveryAddress !== undefined ? deliveryAddress : user.deliveryAddress,
      deliveryTime: deliveryTime !== undefined ? deliveryTime : user.deliveryTime,
      paymentMethod: paymentMethod !== undefined ? paymentMethod : user.paymentMethod,
      newPassword
    });
    const refreshed = dbCurrentUser();
    if (refreshed) localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify(refreshed));
    return refreshed;
  }

  const users = storelyGetUsers();
  const index = users.findIndex((item) => item.id === user.userId);
  if (index === -1) throw new Error("المستخدم غير موجود.");

  if (newPassword) {
    if (!currentPassword) throw new Error("أدخل كلمة المرور الحالية.");
    if (users[index].password !== currentPassword) {
      throw new Error("كلمة المرور الحالية غير صحيحة.");
    }
    users[index].password = newPassword;
  }

  const fields = {
    name, phone: normalizedPhone, avatar, location, deliveryAddress, deliveryTime, paymentMethod
  };
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined) users[index][key] = value;
  });
  storelySaveUsers(users);

  return storelySyncSession({
    name: users[index].name,
    phone: users[index].phone || "",
    avatar: users[index].avatar || "",
    location: users[index].location || "",
    deliveryAddress: users[index].deliveryAddress || "",
    deliveryTime: users[index].deliveryTime || "",
    paymentMethod: users[index].paymentMethod || ""
  });
}

/* -------------------- تقييمات المنتجات -------------------- */

async function storelySubmitReview(storeId, productId, rating, comment) {
  await storelyInit();
  const user = storelyCurrentUser();
  if (!user?.userId) throw new Error("سجّل دخولك لإرسال تقييم.");

  const stores = storelyGetStores(true);
  const storeIndex = stores.findIndex((s) => s.id === storeId);
  if (storeIndex === -1) throw new Error("المتجر غير موجود.");

  const store = stores[storeIndex];
  const product = (store.products || []).find((p) => p.id === productId);
  if (!product) throw new Error("المنتج غير موجود.");

  const review = {
    id: "review-" + Date.now(),
    userId: user.userId,
    userName: user.name || "مشتري",
    productId,
    productTitle: product.title,
    rating: Number(rating),
    comment: String(comment || "").trim(),
    createdAt: new Date().toISOString()
  };

  if (!review.rating || review.rating < 1 || review.rating > 5) {
    throw new Error("اختر تقييم من 1 إلى 5.");
  }

  store.reviews = store.reviews || [];
  const existing = store.reviews.findIndex((r) => r.userId === user.userId && r.productId === productId);
  if (existing >= 0) store.reviews[existing] = review;
  else store.reviews.unshift(review);

  const ratings = store.reviews.map((r) => r.rating).filter(Boolean);
  store.rating = ratings.length
    ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
    : store.rating;

  stores[storeIndex] = store;
  await storelySaveStoresAsync(stores);
  return review;
}

function storelyStoreReviews(storeId) {
  const store = storelyGetStores(true).find((s) => s.id === storeId);
  return store?.reviews || [];
}
