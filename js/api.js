// ============================================================
//  api.js — كل التواصل مع Google Sheet هنا
// ============================================================

const API = {

  // ✅ جلب أي شيت بالاسم
  async getSheet(sheetName) {
    const res = await fetch(`${CONFIG.API_URL}?sheet=${sheetName}`);
    if (!res.ok) throw new Error(`فشل تحميل: ${sheetName}`);
    return res.json();
  },

  // ✅ جلب المنتجات
  async getProducts() {
    return this.getSheet(CONFIG.SHEETS.PRODUCTS);
  },

  // ✅ جلب إعدادات الأدمن (رقم الواتساب، كلمة المرور، حالة الصيدلية)
  async getAdminSettings() {
    const rows = await this.getSheet(CONFIG.SHEETS.ADMIN);
    // حوّل الـ array إلى object أسهل في الاستخدام
    const settings = {};
    rows.forEach(row => {
      settings[row.SettingName] = row.Value;
    });
    return settings;
  },

  // ✅ جلب الطلبات (للأدمن)
  async getOrders() {
    return this.getSheet(CONFIG.SHEETS.ORDERS);
  },

  // ✅ إرسال طلب جديد
  async submitOrder(orderData) {
    await fetch(CONFIG.API_URL, {
      method: "POST",
      mode: "no-cors",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet: CONFIG.SHEETS.ORDERS, ...orderData }),
    });
    // no-cors مش بيرجع response — الإرسال بيحصل في الخلفية
    return true;
  },
};
