async function storelyAfterAuthRedirect() {
  const pending = JSON.parse(localStorage.getItem("storelyPendingCartAdd") || "null");
  if (pending) {
    if (storelyIsLoggedIn()) {
      await storelyAddToCartAsync(pending.storeId, pending.productId);
    }
    localStorage.removeItem("storelyPendingCartAdd");
    localStorage.removeItem("storelyRedirectAfterLogin");
    return "cart.html";
  }
  const target = localStorage.getItem("storelyRedirectAfterLogin") || "index.html";
  localStorage.removeItem("storelyRedirectAfterLogin");
  return target;
}

function storelyLocalSignUp(name, email, password) {
  const users = storelyGetUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error(storelyGetLang() === "en" ? "Email already registered. Try signing in." : "هذا البريد مسجل. جرّب تسجيل الدخول.");
  }
  const user = {
    id: "user-" + Date.now(),
    name,
    email,
    password,
    storeId: null,
    role: "buyer",
    phone: "",
    avatar: "",
    location: "",
    deliveryAddress: "",
    deliveryTime: "",
    paymentMethod: ""
  };
  users.push(user);
  storelySaveUsers(users);
  const session = { userId: user.id, name, email, storeId: null, role: "buyer", phone: "", avatar: "", location: "", deliveryAddress: "", deliveryTime: "", paymentMethod: "" };
  localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify(session));
  return session;
}

function storelyLocalSignIn(email, password) {
  const user = storelyGetUsers().find((u) => u.email === email && u.password === password);
  if (!user) {
    throw new Error(storelyGetLang() === "en" ? "Invalid email or password." : "البريد أو كلمة المرور غير صحيحة.");
  }
  const session = {
    userId: user.id,
    name: user.name,
    email: user.email,
    storeId: user.storeId || null,
    role: user.storeId ? "seller" : (user.role || "buyer"),
    phone: user.phone || "",
    avatar: user.avatar || "",
    location: user.location || "",
    deliveryAddress: user.deliveryAddress || "",
    deliveryTime: user.deliveryTime || "",
    paymentMethod: user.paymentMethod || ""
  };
  localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify(session));
  return session;
}

