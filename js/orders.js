storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("orders.html"))) return;
  storelyApplyLang();
  const t = (k) => storelyT(k);
  document.title = `${t("myPurchases")} | ${storelySiteName()}`;

  ["ordersPageTitle", "mobileOrdersTitle"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t("myPurchases");
  });
  ["newOrdersTitle", "mobileNewTitle"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t("newOrders");
  });
  ["pastOrdersTitle", "mobilePastTitle"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = t("pastOrders");
  });

  if (typeof desktopMountAccountSidebar === "function") {
    desktopMountAccountSidebar("desktopAccountSidebar", "orders");
  }

  const orders = storelyGetUserOrders();
  const isNew = (o) => !o.status || o.status === "pending" || o.status === "scheduled";
  const newOrders = orders.filter(isNew);
  const pastOrders = orders.filter((o) => !isNew(o));

  function orderCard(order) {
    const rating = storelyGetOrderRating(order.id);
    const items = (order.items || []).map((i) => i.title).join("، ") || "—";
    return `
      <article class="order-card app-card">
        <div class="order-card-head">
          <strong>${items}</strong>
          <span>${storelyMoney(order.totalSyp || 0)}</span>
        </div>
        <p>${order.deliveryTime || ""}</p>
        <p>${order.paymentMethod || t("shamCash")}</p>
        ${rating ? `<p>★ ${rating.rating}/5 — ${rating.comment || ""}</p>` : `
          <form class="rate-form" data-order="${order.id}">
            <label>${t("rateOrder")}
              <select name="rating" required>
                <option value="">—</option>
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </label>
            <input name="comment" type="text" placeholder="${t("productComment")}">
            <button type="submit" class="secondary-btn">${t("update")}</button>
          </form>`}
      </article>`;
  }

  function renderList(box, list) {
    if (!box) return;
    if (!list.length) {
      box.innerHTML = `<p>${t("emptyCart")}</p>`;
      return;
    }
    box.innerHTML = list.map(orderCard).join("");
    box.querySelectorAll(".rate-form").forEach((form) => {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        storelyRateOrder(
          form.dataset.order,
          form.rating.value,
          form.comment.value
        );
        storelyToast(t("thanksReview") || "شكراً!");
        location.reload();
      });
    });
  }

  renderList(document.getElementById("newOrdersList"), newOrders);
  renderList(document.getElementById("pastOrdersList"), pastOrders);
  renderList(document.getElementById("mobileNewOrders"), newOrders);
  renderList(document.getElementById("mobilePastOrders"), pastOrders);
});
