storelyInit().then(() => {
  storelyApplyHelpPage();
  const email = (window.APP_CONFIG || {}).supportEmail || "support@shayebshop.com";
  const link = document.getElementById("supportEmailLink");
  link.textContent = email;
  link.href = "mailto:" + email;
  document.title = `${storelyT("help")} | ${storelySiteName()}`;
});
