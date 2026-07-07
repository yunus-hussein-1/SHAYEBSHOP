storelyInit().then(() => {
  storelyApplyLang();
  let activeTab = "all";

  const tabs = [
    { id: "all", label: storelyT("all") },
    { id: "orders", label: storelyT("myOrders") },
    { id: "coupons", label: storelyT("myCoupons") },
    { id: "campaigns", label: storelyT("campaigns") }
  ];

  const NOTIFY_DATA = [
    { titleKey: "notifyOffer", bodyKey: "notifyOfferBody", date: "07/07/2026", type: "campaigns" },
    { titleKey: "notifyOrder", bodyKey: "notifyOrderBody", date: "06/07/2026", type: "orders" },
    { titleKey: "notifyCoupon", bodyKey: "notifyCouponBody", date: "05/07/2026", type: "coupons" },
    { titleKey: "notifyDelivery", bodyKey: "notifyDeliveryBody", date: "04/07/2026", type: "all" }
  ];

  document.title = `${storelyT("notifications")} | ${storelySiteName()}`;
  document.getElementById("pageTitle").textContent = storelyT("notifications");
  document.getElementById("notifyBanner").innerHTML = `
    <p>${storelyT("enableNotify")}</p>
    <button class="primary-btn" type="button">${storelyT("enableBtn")}</button>`;

  function renderTabs() {
    document.getElementById("notifyTabs").innerHTML = tabs.map((tab) =>
      `<button type="button" class="notify-tab${activeTab === tab.id ? " active" : ""}" data-tab="${tab.id}">${tab.label}</button>`
    ).join("");
  }

  function renderList() {
    const items = NOTIFY_DATA.filter((item) => activeTab === "all" || item.type === activeTab);
    document.getElementById("notifyList").innerHTML = items.map((item) => `
      <article class="notify-item app-card">
        <span class="notify-icon">🔔</span>
        <div>
          <strong>${storelyT(item.titleKey)}</strong>
          <p>${storelyT(item.bodyKey)}</p>
          <small>${item.date}</small>
        </div>
      </article>
    `).join("");
  }

  renderTabs();
  renderList();

  document.getElementById("notifyTabs").addEventListener("click", (e) => {
    const tab = e.target.closest(".notify-tab");
    if (!tab) return;
    activeTab = tab.dataset.tab;
    renderTabs();
    renderList();
  });
});
