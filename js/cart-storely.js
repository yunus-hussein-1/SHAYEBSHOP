storelyInit().then(async () => {
  storelyApplyLang();
  const t = (k) => storelyT(k);
  document.title = `${t("myCart")} | ${storelySiteName()}`;
  const cartStores = storelyGetStores();

  document.getElementById("cartPageTitle").textContent = t("cartYour");
  document.getElementById("cartTotalLabel").textContent = t("total");
  document.getElementById("prevTabBtn").textContent = t("previouslyAdded");
  document.getElementById("favTabBtn").textContent = t("favorites");
  const desktopCartTitle = document.getElementById("desktopCartTitle");
  if (desktopCartTitle) desktopCartTitle.textContent = t("myCart");

  async function getCartDetailed() {
    const cart = await storelyGetCartAsync();
    return cart.map((item) => {
      const store = cartStores.find((s) => s.id === item.storeId);
      const product = store?.products.find((p) => p.id === item.productId);
      return product ? { ...item, product, store } : null;
    }).filter(Boolean);
  }

  function sellerRating(storeId) {
    let hash = 0;
    for (let i = 0; i < storeId.length; i++) hash += storeId.charCodeAt(i);
    return (9.2 + (hash % 8) / 10).toFixed(1);
  }

  function goCheckout(event) {
    event?.preventDefault();
    if (!storelyIsLoggedIn()) {
      localStorage.setItem("storelyRedirectAfterLogin", "checkout.html?plan=cart");
      window.location.href = "login.html";
      return;
    }
    window.location.href = "checkout.html?plan=cart";
  }

  function bindCheckoutButtons() {
    document.getElementById("checkoutBtn")?.addEventListener("click", goCheckout);
    document.getElementById("desktopCheckoutBtn")?.addEventListener("click", goCheckout);
  }

  function suggestionCard(item) {
    return `
      <article class="cart-suggest-row">
        <div class="cart-suggest-img" style="${storelyMediaStyle(item.product.image)}"></div>
        <div class="cart-suggest-body">
          <strong>${item.product.title}</strong>
          <p>${item.store.storeName}</p>
          <span class="badge-fast">${t("fastDelivery")}</span>
          <div class="cart-suggest-foot">
            <strong>${storelyMoney(item.product.price)}</strong>
            <button type="button" class="secondary-btn" data-add="${item.storeId}:${item.productId}">${t("addToCart")}</button>
          </div>
        </div>
      </article>`;
  }

  async function renderSuggestions(mode = "history") {
    const box = document.getElementById("cartSuggestions");
    if (!box) return;
    let entries = mode === "fav" ? storelyGetFavorites() : storelyGetBrowseHistory();
    let items = storelyResolveProducts(entries).map((entry) => ({
      ...entry,
      store: cartStores.find((s) => s.id === entry.storeId)
    })).filter((i) => i.store);

    if (!items.length) {
      items = storelyAllProductsFlat().slice(0, 3).map((product) => ({
        product,
        store: cartStores.find((s) => s.id === product.storeId),
        storeId: product.storeId,
        productId: product.id
      }));
    }

    box.innerHTML = items.map(suggestionCard).join("");
    box.querySelectorAll("[data-add]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const [storeId, productId] = btn.dataset.add.split(":");
        await storelyRequestAddToCartAsync(storeId, productId);
        renderCart();
      });
    });
  }

  function desktopCartItemRow(item) {
    return `
      <div class="desktop-cart-item" data-store="${item.storeId}" data-product="${item.productId}">
        <input type="checkbox" checked aria-label="select">
        <div class="thumb" style="${storelyMediaStyle(item.product.image)}"></div>
        <div>
          <strong>${item.product.title}</strong>
          <p style="font-size:.82rem;margin-top:4px">${item.store.storeName}</p>
          <span class="badge-fast">${t("fastDelivery")}</span>
        </div>
        <div class="desktop-qty-pill">
          <button type="button" data-qty-minus="${item.storeId}:${item.productId}">−</button>
          <span>${item.qty}</span>
          <button type="button" data-qty-plus="${item.storeId}:${item.productId}">+</button>
        </div>
        <div style="text-align:end">
          <strong>${storelyMoney(item.product.price * item.qty)}</strong>
          <button type="button" class="icon-plain-btn" data-remove="${item.storeId}:${item.productId}" style="display:block;margin-top:6px">🗑️</button>
        </div>
      </div>`;
  }

  function renderDesktopCart(items, total) {
    const empty = document.getElementById("desktopCartEmpty");
    const sellers = document.getElementById("desktopCartSellers");
    const summary = document.getElementById("desktopCartSummary");
    if (!sellers || !summary) return;

    if (!items.length) {
      empty.hidden = false;
      sellers.innerHTML = "";
      empty.innerHTML = `<p>${t("emptyCart")}</p><a class="primary-btn" href="index.html">${t("continueShopping")}</a>`;
      summary.innerHTML = desktopSummaryHtml({
        subtotal: storelyMoney(0),
        shipping: storelyMoney(0),
        total: storelyMoney(0),
        btnText: t("continueShopping"),
        btnId: "desktopCheckoutBtn",
        btnDisabled: true
      });
      return;
    }

    empty.hidden = true;
    const groups = {};
    items.forEach((item) => {
      if (!groups[item.storeId]) groups[item.storeId] = { store: item.store, items: [] };
      groups[item.storeId].items.push(item);
    });

    sellers.innerHTML = Object.values(groups).map(({ store, items: groupItems }) => `
      <div class="desktop-cart-seller">
        <div class="desktop-cart-seller-head">
          <input type="checkbox" checked>
          <span class="rating-badge">${sellerRating(store.id)}</span>
          <strong>${store.storeName}</strong>
          <span>›</span>
        </div>
        ${groupItems.map(desktopCartItemRow).join("")}
      </div>
    `).join("");

    summary.innerHTML = desktopSummaryHtml({
      title: t("cartSummary"),
      subtotal: storelyMoney(total),
      shipping: storelyMoney(59.99),
      total: storelyMoney(total),
      btnText: storelyIsLoggedIn() ? t("confirmCart") : t("login"),
      btnId: "desktopCheckoutBtn"
    });

    sellers.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const [storeId, productId] = btn.dataset.remove.split(":");
        await removeCartItem(storeId, productId);
      });
    });
    sellers.querySelectorAll("[data-qty-plus]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const [storeId, productId] = btn.dataset.qtyPlus.split(":");
        await updateQty(storeId, productId, 1);
      });
    });
    sellers.querySelectorAll("[data-qty-minus]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const [storeId, productId] = btn.dataset.qtyMinus.split(":");
        await updateQty(storeId, productId, -1);
      });
    });
    bindCheckoutButtons();
  }

  async function updateQty(storeId, productId, delta) {
    const cart = await storelyGetCartAsync();
    const item = cart.find((i) => i.storeId === storeId && i.productId === productId);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    await storelySaveCartAsync(cart);
    storelyUpdateCartBadge();
    renderCart();
  }

  async function renderCart() {
    const items = await getCartDetailed();
    const total = items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0);
    const empty = document.getElementById("cartEmpty");
    const filled = document.getElementById("cartFilled");
    const container = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    renderDesktopCart(items, total);

    if (!items.length) {
      empty.hidden = false;
      filled.hidden = true;
      empty.innerHTML = `
        <div class="cart-empty-icon">🛍️</div>
        <p>${t("emptyCart")}</p>
        <a class="primary-btn full" href="index.html">${t("continueShopping")}</a>`;
      renderSuggestions("history");
      return;
    }

    empty.hidden = true;
    filled.hidden = false;
    container.innerHTML = items.map((item) => `
      <article class="cart-item-row app-card">
        <div class="cart-item-img" style="${storelyMediaStyle(item.product.image)}"></div>
        <div class="cart-item-body">
          <strong>${item.product.title}</strong>
          <p>${item.store.storeName}</p>
          <span class="badge-fast">${t("fastDelivery")}</span>
          <div class="cart-item-foot">
            <strong>${storelyMoney(item.product.price)}</strong>
            <span>× ${item.qty}</span>
            <button class="danger-btn" onclick="removeCartItem('${item.storeId}','${item.productId}')">${t("remove")}</button>
          </div>
        </div>
      </article>
    `).join("");

    totalEl.textContent = storelyMoney(total);
    if (checkoutBtn) {
      checkoutBtn.textContent = storelyIsLoggedIn() ? t("payNow") : storelyT("login");
      checkoutBtn.onclick = goCheckout;
    }
    renderSuggestions("history");
  }

  window.removeCartItem = async (storeId, productId) => {
    const cart = (await storelyGetCartAsync()).filter((i) => !(i.storeId === storeId && i.productId === productId));
    await storelySaveCartAsync(cart);
    storelyUpdateCartBadge();
    renderCart();
  };

  document.getElementById("prevTabBtn")?.addEventListener("click", () => {
    document.getElementById("prevTabBtn").classList.add("active");
    document.getElementById("favTabBtn").classList.remove("active");
    renderSuggestions("history");
  });
  document.getElementById("favTabBtn")?.addEventListener("click", () => {
    document.getElementById("favTabBtn").classList.add("active");
    document.getElementById("prevTabBtn").classList.remove("active");
    renderSuggestions("fav");
  });
  document.getElementById("shareCartBtn")?.addEventListener("click", () => {
    storelyToast(t("cartCopied"));
  });

  bindCheckoutButtons();
  renderCart();
  storelyUpdateCartBadge();
});
