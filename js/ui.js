// ============================================================
//  ui.js — Slider, Modals, Tabs, Search, Promos
// ============================================================

const UI = {

  // 🎠 تشغيل الـ Swiper Slider
  initSlider() {
    if (typeof Swiper === "undefined") return;
    new Swiper(".mySwiper", {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
    });
  },

 // 🛍️ تحميل منتجات العروض في الـ Slider
  async loadPromoSlider() {
    const wrapper = document.getElementById("swiper-wrapper");
    if (!wrapper) return;

    try {
      const all    = await API.getProducts();
      const promos = all.filter(p => p.Category === "العروض");

      if (promos.length === 0) return;

      const colors = [
        "from-blue-600 to-blue-800",
        "from-emerald-500 to-teal-700",
        "from-violet-600 to-purple-800",
        "from-rose-500 to-pink-700",
        "from-orange-500 to-amber-700",
      ];

      wrapper.innerHTML = promos.map((item, i) => {
        const color  = colors[i % colors.length];
        const imgSrc = item.Image
          ? (item.Image.startsWith("http") ? item.Image : `images/products/${item.Image}`)
          : "";

        return `
        <div class="swiper-slide">
          <div class="h-36 flex items-center overflow-hidden relative rounded-2xl">

            <!-- الصورة كخلفية كاملة بدون ظل -->
            ${imgSrc ? `
            <div class="absolute inset-0">
              <img src="${imgSrc}"
                class="w-full h-full object-cover"
                onerror="this.parentElement.parentElement.classList.add('bg-gradient-to-br', '${color}')">
            </div>` : `<div class="absolute inset-0 bg-gradient-to-br ${color}"></div>`}

            <!-- طبقة تعتيم خفيفة على اليمين فقط علشان النص يقرأ -->
            <div class="absolute inset-0" style="background:linear-gradient(to left, rgba(0,0,0,0.65) 40%, transparent 100%);"></div>

            <!-- النص على اليمين -->
            <div class="relative z-10 p-4 mr-auto text-right">
              <span class="text-xs bg-white/20 rounded-full px-3 py-1 inline-block mb-2">🏷️ عرض خاص</span>
              <h4 class="text-base font-black text-white leading-tight">${item.Name}</h4>
              ${item.Description ? `<p class="text-xs text-white/80 mt-1 line-clamp-2">${item.Description}</p>` : ""}
              <p class="text-yellow-300 font-black text-lg mt-1">${item.Price} ج.م</p>
            </div>

          </div>
        </div>`;
      }).join("");

      if (window.swiperInstance) window.swiperInstance.destroy(true, true);
      window.swiperInstance = new Swiper(".mySwiper", {
        slidesPerView: 1,
        spaceBetween: 16,
        loop: promos.length > 1,
        autoplay: { delay: 4000, disableOnInteraction: false },
        pagination: { el: ".swiper-pagination", clickable: true },
      });

    } catch (e) {
      console.warn("فشل تحميل عروض الـ Slider", e);
      this.initSlider();
    }
  },

  // 🔍 تشغيل البحث
  initSearch() {
    const searchBar   = document.getElementById("search-bar");
    const searchInput = document.getElementById("search-input");
    const searchBtn   = document.getElementById("search-btn");
    const closeSearch = document.getElementById("close-search");

    searchBtn?.addEventListener("click", () => {
      searchBar?.classList.remove("hidden");
      searchInput?.focus();
    });

    closeSearch?.addEventListener("click", () => {
      searchBar?.classList.add("hidden");
      if (searchInput) searchInput.value = "";
      Products.filterByCategory("الكل");
      this.resetTabs();
    });

    searchInput?.addEventListener("input", () => {
      Products.search(searchInput.value);
    });
  },

  // 🗂️ تبويبات الكاتيجوري — ديناميكية من الشيت
  async initTabs() {
    const container = document.getElementById("tabs-container");
    if (!container) return;

    container.innerHTML = `<div class="h-9 w-16 bg-gray-200 rounded-full animate-pulse"></div>`.repeat(4);

    const categories = await API.getCategories();

    container.innerHTML = categories.map((cat, i) => `
      <button
        onclick="UI.selectTab(this, '${cat}')"
        class="tab-btn ${i === 0 ? "active-tab" : "bg-white text-gray-500 border border-gray-100"} px-5 py-2 rounded-full font-bold whitespace-nowrap text-sm transition-all"
      >${cat}</button>
    `).join("");
  },

  // 🖱️ اختيار تبويب
  selectTab(btn, cat) {
    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.remove("active-tab");
      b.classList.add("bg-white", "text-gray-500", "border", "border-gray-100");
    });
    btn.classList.add("active-tab");
    btn.classList.remove("bg-white", "text-gray-500", "border", "border-gray-100");
    Products.filterByCategory(cat);
  },

  // 🔄 إعادة تعيين التبويبات للكل
  resetTabs() {
    const firstTab = document.querySelector(".tab-btn");
    if (firstTab) this.selectTab(firstTab, "الكل");
  },

  // 🛒 فتح مودال الـ Checkout
  openCheckout() {
    Cart.updateUI();
    document.getElementById("checkoutModal")?.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  // ❌ إغلاق مودال الـ Checkout
  closeCheckout() {
    document.getElementById("checkoutModal")?.classList.remove("active");
    document.body.style.overflow = "";
  },

  // 🏷️ ملء بيانات العميل المحفوظة
  fillSavedCustomerData() {
    const nameEl    = document.getElementById("cust-name");
    const phoneEl   = document.getElementById("cust-phone");
    const addressEl = document.getElementById("cust-address");
    if (nameEl)    nameEl.value    = localStorage.getItem(CONFIG.STORAGE_KEYS.NAME)    || "";
    if (phoneEl)   phoneEl.value   = localStorage.getItem(CONFIG.STORAGE_KEYS.PHONE)   || "";
    if (addressEl) addressEl.value = localStorage.getItem(CONFIG.STORAGE_KEYS.ADDRESS) || "";
  },

  // 📢 تحديث إعلانات الـ Slider
  updatePromos(settings) {
    const freeDeliveryEl = document.getElementById("promo-free-delivery");
    if (freeDeliveryEl) {
      freeDeliveryEl.textContent = `للطلبات فوق ${CONFIG.FREE_DELIVERY_MIN} جنيه`;
    }
  },

  // 🟢 تحديث زرار الواتساب
  updateWhatsappBtn(number) {
    const btn = document.getElementById("whatsappBtn");
    if (btn && number) btn.href = `https://wa.me/${number}`;
  },

  // 🏥 تحديث حالة الصيدلية (مفتوح/مغلق)
  updatePharmacyStatus(status) {
    const indicator = document.getElementById("pharmacy-status");
    if (!indicator) return;
    if (status === "Open") {
      indicator.textContent = "مفتوح الآن";
      indicator.className = "text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold";
    } else {
      indicator.textContent = "مغلق حالياً";
      indicator.className = "text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold";
    }
  },
};
