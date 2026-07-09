storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("addresses.html"))) return;
  storelyApplyLang();
  const t = (k) => storelyT(k);
  document.title = `${t("myAddresses")} | ${storelySiteName()}`;

  const title = document.getElementById("addrPageTitle");
  if (title) title.textContent = t("myAddresses");
  const mTitle = document.getElementById("mobileAddrTitle");
  if (mTitle) mTitle.textContent = t("myAddresses");
  const saveBtn = document.getElementById("addrSaveBtn");
  if (saveBtn) saveBtn.textContent = t("addAddress");

  if (typeof desktopMountAccountSidebar === "function") {
    desktopMountAccountSidebar("desktopAccountSidebar", "addresses");
  }

  function renderAddresses(container) {
    if (!container) return;
    const list = storelyGetAddresses();
    if (!list.length) {
      container.innerHTML = `<p>${t("addressPlaceholder")}</p>`;
      return;
    }
    container.innerHTML = list.map((a) => `
      <article class="address-card app-card">
        <strong>${a.label || t("deliveryAddress")}${a.isDefault ? " ★" : ""}</strong>
        <p>${[a.city, a.district, a.street, a.details].filter(Boolean).join(" — ")}</p>
        <button type="button" class="danger-btn" data-del="${a.id}">${t("remove")}</button>
      </article>
    `).join("");
    container.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        storelyRemoveAddress(btn.dataset.del);
        renderAll();
      });
    });
  }

  function renderAll() {
    renderAddresses(document.getElementById("addressesList"));
    renderAddresses(document.getElementById("mobileAddressesList"));
  }

  function bindForm(form, fields) {
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      storelyAddAddress({
        label: document.getElementById(fields.label).value.trim(),
        city: document.getElementById(fields.city).value.trim(),
        district: document.getElementById(fields.district).value.trim(),
        street: document.getElementById(fields.street).value.trim(),
        details: document.getElementById(fields.details).value.trim()
      });
      form.reset();
      renderAll();
      storelyToast(t("saved"));
    });
  }

  bindForm(document.getElementById("addAddressForm"), {
    label: "addrLabel", city: "addrCity", district: "addrDistrict",
    street: "addrStreet", details: "addrDetails"
  });
  bindForm(document.getElementById("mobileAddAddressForm"), {
    label: "mAddrLabel", city: "mAddrCity", district: "mAddrDistrict",
    street: "mAddrStreet", details: "mAddrDetails"
  });

  renderAll();
});
