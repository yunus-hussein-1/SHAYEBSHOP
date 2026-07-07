function renderProfileAvatar(user) {
  const preview = document.getElementById("profileAvatar");
  if (!preview) return;
  if (user?.avatar) {
    preview.style.backgroundImage = `url('${user.avatar}')`;
    preview.textContent = "";
  } else {
    preview.style.backgroundImage = "";
    preview.textContent = (user?.name || "?").charAt(0);
  }
}

storelyInit().then(async () => {
  storelyApplyLang();
  document.title = `${storelyT("account")} | ${storelySiteName()}`;

  document.getElementById("memberBadge").textContent = storelyT("member");
  document.getElementById("tileHistory").textContent = storelyT("browsingHistory");
  document.getElementById("tileCoupons").textContent = storelyT("myCoupons");
  document.getElementById("tileHelp").textContent = storelyT("help");
  document.getElementById("tileQuestions").textContent = storelyT("myQuestions");
  document.getElementById("tileOrders").textContent = storelyT("orders");
  document.getElementById("tileFav").textContent = storelyT("favorites");
  document.getElementById("tileComments").textContent = storelyT("comments");
  document.getElementById("tileBuyAgain").textContent = storelyT("buyAgain");
  document.getElementById("servicesTitle").textContent = storelyT("services");
  document.getElementById("servicesAll").textContent = `${storelyT("viewAll")} ›`;
  document.getElementById("servicePersonal").textContent = storelyT("personalInfo");
  document.getElementById("serviceSham").textContent = storelyT("shamCash");
  document.getElementById("serviceShamSub").textContent = storelyT("shamCashPay");
  document.getElementById("serviceSettings").textContent = storelyT("accountSettings");
  document.getElementById("serviceHelp").textContent = storelyT("helpContact");
  document.getElementById("shamNameLabel").textContent = `${storelyT("accountName")}:`;
  document.getElementById("shamNumLabel").textContent = `${storelyT("accountNumber")}:`;
  document.getElementById("shamAccountName").textContent = storelyShamCashAccountName();
  document.getElementById("shamAccountNumber").textContent = storelyShamCashNumber() || "—";

  document.querySelectorAll(".action-tile small").forEach((el, i) => {
    const keys = ["orders", "favorites", "comments", "buyAgain"];
    if (keys[i]) el.textContent = storelyT(keys[i]);
  });
  document.querySelectorAll(".service-row small").forEach((el, i) => {
    const keys = ["personalInfo", "shamCashPay", "accountSettings", "help"];
    if (keys[i]) el.textContent = storelyT(keys[i]);
  });

  if (storelyIsLoggedIn()) {
    const user = storelyCurrentUser();
    document.getElementById("profileName").textContent = user.name || storelyT("account");
    document.getElementById("profileEmail").textContent = user.email || "";
    renderProfileAvatar(user);
    document.getElementById("guestCard").hidden = true;
    if (storelyCurrentStore()) {
      document.getElementById("sellerCard").hidden = false;
      document.getElementById("sellerTitle").textContent = storelyT("storeActive");
      document.getElementById("sellerBtn").textContent = storelyT("storeDashboard");
    }
    return;
  }

  document.getElementById("profileName").textContent = storelySiteName();
  document.getElementById("profileEmail").textContent = storelyT("guestMode");
  document.getElementById("profileAvatar").textContent = storelyGetLang() === "en" ? "A" : "ش";
  document.getElementById("guestTitle").textContent = storelyT("signIn");
  document.getElementById("guestText").textContent = storelyT("guestSignInText");
  document.getElementById("guestBtn").textContent = storelyT("signIn");
});