async function initLoginPage() {
  storelyApplyAuthPage();
  document.title = `${storelyT("login")} | ${storelySiteName()}`;
  const message = document.getElementById("authMessage");
  const deskMessage = document.getElementById("deskAuthMessage");
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".auth-panel");

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  setText("deskAuthBrand", storelySiteName());
  setText("deskAuthTitle", storelyGetLang() === "en" ? "Login or Register" : "تسجيل الدخول أو التسجيل");
  const deskEmailLabel = document.getElementById("deskEmailLabel");
  if (deskEmailLabel?.childNodes[0]) {
    deskEmailLabel.childNodes[0].textContent = storelyGetLang() === "en" ? "* Email" : "* بريد إلكتروني";
  }
  setText("deskLoginContinue", storelyGetLang() === "en" ? "Continue" : "يكمل");
  setText("deskAuthDivider", storelyT("or") || "أو");
  setText("deskGoogleBtn", storelyGetLang() === "en" ? "Continue with Google" : "تابع مع جوجل");
  setText("deskFacebookBtn", storelyGetLang() === "en" ? "Continue with Facebook" : "تابع مع فيسبوك");

  try {
    await storelyInit();
    if (dbIsConfigured()) {
      await dbHandleOAuthCallback();
    }
  } catch (err) {
    console.warn("Auth init:", err);
  }

  if (storelyIsLoggedIn()) {
    window.location.href = await storelyAfterAuthRedirect();
    return;
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));
      tab.classList.add("active");
      panels[index].classList.add("active");
      if (message) { message.textContent = ""; message.removeAttribute("data-type"); }
    });
  });

  document.getElementById("googleLoginBtn")?.addEventListener("click", async () => {
    message.textContent = "";
    deskMessage && (deskMessage.textContent = "");
    try {
      if (!dbIsConfigured()) {
        throw new Error(storelyGetLang() === "en" ? "Google sign-in requires Supabase setup in db-config.js" : "Google يعمل بعد إعداد Supabase في db-config.js");
      }
      await dbSignInWithGoogle();
    } catch (err) {
      const txt = err.message || (storelyGetLang() === "en" ? "Google sign-in failed" : "تعذر الدخول عبر Google");
      if (message) { message.textContent = txt; message.dataset.type = "error"; }
      if (deskMessage) { deskMessage.textContent = txt; deskMessage.dataset.type = "error"; }
    }
  });

  document.getElementById("deskGoogleBtn")?.addEventListener("click", () => {
    document.getElementById("googleLoginBtn")?.click();
  });

  document.getElementById("deskFacebookBtn")?.addEventListener("click", () => {
    storelyToast(storelyGetLang() === "en" ? "Facebook login coming soon" : "تسجيل فيسبوك قريباً");
  });

  let deskStep = 1;
  document.getElementById("deskLoginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("deskLoginEmail").value.trim().toLowerCase();
    if (!email) return;

    if (deskStep === 1) {
      let passInput = document.getElementById("deskLoginPassword");
      if (!passInput) {
        passInput = document.createElement("input");
        passInput.type = "password";
        passInput.id = "deskLoginPassword";
        passInput.placeholder = storelyGetLang() === "en" ? "Password" : "كلمة المرور";
        passInput.required = true;
        passInput.style.marginBottom = "12px";
        document.getElementById("deskLoginForm").insertBefore(passInput, document.getElementById("deskLoginContinue"));
      }
      passInput.style.display = "block";
      document.getElementById("deskLoginContinue").textContent = storelyGetLang() === "en" ? "Sign In" : "دخول";
      deskStep = 2;
      passInput.focus();
      return;
    }

    const password = document.getElementById("deskLoginPassword").value;
    const btn = document.getElementById("deskLoginContinue");
    btn.disabled = true;
    try {
      if (storelyUsingDatabase()) {
        await dbSignIn(email, password);
        localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify(dbCurrentUser()));
      } else {
        storelyLocalSignIn(email, password);
      }
      await storelyMergeGuestCartOnLogin();
      window.location.href = await storelyAfterAuthRedirect();
    } catch (err) {
      const txt = err.message || (storelyGetLang() === "en" ? "Sign in failed" : "تعذر تسجيل الدخول");
      if (deskMessage) { deskMessage.textContent = txt; deskMessage.dataset.type = "error"; }
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("signupForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;
    const btn = event.submitter || event.target.querySelector('[type="submit"]');
    btn.disabled = true;

    try {
      if (storelyUsingDatabase()) {
        await dbSignUp(name, email, password);
        message.textContent = storelyGetLang() === "en"
          ? "Account created. Check your email to verify, then sign in."
          : "تم إنشاء الحساب. افحص بريدك وفعّل الحساب ثم سجّل الدخول.";
        message.dataset.type = "success";
        return;
      }
      storelyLocalSignUp(name, email, password);
      await storelyMergeGuestCartOnLogin();
      window.location.href = await storelyAfterAuthRedirect();
    } catch (err) {
      message.textContent = err.message || (storelyGetLang() === "en" ? "Could not create account" : "تعذر إنشاء الحساب");
      message.dataset.type = "error";
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    message.textContent = "";
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const btn = event.submitter || event.target.querySelector('[type="submit"]');
    btn.disabled = true;

    try {
      if (storelyUsingDatabase()) {
        await dbSignIn(email, password);
        localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify(dbCurrentUser()));
      } else {
        storelyLocalSignIn(email, password);
      }
      await storelyMergeGuestCartOnLogin();
      window.location.href = await storelyAfterAuthRedirect();
    } catch (err) {
      message.textContent = err.message || (storelyGetLang() === "en" ? "Sign in failed" : "تعذر تسجيل الدخول");
      message.dataset.type = "error";
    } finally {
      btn.disabled = false;
    }
  });
}

initLoginPage();
