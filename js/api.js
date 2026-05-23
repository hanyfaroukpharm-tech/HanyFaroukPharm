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

  // ✅ جلب الـ Categories من الشيت
  async getCategories() {
    try {
      const rows = await this.getSheet(CONFIG.SHEETS.CATEGORIES);
      const names = rows.map(r => r.Name).filter(Boolean);
      return ["الكل", ...names];
    } catch (e) {
      console.warn("Categories sheet not found, using defaults");
      return CONFIG.DEFAULT_CATEGORIES;
    }
  },

  // ✅ جلب إعدادات الأدمن (رقم الواتساب، كلمة المرور، حالة الصيدلية)
  async getAdminSettings() {
    const rows = await this.getSheet(CONFIG.SHEETS.ADMIN);
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
    return true;
  },
};