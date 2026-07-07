const ORDERS_KEY = "shayebOrders";
const CHECKOUT_I18N = {
  ar: {
    title: "إتمام الطلب والدفع",
    lead: "جميع الأسعار بالليرة السورية (ل.س)",
    total: "الإجمالي",
    payMethod: "طريقة الدفع",
    hand: "تسليم باليد — الدفع عند الاستلام (ل.س)",
    sham: "شام كاش — الدفع بالليرة السورية",
    shamTitle: "تحويل شام كاش",
    shamHint: "حوّل المبلغ إلى الرقم التالي ثم أكّد الطلب:",
    shamAccount: "اسم الحساب:",
    success: "تم إرسال طلبك. سيتواصل البائع لتحديد موعد التسليم.",
    unspecified: "يُحدّد من الإدارة",
    optional: "اختياري",
    name: "الاسم",
    phone: "رقم سوري",
    address: "موقع التسليم / اللوكيشن",
    schedule: "موعد الاستلام المطلوب",
    notes: "ملاحظات",
    submit: "تأكيد الطلب والدفع",
    ref: "رقم عملية التحويل"
  },
  en: {
    title: "Checkout & Payment",
    lead: "All prices in Syrian Pound (SYP)",
    total: "Total",
    payMethod: "Payment Method",
    hand: "Cash on Delivery (SYP)",
    sham: "Sham Cash Transfer (SYP)",
    shamTitle: "Sham Cash Transfer",
    shamHint: "Transfer to the number below, then confirm order:",
    shamAccount: "Account Name:",
    success: "Order submitted successfully. Seller will contact you for delivery timing.",
    unspecified: "Set by admin",
    optional: "Optional",
    name: "Full Name",
    phone: "Syrian Phone",
    address: "Delivery Address / Location",
    schedule: "Preferred Delivery Time",
    notes: "Notes",
    submit: "Confirm Order & Payment",
    ref: "Transfer Reference"
  }
};

storelyInit().then(async () => {
  const lang = storelyGetLang();
  const t = CHECKOUT_I18N[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "en" ? "ltr" : "rtl";

  const params = new URLSearchParams(window.location.search);
  if (params.get("plan") !== "cart") {
    window.location.href = "cart.html";
    return;
  }

  if (!(await storelyRequireLoginAsync("checkout.html?plan=cart"))) return;

  const stores = storelyGetStores(true);
  const cartItems = (await storelyGetCartAsync()).map((item) => {
    const itemStore = stores.find((s) => s.id === item.storeId);
    const product = itemStore?.products.find((p) => p.id === item.productId);
    return product ? { ...item, product, store: itemStore } : null;
  }).filter(Boolean);

  if (!cartItems.length) {
    window.location.href = "cart.html";
    return;
  }

  const total = cartItems.reduce((sum, item) => sum + Number(item.product.price || 0) * item.qty, 0);
  const user = storelyCurrentUser();
  const shamNum = storelyShamCashNumber();
  const shamAccount = storelyShamCashAccountName();

  document.querySelector(".checkout-card h1").textContent = t.title;
  document.querySelector(".checkout-lead").textContent = t.lead;
  document.getElementById("paymentMethodTitle").textContent = t.payMethod;
  document.getElementById("handPayText").textContent = t.hand;
  document.getElementById("shamPayText").textContent = t.sham;
  document.getElementById("shamCashTitle").textContent = t.shamTitle;
  document.getElementById("shamCashHint").textContent = t.shamHint;
  document.getElementById("shamCashAccountLabel").textContent = t.shamAccount;
  document.getElementById("shamCashAccountName").textContent = shamAccount;
  document.getElementById("payerNameLabel").childNodes[0].textContent = t.name;
  document.getElementById("payerPhoneLabel").childNodes[0].textContent = t.phone;
  document.getElementById("payerAddressLabel").childNodes[0].textContent = t.address;
  document.getElementById("deliveryTimeLabel").childNodes[0].textContent = t.schedule;
  document.getElementById("payerNotesLabel").childNodes[0].textContent = t.notes;
  document.getElementById("submitOrderBtn").textContent = t.submit;
  document.getElementById("shamCashRefLabel").childNodes[0].textContent = t.ref;
  document.getElementById("payerNotes").placeholder = t.optional;
  document.getElementById("shamCashRef").placeholder = t.optional;

  document.getElementById("selectedPlan").innerHTML = `
    <span>${t.total}</span>
    <strong>${storelyMoney(total)}</strong>
    ${cartItems.map((item) => `<p>${item.product.title} × ${item.qty} — ${storelyMoney(item.product.price * item.qty)}</p>`).join("")}
  `;

  if (user?.name) document.getElementById("payerName").value = user.name;
  if (user?.phone) document.getElementById("payerPhone").value = user.phone;
  if (user?.deliveryAddress) document.getElementById("payerAddress").value = user.deliveryAddress;
  else if (user?.location) document.getElementById("payerAddress").value = user.location;
  if (user?.deliveryTime) document.getElementById("deliveryTime").value = user.deliveryTime;

  document.getElementById("shamCashNumber").textContent = shamNum || t.unspecified;

  document.querySelectorAll('input[name="payMethod"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      document.getElementById("shamCashBox").style.display =
        document.querySelector('input[name="payMethod"]:checked')?.value === "sham_cash" ? "block" : "none";
    });
  });

  document.getElementById("paymentForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || "hand";

    const order = {
      id: "order-" + Date.now(),
      userId: user?.userId,
      storeId: cartItems[0]?.storeId || null,
      items: cartItems.map((i) => ({
        title: i.product.title,
        qty: i.qty,
        price: i.product.price,
        category: i.product.category
      })),
      totalSyp: total,
      commissionSyp: storelyCommission(total),
      sellerAmountSyp: storelySellerAmount(total),
      buyerName: document.getElementById("payerName").value.trim(),
      buyerPhone: document.getElementById("payerPhone").value.trim(),
      buyerAddress: document.getElementById("payerAddress").value.trim(),
      buyerLocation: document.getElementById("payerAddress").value.trim(),
      deliveryTime: document.getElementById("deliveryTime").value,
      paymentMethod: payMethod === "sham_cash" ? t.sham : t.hand,
      paymentType: payMethod,
      shamCashRef: document.getElementById("shamCashRef")?.value.trim() || "",
      notes: document.getElementById("payerNotes").value.trim(),
      sellerDeliverySlot: "",
      status: "pending"
    };

    if (storelyUsingDatabase()) await dbCreateOrder(order);
    else {
      const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
      orders.unshift(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }

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
    storelyUpdateCartBadge();

    document.getElementById("paymentMessage").textContent = t.success;
    document.getElementById("paymentMessage").dataset.type = "success";
    setTimeout(() => { window.location.href = "index.html"; }, 1800);
  });
});
