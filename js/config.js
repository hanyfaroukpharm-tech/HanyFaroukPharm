// ============================================================
//  config.js — كل الإعدادات في مكان واحد
//  لو عايز تغير أي حاجة، غيرها هنا بس ✅
// ============================================================

const CONFIG = {
  // 🔗 رابط Google Apps Script
  API_URL: "https://script.google.com/macros/s/AKfycbw6I4sitywB6Y3-_s8PFG_wolbbd_ysLw8WUdwmuLS26XmyyhUqWOrjKUoOCiJV1hx7/exec",

  // 🏥 اسم الصيدلية
  PHARMACY_NAME: "صيدلية د. هاني فاروق",
  PHARMACY_TAGLINE: "خدمة دوائية متميزة",

  // 🛒 الحد الأدنى للتوصيل المجاني (بالجنيه)
  FREE_DELIVERY_MIN: 300,

  // 📦 اسم الشيتات — لا تغيرها إلا لو غيرتها في الشيت
  SHEETS: {
    PRODUCTS:   "Products",
    ORDERS:     "Orders",
    ADMIN:      "Admin",
    CATEGORIES: "Categories",   // ← جديد
  },

  // 🗂️ Categories احتياطية لو الشيت مش شغال
  DEFAULT_CATEGORIES: ["الكل", "العروض", "أدوية", "عناية بالبشرة والشعر", "أطفال", "أجهزة طبية"],

  // 💾 مفاتيح Local Storage
  STORAGE_KEYS: {
    NAME:    "hany_name",
    PHONE:   "hany_phone",
    ADDRESS: "hany_address",
  },
};