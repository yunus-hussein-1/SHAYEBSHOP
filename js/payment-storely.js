const ORDERS_KEY = "shayebOrders";

storelyInit().then(async () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("plan") !== "cart") {
    window.location.href = "cart.html";
    return;
  }

  if (!(await storelyRequireLoginAsync("checkout.html?plan=cart"))) return;

  let stores = storelyGetStores(true);
  let cartItems = (await storelyGetCartAsync()).map((item) => {
    const itemStore = stores.find((s) => s.id === item.storeId);
    const product = itemStore?.products.find((p) => p.id === item.productId);
    return product ? { ...item, product, store: itemStore } : null;
  }).filter(Boolean);

  const total = cartItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0);
  const user = storelyCurrentUser();

  document.getElementById("selectedPlan").innerHTML = `
    <span>الإجمالي</span>
    <strong>${storelyMoney(total)}</strong>
    ${cartItems.map((item) => `<p>${item.product.title} × ${item.qty}</p>`).join("")}
  `;

  if (user?.name) document.getElementById("payerName").value = user.name;

  document.getElementById("paymentForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const order = {
      id: "order-" + Date.now(),
      userId: user?.userId,
      storeId: cartItems[0]?.storeId || null,
      items: cartItems.map((i) => ({ title: i.product.title, qty: i.qty, price: i.product.price })),
      totalSyp: total,
      commissionSyp: storelyCommission(total),
      sellerAmountSyp: storelySellerAmount(total),
      buyerName: document.getElementById("payerName").value.trim(),
      buyerPhone: document.getElementById("payerPhone").value.trim(),
      buyerAddress: document.getElementById("payerAddress").value.trim(),
      notes: document.getElementById("payerNotes").value.trim(),
      status: "pending"
    };

    if (storelyUsingDatabase()) await dbCreateOrder(order);
    else {
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      orders.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }

    if (cartItems.length) {
      if (storelyUsingDatabase()) {
        for (const item of cartItems) {
          await dbIncrementSales(item.productId, item.storeId, item.qty, storelySellerAmount(item.product.price * item.qty));
        }
        await storelyRefreshStores();
      } else {
        cartItems.forEach((item) => {
          item.product.sales = (item.product.sales || 0) + item.qty;
          item.store.sales = (item.store.sales || 0) + item.qty;
          item.store.revenue = (item.store.revenue || 0) + storelySellerAmount(item.product.price * item.qty);
        });
        await storelySaveStoresAsync(stores);
      }
      await storelySaveCartAsync([]);
    }

    document.getElementById("paymentMessage").textContent = "تم إرسال طلبك.";
    document.getElementById("paymentMessage").dataset.type = "success";
    setTimeout(() => { window.location.href = "index.html"; }, 1500);
  });
});
