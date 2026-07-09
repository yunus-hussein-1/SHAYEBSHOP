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
  document.getElementById("emailLabel").childNodes[0].textContent = t("emailAddress");
  document.getElementById("phoneLabel").childNodes[0].textContent = t("mobilePhone");
  document.getElementById("birthLabel")?.childNodes[0] && (document.getElementById("birthLabel").childNodes[0].textContent = t("dateOfBirth"));
  document.getElementById("locationLabel").childNodes[0].textContent = t("deliveryLocation");
  document.getElementById("avatarLabel").childNodes[0].textContent = t("changePhoto");
  document.getElementById("saveBtn").textContent = t("update");

  const deskBirthLabel = document.getElementById("deskBirthLabel");
  if (deskBirthLabel?.childNodes[0]) deskBirthLabel.childNodes[0].textContent = t("dateOfBirth");
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

  const session = storelyCurrentUser();
  const dbUser = storelyGetUsers().find((u) => u.id === session?.userId) || {};
  const user = { ...dbUser, ...session };
  const nameParts = (user.name || "").split(" ");
  const first = nameParts[0] || "";
  const last = nameParts.slice(1).join(" ") || "";

  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  }

  setVal("profileName", first);
  setVal("profileLastName", last);
  setVal("profileEmail", user.email);
  setVal("profilePhone", user.phone);
  setVal("profileLocation", user.location || user.deliveryAddress);
  setVal("birthDay", user.birthDay);
  setVal("birthMonth", user.birthMonth);
  setVal("birthYear", user.birthYear);

  setVal("deskProfileName", first);
  setVal("deskProfileLastName", last);
  setVal("deskProfileEmail", user.email);
  setVal("deskProfilePhone", user.phone);
  setVal("deskProfileLocation", user.location || user.deliveryAddress);
  setVal("deskBirthDay", user.birthDay);
  setVal("deskBirthMonth", user.birthMonth);
  setVal("deskBirthYear", user.birthYear);

  document.getElementById("avatarFile")?.addEventListener("change", async (e) => {
    const avatar = await storelyImageFromFile(e.target);
    if (avatar) document.getElementById("avatarFile").dataset.pendingAvatar = avatar;
  });

  async function saveProfile(e, opts) {
    e.preventDefault();
    const msg = document.getElementById(opts.msgId);
    const firstName = document.getElementById(opts.firstId).value.trim();
    const lastName = document.getElementById(opts.lastId).value.trim();
    const updates = {
      name: [firstName, lastName].filter(Boolean).join(" "),
      email: document.getElementById(opts.emailId).value.trim().toLowerCase(),
      phone: document.getElementById(opts.phoneId).value.trim(),
      location: document.getElementById(opts.locId).value.trim(),
      deliveryAddress: document.getElementById(opts.locId).value.trim(),
      birthDay: document.getElementById(opts.dayId)?.value || "",
      birthMonth: document.getElementById(opts.monthId)?.value || "",
      birthYear: document.getElementById(opts.yearId)?.value || ""
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
    saveProfile(e, {
      msgId: "profileMessage", firstId: "profileName", lastId: "profileLastName",
      emailId: "profileEmail", phoneId: "profilePhone", locId: "profileLocation",
      dayId: "birthDay", monthId: "birthMonth", yearId: "birthYear"
    })
  );
  document.getElementById("desktopProfileForm")?.addEventListener("submit", (e) =>
    saveProfile(e, {
      msgId: "deskProfileMessage", firstId: "deskProfileName", lastId: "deskProfileLastName",
      emailId: "deskProfileEmail", phoneId: "deskProfilePhone", locId: "deskProfileLocation",
      dayId: "deskBirthDay", monthId: "deskBirthMonth", yearId: "deskBirthYear"
    })
  );
});
