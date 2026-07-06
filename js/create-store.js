storelyInit().then(async () => {
  const form = document.getElementById("storeForm");

  if (!(await storelyRequireLoginAsync("create.html"))) return;

  const activeUser = storelyCurrentUser();
  document.getElementById("ownerName").value = activeUser.name || "";
  document.getElementById("productCategory").innerHTML = storelyCategoryOptions("إلكترونيات");

  if (storelyCurrentStore()) {
    window.location.href = "dashboard.html";
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!document.getElementById("agreeCommission").checked) {
      alert("يجب الموافقة على اتفاقية العمولة.");
      return;
    }

    const stores = storelyGetStores(true);
    const session = storelyCurrentUser();
    const slug = storelySlug(document.getElementById("slug").value);

    if (!slug) { alert("أدخل رابطًا صالحًا."); return; }
    if (stores.some((s) => s.slug === slug)) { alert("هذا الرابط مستخدم."); return; }

    const bannerUpload = await storelyImageFromFile(document.getElementById("bannerFile"));
    const productUpload = await storelyImageFromFile(document.getElementById("productImageFile"));
    const banner = bannerUpload || document.getElementById("bannerUrl").value.trim() || "assets/images/store-banner.svg";
    const productImage = productUpload || document.getElementById("productImageUrl").value.trim() || "assets/images/product-electronics.svg";

    const newStore = {
      id: "store-" + Date.now(),
      userId: session.userId,
      slug,
      ownerName: document.getElementById("ownerName").value.trim(),
      storeName: document.getElementById("storeName").value.trim(),
      tagline: document.getElementById("tagline").value.trim(),
      logo: document.getElementById("logo").value.trim() || document.getElementById("storeName").value.trim().charAt(0),
      banner, rating: 5, sales: 0, revenue: 0, reviews: [],
      banned: false, agreedCommission: true,
      products: [{
        id: "product-" + Date.now(),
        title: document.getElementById("productTitle").value.trim(),
        price: Number(document.getElementById("productPrice").value),
        category: document.getElementById("productCategory").value,
        featured: false, sales: 0, image: productImage
      }]
    };

    stores.unshift(newStore);
    await storelySaveStoresAsync(stores);

    if (storelyUsingDatabase()) await dbUpdateProfileStoreId(session.userId, newStore.id);
    else {
      const users = storelyGetUsers().map((u) => u.id === session.userId ? { ...u, storeId: newStore.id, role: "seller" } : u);
      storelySaveUsers(users);
    }

    localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify({
      ...session,
      storeId: newStore.id,
      storeName: newStore.storeName,
      role: "seller"
    }));
    window.location.href = "dashboard.html";
  });
});
