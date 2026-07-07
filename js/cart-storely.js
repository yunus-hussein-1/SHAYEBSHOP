storelyInit().then(async () => {
  storelyApplyLang();
  const t = (k) => storelyT(k);
  document.title = `${t("cartYour")} | ${storelySiteName()}`;
  const cartStores = storelyGetStores();

  document.getElementById("cartPageTitle").textContent = t("cartYour");
  document.getElementById("cartTotalLabel").textContent = t("total");
  document.getElementById("prevTabBtn").textContent = t("previouslyAdded");
  document.getElementById("favTabBtn").textContent = t("favorites");

  async function getCartDetailed() {
    const cart = await storelyGetCartAsync();
    return cart.map((item) => {
      const store = cartStores.find((s) => s.id === item.storeId);
      const product = store?.products.find((p) => p.id === item.productId);
      return product ? { ...item, product, store } : null;
    }).filter(Boolean);
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

  async function renderCart() {
    const items = await getCartDetailed();
    const empty = document.getElementById("cartEmpty");
    const filled = document.getElementById("cartFilled");
    const container = document.getElementById("cartItems");
    const totalEl = document.getElementById("cartTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

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

    totalEl.textContent = storelyMoney(items.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0));
    checkoutBtn.textContent = storelyIsLoggedIn() ? t("payNow") : storelyT("login");
    checkoutBtn.onclick = (event) => {
      event.preventDefault();
      if (!storelyIsLoggedIn()) {
        localStorage.setItem("storelyRedirectAfterLogin", "checkout.html?plan=cart");
        window.location.href = "login.html";
        return;
      }
      window.location.href = "checkout.html?plan=cart";
    };
    renderSuggestions("history");
  }

  window.removeCartItem = async (storeId, productId) => {
    const cart = (await storelyGetCartAsync()).filter((i) => !(i.storeId === storeId && i.productId === productId));
    await storelySaveCartAsync(cart);
    storelyUpdateCartBadge();
    renderCart();
  };

  document.getElementById("prevTabBtn").addEventListener("click", () => {
    document.getElementById("prevTabBtn").classList.add("active");
    document.getElementById("favTabBtn").classList.remove("active");
    renderSuggestions("history");
  });
  document.getElementById("favTabBtn").addEventListener("click", () => {
    document.getElementById("favTabBtn").classList.add("active");
    document.getElementById("prevTabBtn").classList.remove("active");
    renderSuggestions("fav");
  });
  document.getElementById("shareCartBtn").addEventListener("click", () => {
    storelyToast(t("cartCopied"));
  });

  renderCart();
  storelyUpdateCartBadge();
});
