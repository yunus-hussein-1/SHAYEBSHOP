function renderProfileAvatar(user) {
  const preview = document.getElementById("avatarPreview");
  if (user?.avatar) {
    preview.style.backgroundImage = `url('${user.avatar}')`;
    preview.textContent = "";
    preview.classList.add("has-image");
  } else {
    preview.style.backgroundImage = "";
    preview.textContent = (user?.name || "?").charAt(0);
    preview.classList.remove("has-image");
  }
}

storelyInit().then(async () => {
  if (!(await storelyRequireLoginAsync("profile.html"))) return;

  const user = storelyCurrentUser();
  document.getElementById("profileName").value = user.name || "";
  document.getElementById("profileEmail").value = user.email || "";
  document.getElementById("profilePhone").value = user.phone || "";
  document.getElementById("profileLocation").value = user.location || user.personal_location || "";
  renderProfileAvatar(user);

  if (storelyCurrentStore()) {
    document.querySelector(".panel-card.highlight").innerHTML = `
      <h2>متجرك نشط ✅</h2>
      <p>إدارة متجرك من لوحة التحكم.</p>
      <a class="primary-btn" href="dashboard.html">لوحة المتجر</a>`;
  }

  document.getElementById("getLocationBtn").addEventListener("click", () => {
    const msg = document.getElementById("profileMessage");
    if (!navigator.geolocation) { msg.textContent = "غير مدعوم"; msg.dataset.type = "error"; return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById("profileLocation").value = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        msg.textContent = "تم — اضغط حفظ";
        msg.dataset.type = "success";
      },
      () => { msg.textContent = "تعذر تحديد الموقع"; msg.dataset.type = "error"; }
    );
  });

  document.getElementById("avatarFile").addEventListener("change", async (e) => {
    const avatar = await storelyImageFromFile(e.target);
    if (!avatar) return;
    const preview = document.getElementById("avatarPreview");
    preview.style.backgroundImage = `url('${avatar}')`;
    preview.textContent = "";
    preview.classList.add("has-image");
    preview.dataset.pendingAvatar = avatar;
  });

  document.getElementById("profileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("profileMessage");
    const preview = document.getElementById("avatarPreview");
    const updates = {
      name: document.getElementById("profileName").value.trim(),
      phone: document.getElementById("profilePhone").value.trim(),
      location: document.getElementById("profileLocation").value.trim()
    };
    if (preview.dataset.pendingAvatar) updates.avatar = preview.dataset.pendingAvatar;
    try {
      await storelyUpdateProfile(updates);
      delete preview.dataset.pendingAvatar;
      renderProfileAvatar(storelyCurrentUser());
      msg.textContent = "تم الحفظ";
      msg.dataset.type = "success";
      appRefreshNav();
    } catch (err) {
      msg.textContent = err.message;
      msg.dataset.type = "error";
    }
  });
});
