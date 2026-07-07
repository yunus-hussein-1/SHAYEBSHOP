storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("account-info.html"))) return;
  storelyApplyLang();
  const t = (k) => storelyT(k);

  document.title = `${t("myUserInfo")} | ${storelySiteName()}`;
  document.getElementById("pageTitle").textContent = t("personalInfo");
  const desktopFormTitle = document.getElementById("desktopFormTitle");
  if (desktopFormTitle) desktopFormTitle.textContent = t("myUserInfo");
  document.getElementById("nameLabel").childNodes[0].textContent = t("firstName");
  document.getElementById("lastNameLabel").childNodes[0].textContent = t("lastName");
  document.getElementById("emailLabel").childNodes[0].textContent = t("email");
  document.getElementById("phoneLabel").childNodes[0].textContent = t("phone");
  document.getElementById("locationLabel").childNodes[0].textContent = t("deliveryLocation");
  document.getElementById("avatarLabel").childNodes[0].textContent = t("changePhoto");
  document.getElementById("saveBtn").textContent = t("update");

  document.getElementById("deskNameLabel")?.childNodes[0] && (document.getElementById("deskNameLabel").childNodes[0].textContent = t("firstName"));
  document.getElementById("deskLastNameLabel")?.childNodes[0] && (document.getElementById("deskLastNameLabel").childNodes[0].textContent = t("lastName"));
  document.getElementById("deskEmailLabel")?.childNodes[0] && (document.getElementById("deskEmailLabel").childNodes[0].textContent = t("emailAddress"));
  document.getElementById("deskPhoneLabel")?.childNodes[0] && (document.getElementById("deskPhoneLabel").childNodes[0].textContent = t("mobilePhone"));
  document.getElementById("deskLocationLabel")?.childNodes[0] && (document.getElementById("deskLocationLabel").childNodes[0].textContent = t("deliveryLocation"));
  const deskSaveBtn = document.getElementById("deskSaveBtn");
  if (deskSaveBtn) deskSaveBtn.textContent = t("update");

  if (typeof desktopMountAccountSidebar === "function") {
    desktopMountAccountSidebar("desktopAccountSidebar", "userInfo");
  }

  const user = storelyCurrentUser();
  const nameParts = (user.name || "").split(" ");
  const first = nameParts[0] || "";
  const last = nameParts.slice(1).join(" ") || "";

  document.getElementById("profileName").value = first;
  document.getElementById("profileLastName").value = last;
  document.getElementById("profileEmail").value = user.email || "";
  document.getElementById("profilePhone").value = user.phone || "";
  document.getElementById("profileLocation").value = user.location || user.deliveryAddress || "";

  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  setVal("deskProfileName", first);
  setVal("deskProfileLastName", last);
  setVal("deskProfileEmail", user.email || "");
  setVal("deskProfilePhone", user.phone || "");
  setVal("deskProfileLocation", user.location || user.deliveryAddress || "");

  function bindLocation(btnId, inputId, msgId) {
    document.getElementById(btnId)?.addEventListener("click", () => {
      const msg = document.getElementById(msgId);
      if (!navigator.geolocation) {
        if (msg) { msg.textContent = storelyGetLang() === "en" ? "Not supported" : "غير مدعوم"; msg.dataset.type = "error"; }
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const val = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
          document.getElementById(inputId).value = val;
          if (inputId === "profileLocation") document.getElementById("deskProfileLocation").value = val;
          else document.getElementById("profileLocation").value = val;
          if (msg) { msg.textContent = t("locationOk"); msg.dataset.type = "success"; }
        },
        () => { if (msg) { msg.textContent = t("locationFail"); msg.dataset.type = "error"; } }
      );
    });
  }

  bindLocation("getLocationBtn", "profileLocation", "profileMessage");
  bindLocation("deskGetLocationBtn", "deskProfileLocation", "deskProfileMessage");

  document.getElementById("avatarFile")?.addEventListener("change", async (e) => {
    const avatar = await storelyImageFromFile(e.target);
    if (avatar) document.getElementById("avatarFile").dataset.pendingAvatar = avatar;
  });

  async function saveProfile(e, msgId, firstId, lastId, phoneId, locId) {
    e.preventDefault();
    const msg = document.getElementById(msgId);
    const firstName = document.getElementById(firstId).value.trim();
    const lastName = document.getElementById(lastId).value.trim();
    const updates = {
      name: [firstName, lastName].filter(Boolean).join(" "),
      phone: document.getElementById(phoneId).value.trim(),
      location: document.getElementById(locId).value.trim(),
      deliveryAddress: document.getElementById(locId).value.trim()
    };
    const pending = document.getElementById("avatarFile")?.dataset.pendingAvatar;
    if (pending) updates.avatar = pending;
    try {
      await storelyUpdateProfile(updates);
      if (msg) { msg.textContent = t("saved"); msg.dataset.type = "success"; }
      if (typeof appRefreshNav === "function") appRefreshNav();
    } catch (err) {
      if (msg) { msg.textContent = err.message; msg.dataset.type = "error"; }
    }
  }

  document.getElementById("profileForm")?.addEventListener("submit", (e) =>
    saveProfile(e, "profileMessage", "profileName", "profileLastName", "profilePhone", "profileLocation")
  );
  document.getElementById("desktopProfileForm")?.addEventListener("submit", (e) =>
    saveProfile(e, "deskProfileMessage", "deskProfileName", "deskProfileLastName", "deskProfilePhone", "deskProfileLocation")
  );
});
