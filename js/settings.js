storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("settings.html"))) return;

  const user = storelyCurrentUser();
  document.getElementById("paymentMethod").value = user.paymentMethod || "";
  document.getElementById("productCategory").innerHTML = storelyCategoryOptions("إلكترونيات");

  if (storelyCurrentStore()) {
    const store = storelyCurrentStore();
    document.getElementById("store").innerHTML = `
      <h2>متجرك</h2>
      <p><strong>${store.storeName}</strong> — ${store.tagline || ""}</p>
      <p>الموقع: ${store.storeLocation || store.location || "—"}</p>
      <a class="primary-btn" href="dashboard.html">إدارة المتجر</a>`;
  }

  document.getElementById("passwordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("passwordMessage");
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (newPassword !== confirmPassword) {
      msg.textContent = "كلمتا المرور غير متطابقتين";
      msg.dataset.type = "error";
      return;
    }
    try {
      const payload = storelyUsingDatabase()
        ? { newPassword }
        : { currentPassword: document.getElementById("currentPassword").value, newPassword };
      await storelyUpdateProfile(payload);
      e.target.reset();
      msg.textContent = "تم تغيير كلمة المرور";
      msg.dataset.type = "success";
    } catch (err) {
      msg.textContent = err.message;
      msg.dataset.type = "error";
    }
  });

  document.getElementById("paymentForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("paymentMessage");
    try {
      await storelyUpdateProfile({ paymentMethod: document.getElementById("paymentMethod").value });
      msg.textContent = "تم الحفظ";
      msg.dataset.type = "success";
    } catch (err) {
      msg.textContent = err.message;
      msg.dataset.type = "error";
    }
  });

  document.getElementById("storeForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("storeMessage");
    if (!document.getElementById("agreeCommission").checked) {
      msg.textContent = "وافق على العمولة";
      msg.dataset.type = "error";
      return;
    }

    const session = storelyCurrentUser();
    const stores = storelyGetStores(true);
    const slug = storelySlug(document.getElementById("storeSlug").value);
    if (stores.some((s) => s.slug === slug)) {
      msg.textContent = "الرابط مستخدم";
      msg.dataset.type = "error";
      return;
    }

    const storeLocation = document.getElementById("storeLocation").value.trim();
    const description = document.getElementById("storeDescription").value.trim();
    const newStore = {
      id: "store-" + Date.now(),
      userId: session.userId,
      slug,
      ownerName: session.name,
      storeName: document.getElementById("storeName").value.trim(),
      tagline: description,
      storeLocation,
      location: storeLocation,
      logo: document.getElementById("storeName").value.trim().charAt(0),
      banner: "assets/images/store-banner.svg",
      rating: 5, sales: 0, revenue: 0, reviews: [],
      banned: false, agreedCommission: true, status: "active",
      products: [{
        id: "product-" + Date.now(),
        title: document.getElementById("productTitle").value.trim(),
        price: Number(document.getElementById("productPrice").value),
        category: document.getElementById("productCategory").value,
        featured: false, sales: 0, image: "assets/images/product-electronics.svg"
      }]
    };

    stores.unshift(newStore);
    await storelySaveStoresAsync(stores);

    if (storelyUsingDatabase()) await dbUpdateProfileStoreId(session.userId, newStore.id);
    else {
      const users = storelyGetUsers().map((u) => u.id === session.userId ? { ...u, storeId: newStore.id, role: "seller" } : u);
      storelySaveUsers(users);
    }

    localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify({ ...session, storeId: newStore.id, role: "seller" }));
    msg.textContent = "تم إنشاء متجرك!";
    msg.dataset.type = "success";
    setTimeout(() => { window.location.href = "dashboard.html"; }, 1200);
  });
});
