// ============================================================
//  cart.js — النسخة المعدلة لتنظيم رسالة الواتساب ودعم الأقسام وطرق الدفع
// ============================================================

const Cart = {
  items: [], // [{ id, name, price, category, qty }]

  // ➕ إضافة منتج أو زيادة الكمية (تم إضافة دعم القسم هنا)
  add(product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      // نضمن تخزين القسم (Category) إذا كان موجوداً، وإلا نضع "عام"
      this.items.push({ 
        ...product, 
        category: product.category || "عام", 
        qty: 1 
      });
    }
    this._save();
    this.updateUI();
    this._animateBadge();
  },

  // ➖ تقليل كمية أو حذف لو وصلت صفر
  decrease(id) {
    const item = this.items.find(i => i.id === id);
    if (!item) return;
    if (item.qty > 1) {
      item.qty -= 1;
    } else {
      this.remove(id);
      return;
    }
    this._save();
    this.updateUI();
  },

  // 🗑️ حذف منتج
  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this._save();
    this.updateUI();
  },

  // 🧹 تفريغ السلة
  clear() {
    this.items = [];
    this._save();
    this.updateUI();
  },

  // 💰 إجمالي السعر
  getTotal() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },

  // 🔢 عدد المنتجات
  getCount() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  },

  // 📝 الحصول على طريقة الدفع المحددة حالياً كنص مقروء
  getSelectedPaymentMethodText() {
    const checkedRadio = document.querySelector('input[name="payment-method"]:checked');
    if (!checkedRadio) return "نقدي عند الاستلام";
    
    const value = checkedRadio.value;
    if (value === "wallet") return "محفظة إلكترونية (فودافون كاش)";
    if (value === "instapay") return "تطبيق InstaPay";
    return "نقدي عند الاستلام";
  },

  // 📝 تجهيز تفاصيل الطلب بنص منظم جداً للواتساب بدون تكرار طريقة الدفع
  getSummaryText() {
    if (this.items.length === 0) return "السلة فارغة";

    let text = "";
    this.items.forEach((item, i) => {
      text += `*${i + 1}-* ${item.name}\n`;
      text += `🏷️ القسم: _${item.category}_\n`;
      text += `🔢 الكمية: ${item.qty} × ${item.price} ج.م\n`;
      text += `💰 السعر: *${item.price * item.qty} ج.م*\n`;
      if (i < this.items.length - 1) {
        text += "--------------------------\n";
      }
    });

    return text;
  },

  // 🔄 تحديث كل عناصر الـ UI (تم الحفاظ على كل الـ IDs الأصلية)
  updateUI() {
    const count = this.getCount();
    const total = this.getTotal();

    const badge = document.getElementById("cart-badge");
    if (badge) badge.textContent = count;

    const navTotal = document.getElementById("cart-total-nav");
    if (navTotal) navTotal.textContent = `${total} ج.م`;

    const modalTotal = document.getElementById("cart-total-display");
    if (modalTotal) modalTotal.textContent = `${total} ج.م`;

    this._renderCartItems();
  },

  // 🎨 رسم قائمة المنتجات في مودال الـ Checkout
  _renderCartItems() {
    const container = document.getElementById("cart-items-preview");
    if (!container) return;

    if (this.items.length === 0) {
      container.innerHTML = `<p class="text-center text-gray-400 py-4 text-sm">السلة فارغة</p>`;
      return;
    }

    container.innerHTML = this.items.map(item => `
      <div class="flex items-center justify-between bg-gray-50 rounded-xl p-3 gap-2">
        <div class="flex flex-col flex-1">
          <span class="text-sm font-bold text-gray-700">${item.name}</span>
          <span class="text-[10px] text-gray-400">${item.category}</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="Cart.decrease('${item.id}')" class="w-7 h-7 bg-white border border-gray-200 rounded-full text-gray-600 font-bold flex items-center justify-center text-sm shadow-sm">−</button>
          <span class="text-sm font-bold w-5 text-center">${item.qty}</span>
          <button onclick="Cart.add({id:'${item.id}', name:'${item.name}', price:${item.price}, category:'${item.category}'})" class="w-7 h-7 bg-blue-600 rounded-full text-white font-bold flex items-center justify-center text-sm shadow-sm">+</button>
        </div>
        <span class="text-blue-600 font-bold text-sm w-20 text-left">${item.price * item.qty} ج.م</span>
        <button onclick="Cart.remove('${item.id}')" class="text-red-400 text-xs hover:text-red-600">🗑</button>
      </div>
    `).join("");
  },

  // 💾 حفظ السلة في localStorage
  _save() {
    localStorage.setItem("hany_cart", JSON.stringify(this.items));
  },

  // 📂 استرجاع السلة من localStorage
  load() {
    const saved = localStorage.getItem("hany_cart");
    if (saved) {
      this.items = JSON.parse(saved);
      this.updateUI();
    }
  },

  // ✨ أنيميشن البادج عند الإضافة
  _animateBadge() {
    const badge = document.getElementById("cart-badge");
    if (!badge) return;
    badge.classList.add("scale-125");
    setTimeout(() => badge.classList.remove("scale-125"), 200);
  },
};
