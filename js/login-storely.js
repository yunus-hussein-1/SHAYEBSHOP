storelyInit().then(async () => {
  await dbHandleOAuthCallback();

  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".auth-panel");
  const message = document.getElementById("authMessage");

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
      message.textContent = "";
    });
  });

  document.getElementById("googleLoginBtn").addEventListener("click", async () => {
    try {
      if (storelyUsingDatabase()) await dbSignInWithGoogle();
      else message.textContent = "فعّل Supabase في db-config.js";
    } catch (err) {
      message.textContent = err.message;
      message.dataset.type = "error";
    }
  });

  document.getElementById("signupForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim().toLowerCase();
    const password = document.getElementById("signupPassword").value;

    try {
      if (storelyUsingDatabase()) {
        await dbSignUp(name, email, password);
        message.textContent = "تحقق من بريدك ثم سجّل الدخول.";
        message.dataset.type = "success";
        return;
      }
      const users = storelyGetUsers();
      if (users.some((u) => u.email === email)) throw new Error("البريد مسجل.");
      const user = { id: "user-" + Date.now(), name, email, password, storeId: null };
      users.push(user);
      storelySaveUsers(users);
      localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify({ userId: user.id, name, email, storeId: null }));
      window.location.href = await storelyAfterAuthRedirect();
    } catch (err) {
      message.textContent = err.message;
      message.dataset.type = "error";
    }
  });

  document.getElementById("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    try {
      if (storelyUsingDatabase()) {
        await dbSignIn(email, password);
        localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify(dbCurrentUser()));
      } else {
        const user = storelyGetUsers().find((u) => u.email === email && u.password === password);
        if (!user) throw new Error("بيانات غير صحيحة.");
        localStorage.setItem(STORELY_SESSION_KEY, JSON.stringify({ userId: user.id, name: user.name, email: user.email, storeId: user.storeId || null }));
      }
      window.location.href = await storelyAfterAuthRedirect();
    } catch (err) {
      message.textContent = err.message;
      message.dataset.type = "error";
    }
  });
});

async function storelyAfterAuthRedirect() {
  const pending = JSON.parse(localStorage.getItem("storelyPendingCartAdd") || "null");
  if (pending) {
    await storelyAddToCartAsync(pending.storeId, pending.productId);
    localStorage.removeItem("storelyPendingCartAdd");
    localStorage.removeItem("storelyRedirectAfterLogin");
    return "cart.html";
  }
  const target = localStorage.getItem("storelyRedirectAfterLogin") || "index.html";
  localStorage.removeItem("storelyRedirectAfterLogin");
  return target;
}
