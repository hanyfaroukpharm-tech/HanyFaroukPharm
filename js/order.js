// ============================================================
//  order.js — إرسال الطلب للـ Sheet والواتساب
// ============================================================

const Order = {
  userLocation: "",

  // 📍 تحديد الموقع
  getLocation() {
    if (!navigator.geolocation) {
      alert("جهازك لا يدعم تحديد الموقع");
      return;
    }
    const btn = document.getElementById("location-btn");
    const status = document.getElementById("location-status");
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> جاري التحديد...`; }

    navigator.geolocation.getCurrentPosition(
      pos => {
        this.userLocation = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        if (status) { status.classList.remove("hidden"); status.textContent = "✓ تم تحديد موقعك بنجاح"; }
        if (btn) { btn.innerHTML = `<i class="fas fa-map-marker-alt"></i> تم التحديد ✓`; btn.classList.add("bg-green-100", "text-green-700"); }
      },
      () => {
        alert("برجاء تفعيل الـ GPS في هاتفك والسماح للموقع بالوصول");
        if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fas fa-map-marker-alt"></i> تحديد موقعي`; }
      }
    );
  },

  // ✅ التحقق من البيانات
  _validate(name, phone, address) {
    if (!name.trim()) { alert("برجاء إدخال الاسم"); return false; }
    if (!phone.trim() || phone.trim().length < 10) { alert("برجاء إدخال رقم موبايل صحيح"); return false; }
    if (Cart.getCount() === 0) { alert("السلة فارغة! أضف منتجات أولاً"); return false; }
    if (!address.trim()) { alert("برجاء إدخال العنوان"); return false; }
    return true;
  },

  // 🚀 إرسال الطلب
  async submit() {
    const name    = document.getElementById("cust-name")?.value || "";
    const phone   = document.getElementById("cust-phone")?.value || "";
    const address = document.getElementById("cust-address")?.value || "";

    if (!this._validate(name, phone, address)) return;

    // حفظ بيانات العميل
    localStorage.setItem(CONFIG.STORAGE_KEYS.NAME, name);
    localStorage.setItem(CONFIG.STORAGE_KEYS.PHONE, phone);
    localStorage.setItem(CONFIG.STORAGE_KEYS.ADDRESS, address);

    // تجهيز بيانات الطلب
    const now = new Date();
    const orderID = now.getTime().toString().slice(-6);
    const total   = Cart.getTotal();
    const details = Cart.getSummaryText();

    const orderData = {
      OrderID:           orderID,
      CustomerName:      name,
      Phone:             phone,
      OrderDetails:      details,
      PrescriptionImage: "",    // للمستقبل
      Total:             total,
      Status:            "قيد الانتظار",
      Date:              now.toLocaleString("ar-EG"),
      Address:           address + (this.userLocation ? `\n📍 ${this.userLocation}` : ""),
    };

    // تغيير حالة الزر
    const btn = document.getElementById("sendBtn");
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...`; }

    try {
      await API.submitOrder(orderData);
      this._openWhatsApp(name, phone, address, orderID, details, total);

      Cart.clear();
      UI.closeCheckout();
      this.userLocation = "";

      // Reset location UI
      const status = document.getElementById("location-status");
      if (status) status.classList.add("hidden");

    } catch (e) {
      alert("حدث خطأ، حاول مجدداً");
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `تأكيد وإرسال الطلب`; }
    }
  },

  // 📲 فتح واتساب برسالة جاهزة
  _openWhatsApp(name, phone, address, orderID, details, total) {
    const waNumber = window.APP_SETTINGS?.WhatsAppNumber || "";
    let msg = `*🏥 طلب جديد — ${CONFIG.PHARMACY_NAME}*\n`;
    msg += `*رقم الفاتورة:* #${orderID}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `*👤 العميل:* ${name}\n`;
    msg += `*📞 الهاتف:* ${phone}\n`;
    msg += `*📍 العنوان:* ${address}\n`;
    if (this.userLocation) msg += `🗺️ *الموقع:* ${this.userLocation}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `*🛒 الأصناف:*\n${details}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `*💰 الإجمالي: ${total} ج.م*`;

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  },
};

