async function storelyRequestPasswordReset(email) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) throw new Error("أدخل البريد الإلكتروني.");

  if (dbIsConfigured()) {
    await dbResetPassword(normalized);
    return { mode: "email" };
  }

  const exists = storelyGetUsers().some((u) => (u.email || "").toLowerCase() === normalized);
  if (!exists) {
    throw new Error("هذا البريد غير مسجل. تحقق من الإملاء أو أنشئ حساباً جديداً.");
  }

  const support = (window.APP_CONFIG || {}).supportEmail || "support@shayebshop.com";
  throw new Error(`البريد مسجل. لإرسال رابط التغيير عبر الإيميل فعّل Supabase في db-config.js، أو تواصل مع الدعم: ${support}`);
}

storelyInit().then(() => {
  if (storelyIsLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  const form = document.getElementById("forgotForm");
  const message = document.getElementById("forgotMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "";
    message.removeAttribute("data-type");
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = true;

    try {
      await storelyRequestPasswordReset(document.getElementById("forgotEmail").value);
      form.reset();
      message.textContent = "تم الإرسال! افحص بريدك (ومجلد الرسائل غير المرغوبة) واضغط الرابط لتغيير كلمة المرور.";
      message.dataset.type = "success";
    } catch (err) {
      message.textContent = err.message || "تعذر إرسال الرابط";
      message.dataset.type = "error";
    } finally {
      btn.disabled = false;
    }
  });
});
