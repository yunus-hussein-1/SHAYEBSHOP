storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("account-info.html"))) return;
  storelyApplyLang();

  document.getElementById("pageTitle").textContent = storelyT("personalInfo");
  document.getElementById("nameLabel").childNodes[0].textContent = storelyGetLang() === "en" ? "First Name" : "الاسم";
  document.getElementById("lastNameLabel").childNodes[0].textContent = storelyGetLang() === "en" ? "Last Name" : "اسم العائلة";
  document.getElementById("emailLabel").childNodes[0].textContent = storelyGetLang() === "en" ? "Email" : "البريد الإلكتروني";
  document.getElementById("phoneLabel").childNodes[0].textContent = storelyGetLang() === "en" ? "Phone" : "رقم الهاتف";
  document.getElementById("locationLabel").childNodes[0].textContent = storelyGetLang() === "en" ? "Delivery Location" : "موقع التسليم";
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
    if (!navigator.geolocation) { msg.textContent = "غير مدعوم"; msg.dataset.type = "error"; return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("profileLocation").value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        msg.textContent = storelyGetLang() === "en" ? "Location captured" : "تم تحديد الموقع";
        msg.dataset.type = "success";
      },
      () => { msg.textContent = storelyGetLang() === "en" ? "Location failed" : "تعذر تحديد الموقع"; msg.dataset.type = "error"; }
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
      msg.textContent = storelyGetLang() === "en" ? "Saved" : "تم الحفظ";
      msg.dataset.type = "success";
      appRefreshNav();
    } catch (err) {
      msg.textContent = err.message;
      msg.dataset.type = "error";
    }
  });
});
