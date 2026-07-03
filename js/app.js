// ============================================================
// app.js — Optimized Version
// ============================================================

window.APP_SETTINGS = {};

// ✅ Fallback لـ requestIdleCallback (مش موجود في Safari/iOS)
const _ric = window.requestIdleCallback
  ? (cb) => window.requestIdleCallback(cb, { timeout: 2000 })
  : (cb) => setTimeout(cb, 100);

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

  const tabsPromise    = UI.initTabs();
  const productsPromise = Products.load();

  // ============================
  // 3- بعد ظهور المنتجات
  // ============================

  await Promise.all([adminPromise, tabsPromise, productsPromise]);

  // ============================
  // 4- تحميل الأشياء الثانوية
  //    بعد انتهاء الـ main thread
  // ============================

  _ric(async () => {
    try {
      await Promise.all([
        UI.loadPromoSlider(),
        UI.initCategoryCards(),
      ]);
    } catch (e) {
      console.warn(e);
    }
  });

  // ============================
  // 5- Popup بعد استقرار الصفحة
  //    3500ms هنا + 2000ms داخل checkPopupPromo = 5.5s
  //    كافي إن المتصفح يحدد LCP من عنصر تاني قبل البوب أب
  // ============================

  setTimeout(() => {
    requestAnimationFrame(() => {
      UI.checkPopupPromo();
    });
  }, 3500);

}

document.addEventListener("DOMContentLoaded", initApp);
