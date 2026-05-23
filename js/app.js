// ============================================================
//  app.js — نقطة البداية، بيشغّل كل حاجة
// ============================================================

window.APP_SETTINGS = {};

async function initApp() {
  // 1️⃣ تهيئة الـ UI
  UI.initSlider();
  await UI.initTabs();   // ← await علشان تنتظر الشيت
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
    // UI.updatePromos حُذفت — الـ Slider ثابت في الـ HTML
  } catch (e) {
    console.warn("تعذّر تحميل إعدادات الأدمن", e);
  }

  // 4️⃣ تحميل المنتجات
  await Products.load();
}

document.addEventListener("DOMContentLoaded", initApp);
