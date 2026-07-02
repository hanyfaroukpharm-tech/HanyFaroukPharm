// ============================================================
// app.js — Optimized Version
// ============================================================

window.APP_SETTINGS = {};

async function initApp() {

  // ============================
  // 1- تهيئة الواجهة فوراً
  // ============================

  UI.initSearch();
  UI.fillSavedCustomerData();

  Cart.load();

  // ============================
  // 2- تشغيل العمليات بالتوازي
  // ============================

  const adminPromise = API.getAdminSettings()
    .then(settings => {
      window.APP_SETTINGS = settings;
      UI.updateWhatsappBtn(settings.WhatsAppNumber);
      UI.updatePharmacyStatus(settings.PharmacyStatus);
    })
    .catch(err => console.warn("تعذر تحميل إعدادات الأدمن", err));

  const tabsPromise = UI.initTabs();

  const productsPromise = Products.load();

  // ============================
  // 3- بعد ظهور المنتجات
  // ============================

  await Promise.all([
    adminPromise,
    tabsPromise,
    productsPromise
  ]);

  // ============================
  // 4- تحميل الأشياء الثانوية
  // ============================

  requestIdleCallback(async () => {

    try {

      await Promise.all([
        UI.loadPromoSlider(),
        UI.initCategoryCards()
      ]);

    } catch (e) {
      console.warn(e);
    }

  });

  // ============================
  // 5- Popup بعد انتهاء الرسم
  // ============================

  setTimeout(() => {

    requestAnimationFrame(() => {

      UI.checkPopupPromo();

    });

  }, 3500);

}

document.addEventListener("DOMContentLoaded", initApp);