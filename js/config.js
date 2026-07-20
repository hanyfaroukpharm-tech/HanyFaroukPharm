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
    PRODUCTS:   "Products",
    ORDERS:     "Orders",
    ADMIN:      "Admin",
    CATEGORIES: "Categories",
  },

  // 🗂️ أسماء الكاتيجوري الافتراضية — تظهر لو الشيت مش شغال
  DEFAULT_CATEGORIES: ["الكل", "العروض", "أدوية", "عناية بالبشرة والشعر", "أطفال", "أجهزة طبية"],

  // 💾 مفاتيح Local Storage لحفظ بيانات العميل
  STORAGE_KEYS: {
    NAME:    "hany_name",
    PHONE:   "hany_phone",
    ADDRESS: "hany_address",
  },

  // 💳 إعدادات طرق الدفع والأرقام الخاصة بها (سهلة التعديل من هنا 🚀)
  PAYMENT_METHODS: {
    VODAFONE: {
      number: "01142272584",
      label: "محفظة إلكترونية (فودافون كاش)",
      instruction: "يرجى تحويل المبلغ إلى رقم فودافون كاش التالي، ثم خذ لقطة شاشة (Screenshot) للتحويل لإرسالها مع الطلب:"
    },
    INSTAPAY: {
      number: "01022664129",
      label: "إنستا باي (Instapay)",
      instruction: "يرجى تحويل المبلغ عبر تطبيق إنستا باي إلى الحساب/الرقم التالي، وخذ لقطة شاشة لتأكيد التحويل:"
    }
  }
};
