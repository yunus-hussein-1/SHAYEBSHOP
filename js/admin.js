const ORDERS_KEY = "shayebOrders";

storelyInit().then(async () => {
  await dbHandleOAuthCallback?.();

  if (!storelyIsLoggedIn()) {
    localStorage.setItem("storelyRedirectAfterLogin", "admin.html");
    window.location.href = "login.html";
    return;
  }

  if (!storelyIsFounder()) {
    document.body.innerHTML = `
      <main class="empty-page">
        <div class="empty-state">
          <h1>⛔ وصول مرفوض</h1>
          <p>هذه اللوحة للمؤسس فقط.</p>
          <a class="primary-btn" href="index.html">العودة للسوق</a>
        </div>
      </main>`;
    return;
  }

  renderAdmin();
});

async function getOrders() {
  if (storelyUsingDatabase()) return dbFetchOrders();
  return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
}

async function saveOrdersLocal(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

async function renderAdmin() {
  const stores = storelyGetStores(true);
  const orders = await getOrders();
  const products = stores.flatMap((s) => s.products || []);
  const banned = stores.filter((s) => s.banned);
  const totalCommission = orders.reduce((sum, o) => sum + Number(o.commission_syp || o.commissionSyp || 0), 0);

  document.getElementById("adminTotalStores").textContent = stores.length;
  document.getElementById("adminBannedStores").textContent = banned.length;
  document.getElementById("adminTotalProducts").textContent = products.length;
  document.getElementById("adminTotalCommission").textContent = storelyMoney(totalCommission);

  const storesList = document.getElementById("adminStoresList");
  if (!stores.length) {
    storesList.innerHTML = storelyEmptyState("لا متاجر", "لم يُنشأ أي متجر بعد.", "", "");
  } else {
    storesList.innerHTML = stores.map((store) => `
      <div class="admin-row${store.banned ? " banned" : ""}">
        <div>
          <strong>${store.storeName}</strong>
          <span style="display:block;color:var(--muted);font-size:.85rem;">${store.ownerName} · ${store.slug}${store.banned ? " · ⛔ موقوف" : ""}</span>
        </div>
        <span>${(store.products || []).length} منتج</span>
        <span>${store.sales || 0} مبيعة</span>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${store.banned
            ? `<button class="secondary-btn" onclick="unbanStore('${store.id}')">رفع الحظر</button>`
            : `<button class="danger-btn" onclick="banStore('${store.id}')">إيقاف</button>`}
          <button class="danger-btn" onclick="deleteStore('${store.id}')">حذف</button>
        </div>
      </div>
    `).join("");
  }

  const pending = orders.filter((o) => o.status === "pending");
  const ordersList = document.getElementById("adminOrdersList");
  if (!pending.length) {
    ordersList.innerHTML = `<p style="color:var(--muted);">لا طلبات معلقة.</p>`;
  } else {
    ordersList.innerHTML = pending.map((o) => `
      <div class="admin-row">
        <div>
          <strong>${o.buyer_name || o.buyerName || "زبون"}</strong>
          <span style="display:block;color:var(--muted);font-size:.82rem;">${storelyMoney(o.total_syp || o.totalSyp)}</span>
        </div>
        <button class="primary-btn" onclick="confirmOrder('${o.id}')">تأكيد</button>
        <button class="danger-btn" onclick="rejectOrder('${o.id}')">رفض</button>
      </div>
    `).join("");
  }
}

window.banStore = async (storeId) => {
  const reason = prompt("سبب الإيقاف (اختياري):") || "";
  if (storelyUsingDatabase()) await dbBanStore(storeId, true, reason);
  else {
    const stores = storelyGetStores(true).map((s) => s.id === storeId ? { ...s, banned: true, banReason: reason } : s);
    await storelySaveStoresAsync(stores);
  }
  await storelyRefreshStores();
  renderAdmin();
  storelyToast("تم إيقاف المتجر");
};

window.unbanStore = async (storeId) => {
  if (storelyUsingDatabase()) await dbBanStore(storeId, false, "");
  else {
    const stores = storelyGetStores(true).map((s) => s.id === storeId ? { ...s, banned: false, banReason: "" } : s);
    await storelySaveStoresAsync(stores);
  }
  await storelyRefreshStores();
  renderAdmin();
  storelyToast("تم رفع الحظر");
};

window.deleteStore = async (storeId) => {
  if (!confirm("حذف المتجر نهائياً؟")) return;
  if (storelyUsingDatabase()) await dbDeleteStore(storeId);
  else {
    const stores = storelyGetStores(true).filter((s) => s.id !== storeId);
    await storelySaveStoresAsync(stores);
  }
  await storelyRefreshStores();
  renderAdmin();
  storelyToast("تم حذف المتجر");
};

window.confirmOrder = async (orderId) => {
  if (storelyUsingDatabase()) await dbUpdateOrderStatus(orderId, "confirmed");
  else {
    const orders = (await getOrders()).map((o) => o.id === orderId ? { ...o, status: "confirmed" } : o);
    await saveOrdersLocal(orders);
  }
  renderAdmin();
  storelyToast("تم تأكيد الطلب");
};

window.rejectOrder = async (orderId) => {
  if (storelyUsingDatabase()) await dbUpdateOrderStatus(orderId, "rejected");
  else {
    const orders = (await getOrders()).map((o) => o.id === orderId ? { ...o, status: "rejected" } : o);
    await saveOrdersLocal(orders);
  }
  renderAdmin();
  storelyToast("تم رفض الطلب");
};
