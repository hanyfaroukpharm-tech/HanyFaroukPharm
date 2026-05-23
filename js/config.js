// ============================================================
//  config.js — كل الإعدادات في مكان واحد
//  لو عايز تغير أي حاجة، غيرها هنا بس ✅
// ============================================================

const CONFIG = {
  // 🔗 رابط Google Apps Script — غيره بالرابط الخاص بيك
  API_URL: "https://script.google.com/macros/s/AKfycbw6I4sitywB6Y3-_s8PFG_wolbbd_ysLw8WUdwmuLS26XmyyhUqWOrjKUoOCiJV1hx7/exec",

  // 🏥 اسم الصيدلية
  PHARMACY_NAME: "صيدلية د. هاني فاروق",
  PHARMACY_TAGLINE: "خدمة دوائية متميزة",

  // 🛒 الحد الأدنى للتوصيل المجاني (بالجنيه)
  FREE_DELIVERY_MIN: 300,

  // 📦 اسم الشيتات في Google Sheet (لا تغيرها إلا لو غيرتها في الشيت)
  SHEETS: {
    PRODUCTS: "Products",
    ORDERS: "Orders",
    ADMIN: "Admin",
  },

  // 🗂️ أسماء الكاتيجوري — لو أضفت كاتيجوري جديدة في الشيت، أضفها هنا
  CATEGORIES: ["الكل", "أدوية", "تجميل", "أطفال", "أجهزة طبية"],

  // 💾 مفاتيح Local Storage لحفظ بيانات العميل
  STORAGE_KEYS: {
    NAME: "hany_name",
    PHONE: "hany_phone",
    ADDRESS: "hany_address",
  },
};
