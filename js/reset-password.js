function resetShowForm() {
  document.getElementById("resetWaiting").hidden = true;
  document.getElementById("resetForm").hidden = false;
  document.getElementById("resetForm").classList.add("active");
}

function resetShowError(text) {
  document.getElementById("resetWaiting").textContent = text;
  document.getElementById("resetForm").hidden = true;
}

storelyInit().then(async () => {
  const message = document.getElementById("resetMessage");
  const form = document.getElementById("resetForm");

  if (!dbIsConfigured()) {
    resetShowError("إعادة التعيين عبر الرابط تتطلب تفعيل Supabase.");
    return;
  }

  const sb = dbClient();
  let ready = false;

  const tryReady = (event) => {
    if (ready) return;
    if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
      ready = true;
      resetShowForm();
    }
  };

  sb.auth.onAuthStateChange((event) => tryReady(event));

  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    ready = true;
    resetShowForm();
  } else if (location.hash.includes("access_token") || location.hash.includes("type=recovery")) {
    setTimeout(() => {
      if (!ready) resetShowError("انتهت صلاحية الرابط أو الرابط غير صالح. اطلب رابطاً جديداً.");
    }, 4000);
  } else {
    resetShowError("افتح الرابط من رسالة البريد الإلكتروني، أو اطلب رابطاً جديداً من صفحة نسيت كلمة السر.");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";
    message.removeAttribute("data-type");

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (newPassword !== confirmPassword) {
      message.textContent = "كلمتا المرور غير متطابقتين";
      message.dataset.type = "error";
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;

    try {
      await dbUpdatePasswordFromRecovery(newPassword);
      message.textContent = "تم تغيير كلمة المرور! يمكنك تسجيل الدخول الآن.";
      message.dataset.type = "success";
      form.hidden = true;
      setTimeout(() => { window.location.href = "login.html"; }, 2000);
    } catch (err) {
      message.textContent = err.message || "تعذر حفظ كلمة المرور";
      message.dataset.type = "error";
      btn.disabled = false;
    }
  });
});
