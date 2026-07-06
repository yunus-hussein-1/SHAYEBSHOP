storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("dashboard.html"))) return;

  let store = storelyCurrentStore();
  const createLink = document.getElementById("createStoreLink");

  if (!store) {
    document.getElementById("dashboardTitle").textContent = "حسابي";
    document.getElementById("dashboardSubtitle").textContent = "ليس لديك متجر بعد.";
    createLink.style.display = "inline-flex";
    createLink.href = "create.html";
    document.querySelector(".workspace-grid").style.display = "none";
    document.querySelector(".stats-grid").style.display = "none";
    document.getElementById("openStoreBtn").style.display = "none";
    return;
  }

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
});
