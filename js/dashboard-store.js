const BUYER_ORDERS_KEY = "shayebOrders";

storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("dashboard.html"))) return;

  const user = storelyCurrentUser();
  const store = storelyCurrentStore();

  if (!store) {
    renderBuyerDashboard(user);
    return;
  }

  document.getElementById("buyerDashboard").style.display = "none";
  document.getElementById("sellerDashboard").style.display = "block";
  renderSellerDashboard(store);
});

function renderBuyerDashboard(user) {
  document.getElementById("buyerDashboard").style.display = "block";
  document.getElementById("sellerDashboard").style.display = "none";

  document.getElementById("buyerTitle").textContent = `مرحباً، ${user.name || "مشتري"}`;
  document.getElementById("buyerSubtitle").textContent = user.email || "";

  const cart = storelyGetCart();
  document.getElementById("buyerCartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);

  const orders = getBuyerOrders(user.userId);
  document.getElementById("buyerOrdersCount").textContent = orders.length;

  const ordersList = document.getElementById("buyerOrdersList");
  if (!orders.length) {
    ordersList.innerHTML = storelyEmptyState("لا طلبات", "لم تُرسل أي طلب بعد.", "", "");
    return;
  }

  ordersList.innerHTML = orders.slice(0, 5).map((order) => `
    <div class="product-row">
      <div>
        <strong>${order.items?.map((i) => i.title).join("، ") || "طلب"}</strong>
        <span>${orderStatusLabel(order.status)}</span>
      </div>
      <b>${storelyMoney(order.totalSyp || order.total_syp || 0)}</b>
    </div>
  `).join("");
}

function getBuyerOrders(userId) {
  const orders = JSON.parse(localStorage.getItem(BUYER_ORDERS_KEY) || "[]");
  return orders.filter((order) => order.userId === userId);
}

function orderStatusLabel(status) {
  if (status === "confirmed") return "مؤكد";
  if (status === "rejected") return "مرفوض";
  if (status === "scheduled") return "موعد محدد";
  return "قيد المراجعة";
}

function renderSellerDashboard(store) {
  document.getElementById("newProductCategory").innerHTML = storelyCategoryOptions("إلكترونيات");

  async function persistStore() {
    const stores = storelyGetStores(true).map((item) => item.id === store.id ? store : item);
    await storelySaveStoresAsync(stores);
  }

  function renderDashboard() {
    const products = store.products || [];
    document.getElementById("dashboardTitle").textContent = store.storeName;
    document.getElementById("dashboardSubtitle").textContent = store.tagline;
    document.getElementById("totalProducts").textContent = products.length;
    document.getElementById("totalSales").textContent = products.reduce((s, p) => s + (p.sales || 0), 0);
    document.getElementById("totalRevenue").textContent = storelyMoney(products.reduce((s, p) => s + (p.sales || 0) * Number(p.price || 0), 0));
    document.getElementById("openStoreBtn").href = `store.html?slug=${store.slug}`;

    const list = document.getElementById("productsList");
    if (!products.length) {
      list.innerHTML = storelyEmptyState("لا منتجات", "", "", "");
      return;
    }
    list.innerHTML = products.map((product) => `
      <div class="product-row">
        <div>
          <div class="row-product-image" style="${storelyMediaStyle(product.image, "assets/images/product-electronics.svg")}"></div>
          <strong>${product.title}</strong>
          <span>${product.category}</span>
        </div>
        <b>${storelyMoney(product.price)}</b>
        <button class="danger-btn" onclick="deleteProduct('${product.id}')">حذف</button>
      </div>
    `).join("");

    renderSellerReviews(store);
    renderSellerOrders(store);
  }

  function renderSellerOrders(storeData) {
    const list = document.getElementById("sellerOrdersList");
    if (!list) return;
    const orders = storelyGetStoreOrders(storeData.id);
    if (!orders.length) {
      list.innerHTML = storelyEmptyState("لا طلبات", "ستظهر هنا طلبات المشترين مع موقعهم.", "", "");
      return;
    }
    list.innerHTML = orders.map((order) => `
      <div class="review-card order-card">
        <div class="review-card-head">
          <strong>${order.buyerName || "مشتري"}</strong>
          <span>${storelyMoney(order.totalSyp || 0)}</span>
        </div>
        <p><b>الموقع:</b> ${order.buyerLocation || order.buyerAddress || "—"}</p>
        <p><b>موعد مطلوب:</b> ${order.deliveryTime || "—"}</p>
        <p><b>الدفع:</b> ${order.paymentMethod || "—"}</p>
        <p><b>المنتجات:</b> ${(order.items || []).map((i) => i.title).join("، ")}</p>
        <div class="order-schedule-row">
          <input type="text" id="slot-${order.id}" placeholder="موعد التسليم (مثال: غداً 3-5)" value="${order.sellerDeliverySlot || ""}">
          <button class="primary-btn" type="button" onclick="saveDeliverySlot('${order.id}')">تأكيد الموعد</button>
        </div>
        <small>الحالة: ${orderStatusLabel(order.status)}</small>
      </div>
    `).join("");
  }

  window.saveDeliverySlot = async (orderId) => {
    const slot = document.getElementById(`slot-${orderId}`)?.value.trim();
    if (!slot) { alert("أدخل موعد التسليم."); return; }
    await storelyUpdateOrderDelivery(orderId, slot);
    storelyToast("تم تحديد موعد التسليم");
    renderSellerOrders(store);
  };

  function renderSellerReviews(storeData) {
    const list = document.getElementById("sellerReviewsList");
    if (!list) return;
    const reviews = storeData.reviews || [];
    if (!reviews.length) {
      list.innerHTML = storelyEmptyState("لا آراء بعد", "سيظهر هنا تقييم المشترين ورأيهم عن المنتجات.", "", "");
      return;
    }
    list.innerHTML = reviews.map((review) => `
      <div class="review-card">
        <div class="review-card-head">
          <strong>${review.userName || "مشتري"}</strong>
          <span class="review-rating">${"★".repeat(review.rating || 0)}${"☆".repeat(5 - (review.rating || 0))}</span>
        </div>
        <span style="color:var(--muted);font-size:.88rem;">${review.productTitle || "منتج"}</span>
        <p style="margin-top:8px;">${review.comment || "—"}</p>
      </div>
    `).join("");
  }

  document.getElementById("productForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const upload = await storelyImageFromFile(document.getElementById("newProductImageFile"));
    store.products.unshift({
      id: "product-" + Date.now(),
      title: document.getElementById("newProductTitle").value.trim(),
      price: Number(document.getElementById("newProductPrice").value),
      category: document.getElementById("newProductCategory").value,
      featured: false, sales: 0,
      image: upload || document.getElementById("newProductImageUrl").value.trim() || "assets/images/product-electronics.svg"
    });
    await persistStore();
    event.target.reset();
    renderDashboard();
  });

  window.deleteProduct = async (id) => {
    if (!confirm("حذف؟")) return;
    store.products = store.products.filter((p) => p.id !== id);
    if (storelyUsingDatabase()) await dbDeleteProduct(id);
    await persistStore();
    renderDashboard();
  };

  renderDashboard();
}
