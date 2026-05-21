
// ============================================================
//  app.js — نقطة البداية، بيشغّل كل حاجة
// ============================================================

window.APP_SETTINGS = {}; // إعدادات الأدمن متاحة للكل

async function initApp() {
  // 1️⃣ تهيئة الـ UI
  UI.initSlider();
  UI.initTabs();
  UI.initSearch();
  UI.fillSavedCustomerData();

  // 2️⃣ استرجاع السلة المحفوظة
  Cart.load();

  // 3️⃣ تحميل إعدادات الأدمن (واتساب، حالة الصيدلية)
  try {
    const settings = await API.getAdminSettings();
    window.APP_SETTINGS = settings;
    UI.updateWhatsappBtn(settings.WhatsAppNumber);
    UI.updatePharmacyStatus(settings.PharmacyStatus);
    UI.updatePromos(settings);
  } catch (e) {
    console.warn("تعذّر تحميل إعدادات الأدمن", e);
  }

  // 4️⃣ تحميل المنتجات
  await Products.load();
}

// ▶️ ابدأ لما الصفحة تتحمل
document.addEventListener("DOMContentLoaded", initApp);
