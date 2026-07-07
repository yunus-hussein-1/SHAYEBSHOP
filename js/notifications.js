const NOTIFY_DATA = {
  ar: [
    { title: "عرض خاص لك", body: "خصم 15% على الإلكترونيات اليوم فقط", date: "07/07/2026", type: "campaigns" },
    { title: "طلبك قيد التجهيز", body: "سيتم التواصل معك لتحديد موعد التسليم", date: "06/07/2026", type: "orders" },
    { title: "كوبون جديد", body: "استخدم كود SHAIB10 على مشترياتك القادمة", date: "05/07/2026", type: "coupons" },
    { title: "تحديث التوصيل", body: "التوصيل السريع متاح في منطقتك", date: "04/07/2026", type: "all" }
  ],
  en: [
    { title: "Special Offer", body: "15% off electronics today only", date: "07/07/2026", type: "campaigns" },
    { title: "Order Processing", body: "Seller will contact you for delivery time", date: "06/07/2026", type: "orders" },
    { title: "New Coupon", body: "Use SHAIB10 on your next purchase", date: "05/07/2026", type: "coupons" },
    { title: "Delivery Update", body: "Fast delivery is available in your area", date: "04/07/2026", type: "all" }
  ]
};

storelyInit().then(() => {
  storelyApplyLang();
  const lang = storelyGetLang();
  let activeTab = "all";

  const tabs = [
    { id: "all", ar: "الكل", en: "All" },
    { id: "orders", ar: "طلبياتي", en: "Orders" },
    { id: "coupons", ar: "كوبوناتي", en: "Coupons" },
    { id: "campaigns", ar: "الحملات", en: "Campaigns" }
  ];

  document.getElementById("pageTitle").textContent = storelyT("notifications");
  document.getElementById("notifyBanner").innerHTML = `
    <p>${lang === "en" ? "Enable notifications to get order and offer updates." : "فعّل الإشعارات لتصلك تحديثات الطلبات والعروض."}</p>
    <button class="primary-btn" type="button">${lang === "en" ? "Enable" : "تشغيل الإشعارات"}</button>`;

  function renderTabs() {
    document.getElementById("notifyTabs").innerHTML = tabs.map((tab) =>
      `<button type="button" class="notify-tab${activeTab === tab.id ? " active" : ""}" data-tab="${tab.id}">${lang === "en" ? tab.en : tab.ar}</button>`
    ).join("");
  }

  function renderList() {
    const items = NOTIFY_DATA[lang].filter((item) => activeTab === "all" || item.type === activeTab);
    document.getElementById("notifyList").innerHTML = items.map((item) => `
      <article class="notify-item app-card">
        <span class="notify-icon">🔔</span>
        <div>
          <strong>${item.title}</strong>
          <p>${item.body}</p>
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
