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
            ${imgSrc ? `
            <div class="absolute inset-0">
              <img src="${imgSrc}" class="w-full h-full object-cover"
                onerror="this.parentElement.parentElement.classList.add('bg-gradient-to-br','${color}')">
            </div>` : `<div class="absolute inset-0 bg-gradient-to-br ${color}"></div>`}
            <div class="absolute inset-0" style="background:linear-gradient(to left,rgba(0,0,0,0.65) 40%,transparent 100%);"></div>
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
      UI.showHome();
    });
    searchInput?.addEventListener("input", () => {
      Products.search(searchInput.value);
    });
  },

  // ══════════════════════════════════════
  //  🗂️ كروت الأقسام — الصفحة الرئيسية
  // ══════════════════════════════════════

  // ألوان الأقسام
  _catColors: [
    { bg: "from-blue-500 to-blue-700",    light: "bg-blue-50",   text: "text-blue-600" },
    { bg: "from-pink-500 to-rose-600",    light: "bg-pink-50",   text: "text-pink-600" },
    { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50",text: "text-emerald-600" },
    { bg: "from-amber-500 to-orange-600", light: "bg-amber-50",  text: "text-amber-600" },
    { bg: "from-violet-500 to-purple-700",light: "bg-violet-50", text: "text-violet-600" },
    { bg: "from-cyan-500 to-sky-600",     light: "bg-cyan-50",   text: "text-cyan-600" },
  ],

  // رسم كروت الأقسام
  async initCategoryCards() {
    const container = document.getElementById("categories-grid");
    if (!container) return;

    // Skeleton
    container.innerHTML = Array(4).fill(`
      <div class="bg-gray-100 rounded-3xl animate-pulse" style="height:140px"></div>
    `).join("");

    try {
      const res  = await fetch(`${CONFIG.API_URL}?sheet=Categories`);
      const cats = await res.json();
      const active = cats.filter(c => c.Active === true || c.Active === "TRUE" || c.Active === "true");

      container.innerHTML = active.map((cat, i) => {
        const color   = this._catColors[i % this._catColors.length];
        const imgSrc  = cat.Image || "";
        const count   = Products.all.filter(p => p.Category === cat.Name).length;

        return `
        <div onclick="UI.openCategory('${cat.Name}')"
          class="relative rounded-3xl overflow-hidden shadow-md active:scale-95 transition-transform cursor-pointer"
          style="height:140px">

          <!-- الخلفية — صورة أو gradient -->
          ${imgSrc ? `
          <img src="${imgSrc}" class="absolute inset-0 w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          ` : `
          <div class="absolute inset-0 bg-gradient-to-br ${color.bg}"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          `}

          <!-- المحتوى -->
          <div class="absolute inset-0 flex flex-col justify-end p-4">
            <h3 class="font-black text-white text-base leading-tight">${cat.Name}</h3>
            <p class="text-white/70 text-xs mt-0.5">${count} منتج</p>
          </div>

          <!-- سهم -->
          <div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <i class="fas fa-chevron-left text-white text-xs"></i>
          </div>
        </div>`;
      }).join("");

    } catch(e) {
      container.innerHTML = `<p class="col-span-2 text-center text-gray-400 text-sm py-8">تعذّر تحميل الأقسام</p>`;
    }
  },

  // فتح قسم معين
  openCategory(catName) {
    // أظهر صفحة القسم واخفي الرئيسية
    document.getElementById("home-view").classList.add("hidden");
    document.getElementById("category-view").classList.remove("hidden");

    // اسم القسم في الهيدر
    document.getElementById("category-title").textContent = catName;

    // فلتر المنتجات
    Products.filterByCategory(catName);

    // فعّل التبويب الصح في شريط الأقسام الداخلي
    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.remove("active-tab");
      b.classList.add("bg-white","text-gray-500","border","border-gray-100");
      if (b.dataset.cat === catName) {
        b.classList.add("active-tab");
        b.classList.remove("bg-white","text-gray-500","border","border-gray-100");
      }
    });

    window.scrollTo(0, 0);
  },

  // الرجوع للصفحة الرئيسية
  showHome() {
    document.getElementById("category-view").classList.add("hidden");
    document.getElementById("home-view").classList.remove("hidden");
    window.scrollTo(0, 0);
  },

  // 🗂️ شريط الأقسام الداخلي (داخل صفحة القسم)
  async initTabs() {
    const container = document.getElementById("tabs-container");
    if (!container) return;

    container.innerHTML = `<div class="h-9 w-16 bg-gray-200 rounded-full animate-pulse"></div>`.repeat(4);

    const categories = await API.getCategories();

    container.innerHTML = categories.map((cat, i) => `
      <button
        data-cat="${cat}"
        onclick="UI.selectTab(this, '${cat}')"
        class="tab-btn ${i === 0 ? "active-tab" : "bg-white text-gray-500 border border-gray-100"} px-5 py-2 rounded-full font-bold whitespace-nowrap text-sm transition-all"
      >${cat}</button>
    `).join("");
  },

  // اختيار تبويب
  selectTab(btn, cat) {
    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.remove("active-tab");
      b.classList.add("bg-white","text-gray-500","border","border-gray-100");
    });
    btn.classList.add("active-tab");
    btn.classList.remove("bg-white","text-gray-500","border","border-gray-100");

    if (cat === "الكل") {
      document.getElementById("category-title").textContent = "كل المنتجات";
    } else {
      document.getElementById("category-title").textContent = cat;
    }
    Products.filterByCategory(cat);
  },

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

  // 🏥 تحديث حالة الصيدلية
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
