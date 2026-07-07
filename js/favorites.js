let _mode = "fav";
let _query = "";

storelyInit().then(() => {
  storelyApplyLang();
  document.title = `${storelyT("favorites")} | ${storelySiteName()}`;

  document.getElementById("pageTitle").textContent = storelyT("favorites");
  document.getElementById("favTab").textContent = storelyT("favorites");
  document.getElementById("historyTab").textContent = storelyT("browsingHistory");
  document.getElementById("favSearch").placeholder = storelyT("search");

  function render() {
    const entries = _mode === "fav" ? storelyGetFavorites() : storelyGetBrowseHistory();
    let items = storelyResolveProducts(entries);
    if (_query) items = items.filter((item) => item.product.title.toLowerCase().includes(_query));

    const box = document.getElementById("favoritesList");
    if (!items.length) {
      box.innerHTML = storelyEmptyState(storelyT("noItems"), storelyT("browseAddFav"), storelyT("browse"), "index.html");
      return;
    }

    box.innerHTML = items.map(({ product, storeId }) => `
      <article class="trendy-card" onclick="location.href='store.html?slug=${product.storeSlug}'">
        <button type="button" class="fav-btn active" data-fav="${storeId}:${product.id}">♥</button>
        <div class="trendy-img" style="${storelyMediaStyle(product.image)}"></div>
        <div class="trendy-body">
          <span class="trendy-cat">${storelyCategoryLabel(product.category)}</span>
          <h3>${product.title}</h3>
          <strong>${storelyMoney(product.price)}</strong>
        </div>
      </article>
    `).join("");

    box.querySelectorAll(".fav-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const [storeId, productId] = btn.dataset.fav.split(":");
        storelyToggleFavorite(storeId, productId);
        render();
      });
    });
  }

  document.getElementById("favTab").addEventListener("click", () => {
    _mode = "fav";
    document.getElementById("favTab").classList.add("active");
    document.getElementById("historyTab").classList.remove("active");
    render();
  });
  document.getElementById("historyTab").addEventListener("click", () => {
    _mode = "history";
    document.getElementById("historyTab").classList.add("active");
    document.getElementById("favTab").classList.remove("active");
    render();
  });
  document.getElementById("favSearch").addEventListener("input", (e) => {
    _query = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById("cameraSearchBtn").addEventListener("click", () => document.getElementById("cameraSearchInput").click());
  document.getElementById("cameraSearchInput").addEventListener("change", () => {
    storelyToast(storelyT("imageSelected"));
  });

  render();
});
