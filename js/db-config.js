// ALSHAYEB SHOP — إعدادات المنصة

window.APP_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: "",
  siteName: "Shaib Shop",
  siteNameAr: "شايب شوب",
  shamCashAccountName: "شايب شوب",
  siteDomain: "https://shayebshop.com",
  supportEmail: "support@shayebshop.com",
  founderEmail: "yunuselhuseyin82@gmail.com",
  platformCommission: 0.10,
  shamCashNumber: "09xxxxxxxx",
  currencies: {
    ar: { locale: "ar-SY", suffix: " ل.س", divisor: 1, decimals: 0 },
    en: { locale: "en-US", prefix: "$", divisor: 15000, decimals: 2 },
    tr: { locale: "tr-TR", suffix: " ₺", divisor: 480, decimals: 2 }
  }
};

window.ALSHAYEB_DB_CONFIG = window.APP_CONFIG;
