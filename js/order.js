// ============================================================
//  order.js — إرسال الطلب للـ Sheet والواتساب
// ============================================================

const Order = {
  userLocation: "",
  prescriptionImage: null, // الصورة المختارة

  // 📍 تحديد الموقع
  getLocation() {
    if (!navigator.geolocation) {
      alert("جهازك لا يدعم تحديد الموقع");
      return;
    }
    const btn    = document.getElementById("location-btn");
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

  // ✅ التحقق من بيانات الطلب العادي
  _validate(name, phone, address) {
    if (!name.trim())                              { alert("برجاء إدخال الاسم");              return false; }
    if (!phone.trim() || phone.trim().length < 10) { alert("برجاء إدخال رقم موبايل صحيح");   return false; }
    if (Cart.getCount() === 0)                     { alert("السلة فارغة! أضف منتجات أولاً"); return false; }
    if (!address.trim())                           { alert("برجاء إدخال العنوان");            return false; }
    return true;
  },

  // 🚀 إرسال الطلب العادي
  async submit() {
    const name         = document.getElementById("cust-name")?.value     || "";
    const phone        = document.getElementById("cust-phone")?.value    || "";
    const address       = document.getElementById("cust-address")?.value  || "";
    const discountCode = document.getElementById("discount-code")?.value.trim() || "";

    if (!this._validate(name, phone, address)) return;

    localStorage.setItem(CONFIG.STORAGE_KEYS.NAME,    name);
    localStorage.setItem(CONFIG.STORAGE_KEYS.PHONE,   phone);
    localStorage.setItem(CONFIG.STORAGE_KEYS.ADDRESS, address);

    const now     = new Date();
    const orderID = now.getTime().toString().slice(-6);
    const total   = Cart.getTotal();
    const details = Cart.getSummaryText();

    const orderData = {
      OrderID:           orderID,
      CustomerName:      name,
      Phone:             phone,
      OrderDetails:      details + (discountCode ? `\n🏷️ كود الخصم: ${discountCode}` : ""),
      PrescriptionImage: "",
      Total:             total,
      Status:            "قيد الانتظار",
      Date:              now.toLocaleString("ar-EG"),
      Address:           address + (this.userLocation ? `\n📍 ${this.userLocation}` : ""),
    };

    const btn = document.getElementById("sendBtn");
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...`; }

    try {
      await API.submitOrder(orderData);
      this._openWhatsApp(name, phone, address, orderID, details, total, discountCode);
      Cart.clear();
      UI.closeCheckout();
      this.userLocation = "";
      const status = document.getElementById("location-status");
      if (status) status.classList.add("hidden");
      const discountInput = document.getElementById("discount-code");
      if (discountInput) discountInput.value = "";
    } catch (e) {
      alert("حدث خطأ، حاول مجدداً");
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fab fa-whatsapp ml-2"></i> تأكيد وإرسال الطلب`; }
    }
  },

  // ══════════════════════════════════════
  //  📋 PRESCRIPTION — الروشتة
  // ══════════════════════════════════════

  // 📂 فتح مودال الروشتة
  openPrescriptionModal() {
    document.getElementById("presc-name").value  = localStorage.getItem(CONFIG.STORAGE_KEYS.NAME)  || "";
    document.getElementById("presc-phone").value = localStorage.getItem(CONFIG.STORAGE_KEYS.PHONE) || "";
    document.getElementById("presc-notes").value = "";
    document.getElementById("prescriptionModal")?.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  // ❌ إغلاق مودال الروشتة
  closePrescriptionModal() {
    document.getElementById("prescriptionModal")?.classList.remove("active");
    document.body.style.overflow = "";
  },

  // ✅ التحقق من بيانات الروشتة
  _validatePrescription(name, phone) {
    if (!name.trim())                              { alert("برجاء إدخال الاسم");            return false; }
    if (!phone.trim() || phone.trim().length < 10) { alert("برجاء إدخال رقم موبايل صحيح"); return false; }
    return true;
  },

  // 🚀 إرسال الروشتة
  async submitPrescription() {
    const name  = document.getElementById("presc-name")?.value  || "";
    const phone = document.getElementById("presc-phone")?.value || "";
    const notes = document.getElementById("presc-notes")?.value || "";

    if (!this._validatePrescription(name, phone)) return;

    localStorage.setItem(CONFIG.STORAGE_KEYS.NAME,  name);
    localStorage.setItem(CONFIG.STORAGE_KEYS.PHONE, phone);

    const now     = new Date();
    const orderID = now.getTime().toString().slice(-6);

    const orderData = {
      OrderID:           orderID,
      CustomerName:      name,
      Phone:             phone,
      OrderDetails:      notes ? `ملاحظات: ${notes}` : "طلب روشتة طبية",
      PrescriptionImage: "سيتم إرسال الصورة عبر واتساب",
      Total:             0,
      Status:            "قيد الانتظار",
      Date:              now.toLocaleString("ar-EG"),
      Address:           "",
    };

    const btn = document.getElementById("presc-send-btn");
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...`; }

    try {
      await API.submitOrder(orderData);
      this._openWhatsAppPrescription(name, phone, notes, orderID);
      this.closePrescriptionModal();
    } catch (e) {
      alert("حدث خطأ، حاول مجدداً");
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fab fa-whatsapp ml-2"></i> إرسال الروشتة`; }
    }
  },

  // 📲 فتح واتساب مع الروشتة
  _openWhatsAppPrescription(name, phone, notes, orderID) {
    const waNumber = window.APP_SETTINGS?.WhatsAppNumber || "";
    let msg = `🏥 *صيدلية د. هاني فاروق*\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 *طلب روشتة طبية*\n`;
    msg += `🔖 *رقم الطلب:* #${orderID}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `👤 *الاسم:* ${name}\n`;
    msg += `📞 *الهاتف:* ${phone}\n`;
    if (notes) msg += `📝 *ملاحظات:* ${notes}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `📸 *برجاء إرفاق صورة الروشتة مع هذه الرسالة*`;

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  },

  // 📲 فتح واتساب للطلب العادي
  _openWhatsApp(name, phone, address, orderID, details, total, discountCode) {
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
    if (discountCode) msg += `\n🏷️ *كود الخصم:* ${discountCode}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `*💰 الإجمالي: ${total} ج.م*`;

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  },
};
