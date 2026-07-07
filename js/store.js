storelyInit().then(() => {
  const app = document.getElementById("storeApp");
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const stores = storelyActiveStores();
  const store = slug ? stores.find((item) => item.slug === slug) : null;

  if (!store) {
    app.innerHTML = `
      <main class="empty-page"><div class="empty-state"><h1>المتجر غير موجود</h1><a class="primary-btn" href="index.html">العودة</a></div></main>
    `;
  } else {
    renderStore(app, store);
    const hash = location.hash.replace("#", "");
    if (hash) setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" }), 300);
  }

  storelyUpdateCartBadge();
});

function renderStore(app, store) {
  document.title = `${store.storeName} | متجر الشايب`;
  const products = store.products || [];
  const loggedIn = storelyIsLoggedIn();
  const user = storelyCurrentUser();
  const reviews = store.reviews || [];

  app.innerHTML = `
    <main class="public-store">
      <section class="store-hero">
        <div class="store-cover" style="${storelyMediaStyle(store.banner, "assets/images/store-banner.svg")}"></div>
        <div class="store-profile">
          <div class="store-avatar large">${store.logo || store.storeName.charAt(0)}</div>
          <div>
            <h1>${store.storeName}</h1>
            <p>${store.tagline}</p>
            <small>التقييم العام: ${store.rating || 5} ★</small>
          </div>
        </div>
      </section>

      <section id="products" class="section-band">
        <h2>المنتجات</h2>
        <div class="product-grid" style="margin-top:20px;">
          ${products.map((product) => {
            const myReview = reviews.find((r) => r.userId === user?.userId && r.productId === product.id);
            return `
            <article class="product-card" id="${product.id}">
              <div class="product-image" style="${storelyMediaStyle(product.image, "assets/images/product-electronics.svg")}"></div>
              <span>${product.category}</span>
              <h3>${product.title}</h3>
              <div class="product-footer">
                <strong>${storelyMoney(product.price)}</strong>
                <button class="primary-btn" onclick="addToCart('${store.id}','${product.id}')">أضف للسلة</button>
              </div>
              ${loggedIn && user?.storeId !== store.id ? `
                <div class="review-form-box" id="reviewBox-${product.id}">
                  <strong>تقييمي ورأيي</strong>
                  ${myReview ? `<p class="review-rating">تقييمك: ${"★".repeat(myReview.rating)}${"☆".repeat(5 - myReview.rating)}</p><p>${myReview.comment || ""}</p>` : ""}
                  <div class="review-stars" data-product="${product.id}">
                    ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}" class="${myReview?.rating === n ? "active" : ""}">${n}</button>`).join("")}
                  </div>
                  <textarea id="reviewComment-${product.id}" rows="2" placeholder="رأيي عن المنتج..." style="margin-top:10px;width:100%;">${myReview?.comment || ""}</textarea>
                  <button class="secondary-btn" style="margin-top:8px;" onclick="submitReview('${store.id}','${product.id}')">إرسال التقييم</button>
                  <p id="reviewMsg-${product.id}" class="form-message"></p>
                </div>` : ""}
            </article>`;
          }).join("") || storelyEmptyState("لا منتجات", "", "", "")}
        </div>
      </section>
      ${loggedIn ? "" : `
      <section class="login-prompt-band" style="padding-top:32px;">
        <div class="login-prompt-card">
          <div>
            <h2>لإتمام الشراء</h2>
            <p>يمكنك إضافة المنتجات للسلة، لكن الدفع يتطلب تسجيل الدخول.</p>
          </div>
          <a class="primary-btn large" href="login.html">تسجيل الدخول</a>
        </div>
      </section>`}
    </main>
  `;

  products.forEach((product) => {
    const box = document.getElementById(`reviewBox-${product.id}`);
    if (!box) return;
    box.querySelectorAll("[data-star]").forEach((btn) => {
      btn.addEventListener("click", () => {
        box.querySelectorAll("[data-star]").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        box.dataset.selectedRating = btn.dataset.star;
      });
    });
    const existing = reviews.find((r) => r.userId === user?.userId && r.productId === product.id);
    if (existing) box.dataset.selectedRating = String(existing.rating);
  });
}

async function addToCart(storeId, productId) {
  await storelyRequestAddToCartAsync(storeId, productId, location.href);
}

async function submitReview(storeId, productId) {
  const box = document.getElementById(`reviewBox-${productId}`);
  const msg = document.getElementById(`reviewMsg-${productId}`);
  const rating = Number(box?.dataset.selectedRating || box?.querySelector("[data-star].active")?.dataset.star);
  const comment = document.getElementById(`reviewComment-${productId}`)?.value || "";

  try {
    await storelySubmitReview(storeId, productId, rating, comment);
    msg.textContent = "تم إرسال تقييمك.";
    msg.dataset.type = "success";
    storelyToast(typeof storelyT === "function" ? storelyT("thanksReview") : "شكراً على تقييمك!");
  } catch (err) {
    msg.textContent = err.message || "تعذر الإرسال";
    msg.dataset.type = "error";
  }
}

window.submitReview = submitReview;
