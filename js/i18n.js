const APP_I18N = {
  ar: {
    siteName: "متجر الشايب",
    home: "الرئيسية",
    delivery: "توصيل",
    favorites: "المفضلة",
    cart: "السلة",
    account: "حسابي",
    login: "دخول",
    logout: "تسجيل خروج",
    help: "مساعدة",
    settings: "إعدادات",
    notifications: "الإشعارات",
    categories: "كل الفئات",
    searchPlaceholder: "ابحث عن ماركة أو منتج أو فئة",
    viewAll: "عرض الكل",
    fastDelivery: "توصيل سريع",
    addToCart: "إضافة إلى السلة",
    continueShopping: "متابعة التسوق",
    emptyCart: "لا توجد أي منتجات في سلة مشترياتك",
    myOrders: "طلبياتي",
    myCoupons: "كوبوناتي",
    campaigns: "الحملات",
    all: "الكل",
    personalInfo: "بياناتي الشخصية",
    update: "تحديث",
    shamCash: "شام كاش",
    shamCashPay: "الدفع عبر شام كاش",
    accountName: "اسم الحساب",
    accountNumber: "رقم الحساب",
    member: "عضو متجر الشايب",
    orders: "طلباتي",
    buyAgain: "اشترِ مجدداً",
    services: "الخدمات",
    popularSearch: "البحث الشائع",
    flashSale: "تنزيلات خاطفة",
    pickedForYou: "قطع لك خصيصاً",
    browsingHistory: "سجل التصفح",
    previouslyAdded: "سبق إضافته",
    remove: "إزالة",
    payNow: "ادفع الآن",
    total: "الإجمالي"
  },
  en: {
    siteName: "Alshayeb Store",
    home: "Home",
    delivery: "Delivery",
    favorites: "Favorites",
    cart: "Cart",
    account: "Account",
    login: "Login",
    logout: "Logout",
    help: "Help",
    settings: "Settings",
    notifications: "Notifications",
    categories: "All Categories",
    searchPlaceholder: "Search brand, product, or category",
    viewAll: "View All",
    fastDelivery: "Fast Delivery",
    addToCart: "Add to Cart",
    continueShopping: "Continue Shopping",
    emptyCart: "Your cart is empty",
    myOrders: "My Orders",
    myCoupons: "My Coupons",
    campaigns: "Campaigns",
    all: "All",
    personalInfo: "Personal Information",
    update: "Update",
    shamCash: "Sham Cash",
    shamCashPay: "Pay with Sham Cash",
    accountName: "Account Name",
    accountNumber: "Account Number",
    member: "Alshayeb Member",
    orders: "My Orders",
    buyAgain: "Buy Again",
    services: "Services",
    popularSearch: "Popular Search",
    flashSale: "Flash Sale",
    pickedForYou: "Picked for You",
    browsingHistory: "Browsing History",
    previouslyAdded: "Previously Added",
    remove: "Remove",
    payNow: "Pay Now",
    total: "Total"
  }
};

function storelyT(key) {
  const lang = storelyGetLang();
  return APP_I18N[lang]?.[key] || APP_I18N.ar[key] || key;
}

function storelyApplyLang() {
  const lang = storelyGetLang();
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
  return lang;
}
