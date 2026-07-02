// ============================================================
//  ui.js — Slider, Modals, Tabs, Search, Promos
// ============================================================

const UI = {

  // 🎠 تشغيل الـ Swiper Slider (fallback لو مفيش عروض)
  initSlider() {
    if (typeof Swiper === "undefined") return;
    if (window.swiperInstance) return; // منع التكرار
    window.swiperInstance = new Swiper(".mySwiper", {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
    });
  },

  // 🛍️ تحميل منتجات العروض في الـ Slider — مع تحسين LCP
  async loadPromoSlider() {
    const wrapper = document.getElementById("swiper-wrapper");
    if (!wrapper) return;
    try {
      const all    = await API.getProducts();
      const promos = all.filter(p => p.Category === "العروض");
      if (promos.length === 0) { this.initSlider(); return; }

      const colors = [
        "from-blue-600 to-blue-800",
        "from-emerald-500 to-teal-700",
        "from-violet-600 to-purple-800",
        "from-rose-500 to-pink-700",
        "from-orange-500 to-amber-700",
      ];

      // ✅ تحسين LCP: أول سلايد بدون lazy + fetchpriority high
      wrapper.innerHTML = promos.map((item, i) => {
        const color  = colors[i % colors.length];
        const imgSrc = item.Image
          ? (item.Image.startsWith("http") ? item.Image : `images/products/${item.Image}`)
          : "";
        const isFirst = i === 0;

        return `
        <div class="swiper-slide cursor-pointer"
          onclick="UI._openPromoCategory()">
          <div class="h-36 flex items-center overflow-hidden relative rounded-2xl active:scale-[0.99] transition-transform">
            ${imgSrc ? `
            <div class="absolute inset-0">
              <img src="${imgSrc}"
                alt="${item.Name}"
                class="w-full h-full object-cover"
                ${isFirst ? 'fetchpriority="high"' : 'loading="lazy"'}
                onerror="this.parentElement.parentElement.classList.add('bg-gradient-to-br','${color}');this.remove()">
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

      // ✅ تحسين Swiper: destroy الأول لو موجود
      if (window.swiperInstance) {
        window.swiperInstance.destroy(true, true);
        window.swiperInstance = null;
      }

      // ✅ requestAnimationFrame لتأجيل تشغيل Swiper بعد رسم الـ DOM
      requestAnimationFrame(() => {
        window.swiperInstance = new Swiper(".mySwiper", {
          slidesPerView: 1,
          spaceBetween: 16,
          loop: promos.length > 1,
          autoplay: { delay: 4000, disableOnInteraction: false },
          pagination: { el: ".swiper-pagination", clickable: true },
          // ✅ تحسين CLS: ارتفاع ثابت
          autoHeight: false,
        });
      });

    } catch (e) {
      console.warn("فشل تحميل عروض الـ Slider", e);
      this.initSlider();
    }
  },

  // ✅ helper: فتح قسم العروض مع smooth scroll
  _openPromoCategory() {
    UI.openCategory("العروض");
    setTimeout(() => {
      const listEl = document.getElementById("products-list");
      if (listEl) listEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  },

  // 🔍 تشغيل البحث — مع Debounce
  initSearch() {
    const searchBar   = document.getElementById("search-bar");
    const searchInput = document.getElementById("search-input");
    const searchBtn   = document.getElementById("search-btn");
    const closeSearch = document.getElementById("close-search");

    // ✅ Debounce: ينتظر 300ms بعد آخر حرف قبل ما يبحث
    let _debounceTimer = null;
    const _debounce = (fn, delay) => {
      clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(fn, delay);
    };

    searchBtn?.addEventListener("click", () => {
      searchBar?.classList.remove("hidden");
      searchInput?.focus();
    });

    closeSearch?.addEventListener("click", () => {
      searchBar?.classList.add("hidden");
      if (searchInput) searchInput.value = "";
      clearTimeout(_debounceTimer);
      UI.showHome();
    });

    searchInput?.addEventListener("input", () => {
      _debounce(() => Products.search(searchInput.value), 300);
    });
  },

  // ══════════════════════════════════════
  //  🗂️ كروت الأقسام — الصفحة الرئيسية
  // ══════════════════════════════════════

  _catColors: [
    { bg: "from-blue-500 to-blue-700",     light: "bg-blue-50",    text: "text-blue-600" },
    { bg: "from-pink-500 to-rose-600",     light: "bg-pink-50",    text: "text-pink-600" },
    { bg: "from-emerald-500 to-teal-600",  light: "bg-emerald-50", text: "text-emerald-600" },
    { bg: "from-amber-500 to-orange-600",  light: "bg-amber-50",   text: "text-amber-600" },
    { bg: "from-violet-500 to-purple-700", light: "bg-violet-50",  text: "text-violet-600" },
    { bg: "from-cyan-500 to-sky-600",      light: "bg-cyan-50",    text: "text-cyan-600" },
  ],

  // رسم كروت الأقسام — مع lazy loading
  async initCategoryCards() {
    const container = document.getElementById("categories-grid");
    if (!container) return;

    // Skeleton لمنع CLS
    container.innerHTML = Array(4).fill(`
      <div class="bg-gray-100 rounded-3xl animate-pulse" style="height:140px"></div>
    `).join("");

    try {
      const res    = await fetch(`${CONFIG.API_URL}?sheet=Categories`);
      const cats   = await res.json();
      const active = cats.filter(c => c.Active === true || c.Active === "TRUE" || c.Active === "true");

      // ✅ بناء الـ HTML في متغير أولاً ثم ندفعه مرة واحدة (تقليل Repaint)
      const html = active.map((cat, i) => {
        const color  = this._catColors[i % this._catColors.length];
        const imgSrc = cat.Image || "";
        const count  = Products.all.filter(p => p.Category === cat.Name).length;

        return `
        <div onclick="UI.openCategory('${cat.Name}')"
          class="relative rounded-3xl overflow-hidden shadow-md active:scale-95 transition-transform cursor-pointer"
          style="height:140px">

          ${imgSrc ? `
          <img src="${imgSrc}"
            alt="${cat.Name}"
            loading="lazy"
            decoding="async"
            class="absolute inset-0 w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          ` : `
          <div class="absolute inset-0 bg-gradient-to-br ${color.bg}"></div>
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          `}

          <div class="absolute inset-0 flex flex-col justify-end p-4">
            <h3 class="font-black text-white text-base leading-tight">${cat.Name}</h3>
            <p class="text-white/70 text-xs mt-0.5">${count} منتج</p>
          </div>

          <div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <i class="fas fa-chevron-left text-white text-xs"></i>
          </div>
        </div>`;
      }).join("");

      // ✅ دفعة واحدة للـ DOM
      container.innerHTML = html;

    } catch(e) {
      container.innerHTML = `<p class="col-span-2 text-center text-gray-400 text-sm py-8">تعذّر تحميل الأقسام</p>`;
    }
  },

  // فتح قسم معين
  openCategory(catName) {
    document.getElementById("home-view").classList.add("hidden");
    document.getElementById("category-view").classList.remove("hidden");
    document.getElementById("category-title").textContent = catName;

    Products.filterByCategory(catName);

    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.remove("active-tab");
      b.classList.add("bg-white", "text-gray-500", "border", "border-gray-100");
      if (b.dataset.cat === catName) {
        b.classList.add("active-tab");
        b.classList.remove("bg-white", "text-gray-500", "border", "border-gray-100");
      }
    });

    // ✅ smooth scroll للأعلى
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // الرجوع للصفحة الرئيسية
  showHome() {
    document.getElementById("category-view").classList.add("hidden");
    document.getElementById("home-view").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // 🗂️ شريط الأقسام الداخلي — مع Sticky
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

    // ✅ Sticky: شريط الأقسام يثبت أثناء السكرول
    this._initStickyTabs(container);
  },

  // ✅ Sticky tabs بـ IntersectionObserver (أداء أفضل من scroll event)
  _initStickyTabs(container) {
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "height:1px;margin-top:-1px;";
    container.parentElement?.insertBefore(sentinel, container);

    const observer = new IntersectionObserver(
      ([entry]) => {
        container.classList.toggle("shadow-md", !entry.isIntersecting);
        container.classList.toggle("bg-white/95", !entry.isIntersecting);
        container.classList.toggle("backdrop-blur", !entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-56px 0px 0px 0px" }
    );
    observer.observe(sentinel);
  },

  // اختيار تبويب
  selectTab(btn, cat) {
    document.querySelectorAll(".tab-btn").forEach(b => {
      b.classList.remove("active-tab");
      b.classList.add("bg-white", "text-gray-500", "border", "border-gray-100");
    });
    btn.classList.add("active-tab");
    btn.classList.remove("bg-white", "text-gray-500", "border", "border-gray-100");

    // ✅ scroll التاب النشط للمنتصف
    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });

    document.getElementById("category-title").textContent =
      cat === "الكل" ? "كل المنتجات" : cat;

    Products.filterByCategory(cat);
  },

  resetTabs() {
    const firstTab = document.querySelector(".tab-btn");
    if (firstTab) this.selectTab(firstTab, "الكل");
  },

  // 🛒 فتح/إغلاق مودال الـ Checkout
  openCheckout() {
    Cart.updateUI();
    document.getElementById("checkoutModal")?.classList.add("active");
    document.body.style.overflow = "hidden";
  },

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
      indicator.className   = "text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-bold";
    } else {
      indicator.textContent = "مغلق حالياً";
      indicator.className   = "text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold";
    }
  },

  // 🎁 التحقق من وجود عرض منبثق
  async checkPopupPromo() {
    const modal    = document.getElementById("popup-promo-modal");
    const body     = document.getElementById("popup-promo-body");
    const closeBtn = document.getElementById("close-popup-promo");
    if (!modal || !body) return;

    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      modal.classList.add("hidden");
    });

    try {
      const res  = await fetch(`${CONFIG.API_URL}?sheet=PopupPromo`);
      const data = await res.json();
      const promo = data.find(p => p.Active === true || p.Active === "TRUE" || p.Active === "true");
      if (!promo) return;

      const imgSrc = promo.Image
        ? (promo.Image.startsWith("http") ? promo.Image : `images/products/${promo.Image}`)
        : "images/products/default.avif";

      // ✅ lazy loading لصورة البوب أب (مش LCP)
      body.innerHTML = `
        <div class="relative">
          <img src="${imgSrc}"
            alt="${promo.Name || 'عرض خاص'}"
            loading="lazy"
            decoding="async"
            class="w-full h-auto object-cover max-h-[380px]">
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 text-right pt-16">
            <span class="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-bold mb-1.5 inline-block">🔥 عرض حصري الآن</span>
            <h3 class="font-black text-white text-base leading-tight">${promo.Name || ''}</h3>
            <p class="text-white/80 text-[11px] mt-1 font-medium">اضغط هنا للشراء والانتقال لقسم العروض مباشرة 🛒</p>
          </div>
        </div>
      `;

      body.onclick = () => {
        modal.classList.add("hidden");
        UI._openPromoCategory();
      };

      setTimeout(() => {
        modal.classList.remove("hidden");
        modal.firstElementChild?.classList.replace("scale-95", "scale-100");
      }, 1500);

    } catch (e) {
      console.warn("فشل جلب العرض المنبثق للرئيسية", e);
    }
  },

};
