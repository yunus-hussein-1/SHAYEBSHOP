storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("account-info.html"))) return;
  storelyApplyLang();

  document.title = `${storelyT("personalInfo")} | ${storelySiteName()}`;
  document.getElementById("pageTitle").textContent = storelyT("personalInfo");
  document.getElementById("nameLabel").childNodes[0].textContent = storelyT("firstName");
  document.getElementById("lastNameLabel").childNodes[0].textContent = storelyT("lastName");
  document.getElementById("emailLabel").childNodes[0].textContent = storelyT("email");
  document.getElementById("phoneLabel").childNodes[0].textContent = storelyT("phone");
  document.getElementById("locationLabel").childNodes[0].textContent = storelyT("deliveryLocation");
  document.getElementById("avatarLabel").childNodes[0].textContent = storelyT("changePhoto");
  document.getElementById("saveBtn").textContent = storelyT("update");

  const user = storelyCurrentUser();
  const nameParts = (user.name || "").split(" ");
  document.getElementById("profileName").value = nameParts[0] || "";
  document.getElementById("profileLastName").value = nameParts.slice(1).join(" ") || "";
  document.getElementById("profileEmail").value = user.email || "";
  document.getElementById("profilePhone").value = user.phone || "";
  document.getElementById("profileLocation").value = user.location || user.deliveryAddress || "";

  document.getElementById("getLocationBtn").addEventListener("click", () => {
    const msg = document.getElementById("profileMessage");
    if (!navigator.geolocation) { msg.textContent = storelyGetLang() === "en" ? "Not supported" : "غير مدعوم"; msg.dataset.type = "error"; return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("profileLocation").value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        msg.textContent = storelyT("locationOk");
        msg.dataset.type = "success";
      },
      () => { msg.textContent = storelyT("locationFail"); msg.dataset.type = "error"; }
    );
  });

  document.getElementById("avatarFile").addEventListener("change", async (e) => {
    const avatar = await storelyImageFromFile(e.target);
    if (avatar) document.getElementById("avatarFile").dataset.pendingAvatar = avatar;
  });

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("profileMessage");
    const first = document.getElementById("profileName").value.trim();
    const last = document.getElementById("profileLastName").value.trim();
    const updates = {
      name: [first, last].filter(Boolean).join(" "),
      phone: document.getElementById("profilePhone").value.trim(),
      location: document.getElementById("profileLocation").value.trim(),
      deliveryAddress: document.getElementById("profileLocation").value.trim()
    };
    const pending = document.getElementById("avatarFile").dataset.pendingAvatar;
    if (pending) updates.avatar = pending;
    try {
      await storelyUpdateProfile(updates);
      msg.textContent = storelyT("saved");
      msg.dataset.type = "success";
      appRefreshNav();
    } catch (err) {
      msg.textContent = err.message;
      msg.dataset.type = "error";
    }
  });
});
