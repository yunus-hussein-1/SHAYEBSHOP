const CATEGORY_META = {
  "إلكترونيات": { emoji: "🎧", image: "assets/images/product-electronics.svg" },
  "ألبسة نسائية": { emoji: "👗", image: "assets/images/product-placeholder.svg" },
  "ألبسة رجالية": { emoji: "👔", image: "assets/images/product-placeholder.svg" },
  "ألبسة أطفال": { emoji: "🧒", image: "assets/images/product-placeholder.svg" }
};

storelyInit().then(() => {
  storelyApplyLang();
  document.title = `${storelyT("categories")} | ${storelySiteName()}`;
  const searchInput = document.getElementById("categorySearch");
  const cameraBtn = document.getElementById("cameraSearchBtn");
  const cameraInput = document.getElementById("cameraSearchInput");

  document.getElementById("pageTitle").textContent = storelyT("categories");
  searchInput.placeholder = storelyT("searchPlaceholder");

  function renderGrid(query = "") {
    const q = query.trim().toLowerCase();
    const cats = STORELY_CATEGORIES.filter((cat) => {
      if (!q) return true;
      return cat.includes(q) || storelyCategoryLabel(cat).toLowerCase().includes(q);
    });
    document.getElementById("categoryGrid").innerHTML = cats.map((cat) => {
      const meta = CATEGORY_META[cat] || { emoji: "🛍️", image: "assets/images/product-placeholder.svg" };
      return `
        <a href="index.html" class="category-card" data-cat="${cat}">
          <div class="category-card-img" style="background-image:url('${meta.image}')"></div>
          <strong>${storelyCategoryLabel(cat)}</strong>
          <span>${meta.emoji}</span>
        </a>`;
    }).join("");

    document.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.setItem("storelySelectedCategory", card.dataset.cat);
        window.location.href = "index.html";
      });
    });
  }

  searchInput.addEventListener("input", () => renderGrid(searchInput.value));
  cameraBtn.addEventListener("click", () => cameraInput.click());
  cameraInput.addEventListener("change", () => {
    if (cameraInput.files?.length) storelyToast(storelyT("imageSelected"));
  });

  renderGrid();
});
