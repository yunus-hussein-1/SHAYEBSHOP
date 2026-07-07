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
  const lang = storelyGetLang();
  const loggedIn = storelyIsLoggedIn();

  document.getElementById("memberBadge").textContent = storelyT("member");
  document.getElementById("tileHistory").textContent = storelyT("browsingHistory");
  document.getElementById("tileCoupons").textContent = storelyT("myCoupons");
  document.getElementById("tileOrders").textContent = storelyT("orders");
  document.getElementById("tileFav").textContent = storelyT("favorites");
  document.getElementById("tileBuyAgain").textContent = storelyT("buyAgain");
  document.getElementById("servicesTitle").textContent = storelyT("services");
  document.getElementById("servicesAll").textContent = `${storelyT("viewAll")} ›`;
  document.getElementById("servicePersonal").textContent = storelyT("personalInfo");
  document.getElementById("serviceSham").textContent = storelyT("shamCash");
  document.getElementById("serviceShamSub").textContent = storelyT("shamCashPay");
  document.getElementById("shamNameLabel").textContent = `${storelyT("accountName")}:`;
  document.getElementById("shamNumLabel").textContent = `${storelyT("accountNumber")}:`;
  document.getElementById("shamAccountName").textContent = storelyShamCashAccountName();
  document.getElementById("shamAccountNumber").textContent = storelyShamCashNumber() || "—";

  if (loggedIn) {
    const user = storelyCurrentUser();
    document.getElementById("profileName").textContent = user.name || storelyT("account");
    document.getElementById("profileEmail").textContent = user.email || "";
    renderProfileAvatar(user);
    document.getElementById("guestCard").hidden = true;
    if (storelyCurrentStore()) {
      document.getElementById("sellerCard").hidden = false;
      document.getElementById("sellerTitle").textContent = lang === "en" ? "Your store is active" : "متجرك نشط ✅";
      document.getElementById("sellerBtn").textContent = lang === "en" ? "Store Dashboard" : "لوحة المتجر";
    }
    return;
  }

  document.getElementById("profileName").textContent = storelyT("siteName");
  document.getElementById("profileEmail").textContent = lang === "en" ? "Guest mode" : "وضع الزائر";
  document.getElementById("profileAvatar").textContent = "ش";
  document.getElementById("guestTitle").textContent = storelyT("login");
  document.getElementById("guestText").textContent = lang === "en" ? "Sign in to access orders and personal data" : "للوصول لطلباتك وبياناتك الشخصية";
  document.getElementById("guestBtn").textContent = storelyT("login");
});
