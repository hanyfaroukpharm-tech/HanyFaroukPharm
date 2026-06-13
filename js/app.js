// ============================================================
//  app.js — نقطة البداية، بيشغّل كل حاجة
// ============================================================

window.APP_SETTINGS = {};

async function initApp() {
  // 1️⃣ تهيئة الـ UI
  await UI.initTabs();
  UI.initSearch();
  UI.fillSavedCustomerData();

  // 2️⃣ استرجاع السلة المحفوظة
  Cart.load();

  // 3️⃣ تحميل إعدادات الأدمن
  try {
    const settings = await API.getAdminSettings();
    window.APP_SETTINGS = settings;
    UI.updateWhatsappBtn(settings.WhatsAppNumber);
    UI.updatePharmacyStatus(settings.PharmacyStatus);
  } catch (e) {
    console.warn("تعذّر تحميل إعدادات الأدمن", e);
  }

  // 4️⃣ تحميل المنتجات + الـ Slider من العروض
  await Products.load();
  await UI.loadPromoSlider(); // ← جديد: يحمل العروض في الـ Slider
  await UI.initCategoryCards(); // ← جديد
}

document.addEventListener("DOMContentLoaded", initApp);