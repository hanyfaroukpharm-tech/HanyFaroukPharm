// ============================================================
//  api.js — كل التواصل مع Google Sheet هنا
// ============================================================

// ─────────────────────────────────────────────
//  إعدادات الكاش
// ─────────────────────────────────────────────
const CACHE = {
  TTL_PRODUCTS:   10 * 60 * 1000,  // 10 دقايق للمنتجات
  TTL_CATEGORIES: 30 * 60 * 1000,  // 30 دقيقة للأقسام

  _key(name) { return `pharmacy_cache_${name}`; },

  // احفظ في localStorage
  set(name, data, ttl) {
    try {
      localStorage.setItem(this._key(name), JSON.stringify({
        data,
        exp: Date.now() + ttl
      }));
    } catch (e) { /* localStorage ممتلي → نتجاهل */ }
  },

  // اجلب من localStorage (null لو منتهي أو مش موجود)
  get(name) {
    try {
      const raw = localStorage.getItem(this._key(name));
      if (!raw) return null;
      const { data, exp } = JSON.parse(raw);
      if (Date.now() > exp) return null;   // منتهي الصلاحية
      return data;
    } catch (e) { return null; }
  },

  // امسح كاش معين (لما الأدمن يعمل تعديل)
  clear(name) {
    try { localStorage.removeItem(this._key(name)); } catch (e) {}
  },

  // امسح كل الكاش
  clearAll() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('pharmacy_cache_'))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {}
  }
};

// ─────────────────────────────────────────────
//  API
// ─────────────────────────────────────────────
const API = {

  // ✅ جلب أي شيت بالاسم
  async getSheet(sheetName) {
    const res = await fetch(`${CONFIG.API_URL}?sheet=${sheetName}`);
    if (!res.ok) throw new Error(`فشل تحميل: ${sheetName}`);
    return res.json();
  },

  // ✅ جلب المنتجات — مع كاش + تجديد في الخلفية
  async getProducts() {
    const cacheKey = 'products';
    const cached = CACHE.get(cacheKey);

    if (cached) {
      // عرض الكاش فوراً + جدّد في الخلفية بهدوء
      this.getSheet(CONFIG.SHEETS.PRODUCTS)
        .then(fresh => CACHE.set(cacheKey, fresh, CACHE.TTL_PRODUCTS))
        .catch(() => {});
      return cached;
    }

    // أول مرة أو الكاش منتهي → اجلب وخزّن
    const data = await this.getSheet(CONFIG.SHEETS.PRODUCTS);
    CACHE.set(cacheKey, data, CACHE.TTL_PRODUCTS);
    return data;
  },

  // ✅ جلب الـ Categories — مع كاش + تجديد في الخلفية
  async getCategories() {
    const cacheKey = 'categories';
    const cached = CACHE.get(cacheKey);

    const _parse = (rows) => {
      const names = rows.map(r => r.Name).filter(Boolean);
      return ["الكل", ...names];
    };

    if (cached) {
      // جدّد في الخلفية
      this.getSheet(CONFIG.SHEETS.CATEGORIES)
        .then(fresh => CACHE.set(cacheKey, fresh, CACHE.TTL_CATEGORIES))
        .catch(() => {});
      return _parse(cached);
    }

    try {
      const rows = await this.getSheet(CONFIG.SHEETS.CATEGORIES);
      CACHE.set(cacheKey, rows, CACHE.TTL_CATEGORIES);
      return _parse(rows);
    } catch (e) {
      console.warn("Categories sheet not found, using defaults");
      return CONFIG.DEFAULT_CATEGORIES;
    }
  },

  // ✅ جلب إعدادات الأدمن — بدون كاش (لازم fresh)
  async getAdminSettings() {
    const rows = await this.getSheet(CONFIG.SHEETS.ADMIN);
    const settings = {};
    rows.forEach(row => {
      settings[row.SettingName] = row.Value;
    });
    return settings;
  },

  // ✅ جلب الطلبات — بدون كاش (لازم fresh)
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

  // ✅ مسح الكاش يدوياً (للاستخدام من الأدمن لو احتجت)
  clearCache() {
    CACHE.clearAll();
    console.log("✅ تم مسح الكاش");
  }
};
