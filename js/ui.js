// ============================================================
//  ui.js — Slider, Modals, Tabs, Search, Promos & Navigation
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
  //  🗺️ نظام التنقل والتبديل بين الشاشات
  // ══════════════════════════════════════

  // 🏠 الانتقال للرئيسية والطلوع لأول الصفحة
  navigateToHome() {
    document.getElementById("category-view").classList.add("hidden");
    document.getElementById("contact-view").classList.add("hidden");
    document.getElementById("home-view").classList.remove("hidden");

    // تحديث ألوان الأزرار في النبار السفلي
    document.getElementById("nav-home").className = "flex flex-col items-center text-blue-600 cursor-pointer";
    document.getElementById("nav-contact").className = "flex flex-col items-center text-gray-400 cursor-pointer";

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // 📞 الانتقال لصفحة تواصل معنا
  navigateToContact() {
    document.getElementById("home-view").classList.add("hidden");
    document.getElementById("category-view").classList.add("hidden");
    document.getElementById("contact-view").classList.remove("hidden");

    // تحديث ألوان الأزرار في النبار السفلي
    document.getElementById("nav-home").className = "flex flex-col items-center text-gray-400 cursor-pointer";
    document.getElementById("nav-contact").className = "flex flex-col items-center text-blue-600 cursor-pointer";

    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // 🔗 مشاركة التطبيق عبر الـ Web Share API
  async shareApp() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'صيدليات د. هاني فاروق',
          text: 'اطلب أدويتك ومستحضراتك الطبية بسهولة عبر تطبيق صيدلية د. هاني فاروق الحصري وتوصيل مجاني وسريع للطلبات!',
          url: 'https://hany-farouk-pharm.vercel.app/'
        });
      } catch (err) {
        console.log('تم إلغاء المشاركة أو حدث خطأ:', err);
      }
    } else {
      // Fallback في حالة المتصفح لا يدعم الخاصية
      const shareUrl = 'https://hany-farouk-pharm.vercel.app/';
      navigator.clipboard.writeText(shareUrl);
      alert('تم نسخ رابط التطبيق بنجاح! يمكنك الآن إرساله لأصدقائك 📱');
    }
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
    document.getElementById("contact-view").classList.add("hidden");
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

    // إعادة ضبط تفعيل النبار ليبقى على الأقسام التابعة للرئيسية
    document.getElementById("nav-home").className = "flex flex-col items-center text-blue-600 cursor-pointer";
    document.getElementById("nav-contact").className = "flex flex-col items-center text-gray-400 cursor-pointer";

    // ✅ smooth scroll للأعلى
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // الرجوع للصفحة الرئيسية
  showHome() {
    document.getElementById("category-view").classList.add("hidden");
    document.getElementById("contact-view").classList.add("hidden");
    document.getElementById("home-view").classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  // 🗂️ شريط الأقسام الداخلي — مع Floating Bar
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

    // ✅ Floating bar يظهر عند السكرول
    this._initFloatingTabs(container, categories);
  },

  // ✅ Floating Tabs Bar — يظهر عند السكرول بتصميم glassmorphism
  _initFloatingTabs(container, categories) {
    // إنشاء الـ floating bar
    const bar = document.createElement("div");
    bar.id = "floating-tabs-bar";
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 45;
      padding: 10px 16px;
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(2,132,199,0.12);
      box-shadow: 0 4px 24px rgba(2,132,199,0.13), 0 1.5px 6px rgba(0,0,0,0.07);
      transform: translateY(-110%);
      transition: transform 0.35s cubic-bezier(0.34,1.4,0.64,1), opacity 0.3s ease;
      opacity: 0;
    `;

    // شريط اللون العلوي
    bar.innerHTML = `
      <div style="
        position:absolute; top:0; left:0; right:0; height:3px;
        background: linear-gradient(to left, #0284c7, #06b6d4, #0284c7);
        background-size: 200% 100%;
        animation: shimmerBar 2.5s linear infinite;
      "></div>
      <div id="floating-tabs-inner"
        style="display:flex; gap:8px; overflow-x:auto; scrollbar-width:none; -ms-overflow-style:none; padding-bottom:2px;">
      </div>
      <style>
        #floating-tabs-inner::-webkit-scrollbar { display:none; }
        @keyframes shimmerBar {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .ftab-btn {
          flex-shrink: 0;
          padding: 6px 16px;
          border-radius: 999px;
          font-family: 'Cairo', sans-serif;
          font-weight: 700;
          font-size: 12px;
          white-space: nowrap;
          border: 1.5px solid #e5e7eb;
          background: white;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .ftab-btn:active { transform: scale(0.93); }
        .ftab-btn.ftab-active {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(2,132,199,0.4);
          transform: scale(1.04);
        }
      </style>
    `;

    document.body.appendChild(bar);

    // ملء الأزرار
    const inner = bar.querySelector("#floating-tabs-inner");
    inner.innerHTML = categories.map((cat, i) => `
      <button
        class="ftab-btn ${i === 0 ? "ftab-active" : ""}"
        data-fcat="${cat}"
        onclick="UI._selectFloatingTab(this, '${cat}')"
      >${cat}</button>
    `).join("");

    // IntersectionObserver لإظهار/إخفاء الـ bar
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "height:1px;pointer-events:none;";
    container.parentElement?.insertBefore(sentinel, container);

    let _visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      const shouldShow = !entry.isIntersecting;
      if (shouldShow === _visible) return;
      _visible = shouldShow;
      if (shouldShow) {
        bar.style.transform = "translateY(0)";
        bar.style.opacity   = "1";
      } else {
        bar.style.transform = "translateY(-110%)";
        bar.style.opacity   = "0";
      }
    }, { threshold: 0, rootMargin: "-60px 0px 0px 0px" });

    observer.observe(sentinel);
  },

  // اختيار تاب في الـ floating bar
  _selectFloatingTab(btn, cat) {
    // sync مع الشريط الرئيسي
    const mainBtn = document.querySelector(`.tab-btn[data-cat="${cat}"]`);
    if (mainBtn) this.selectTab(mainBtn, cat);

    // تحديث الـ floating bar
    document.querySelectorAll(".ftab-btn").forEach(b => b.classList.remove("ftab-active"));
    btn.classList.add("ftab-active");
    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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

    // ✅ sync مع الـ floating bar
    document.querySelectorAll(".ftab-btn").forEach(b => {
      b.classList.toggle("ftab-active", b.dataset.fcat === cat);
    });
  },

  resetTabs() {
    const firstTab = document.querySelector(".tab-btn");
    if (firstTab) this.selectTab(firstTab, "الكل");
  },

    // 🛒 فتح/إغلاق مودال الـ Checkout مع حقن واجهة الدفع المطورة ديناميكياً
  openCheckout() {
    Cart.updateUI();
    
    // إدخال قسم خيارات الدفع بشكل أنيق داخل المودال إذا لم يكن موجوداً مسبقاً
    const parentForm = document.getElementById("cust-name")?.closest("form") || document.getElementById("checkoutModal")?.querySelector(".p-6");
    
    if (parentForm && !document.getElementById("payment-methods-section")) {
      const paymentHTML = `
        <div id="payment-methods-section" class="mt-5 border-t border-gray-100 pt-4 text-right">
          <label class="block text-sm font-black text-gray-700 mb-3">💵 طريقة الدفع المفضلة:</label>
          
          <div class="space-y-2">
            <!-- خيار الكاش -->
            <label class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer transition-all active:scale-[0.98]" id="label-pay-cash">
              <input type="radio" name="paymentMethod" value="cash" checked onchange="UI.handlePaymentMethodChange(this)" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
              <div class="flex items-center gap-2">
                <span class="text-base">💵</span>
                <span class="text-sm font-bold text-gray-700">نقدي عند الاستلام</span>
              </div>
            </label>

            <!-- خيار فودافون كاش -->
            <label class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all active:scale-[0.98]" id="label-pay-wallet">
              <input type="radio" name="paymentMethod" value="wallet" onchange="UI.handlePaymentMethodChange(this)" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
              <div class="flex items-center gap-2">
                <span class="text-base">📱</span>
                <span class="text-sm font-bold text-gray-700">${CONFIG.PAYMENT_METHODS.VODAFONE.label}</span>
              </div>
            </label>

            <!-- خيار إنستا باي -->
            <label class="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all active:scale-[0.98]" id="label-pay-instapay">
              <input type="radio" name="paymentMethod" value="instapay" onchange="UI.handlePaymentMethodChange(this)" class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500">
              <div class="flex items-center gap-2">
                <span class="text-base">⚡</span>
                <span class="text-sm font-bold text-gray-700">${CONFIG.PAYMENT_METHODS.INSTAPAY.label}</span>
              </div>
            </label>
          </div>

          <!-- صندوق تفاصيل الدفع الرقمي الديناميكي -->
          <div id="payment-details-box" class="hidden mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-xl transition-all">
            <p id="payment-instruction-text" class="text-xs text-blue-900 font-medium leading-relaxed"></p>
            <div class="flex items-center justify-between bg-white border border-blue-200 rounded-lg p-2 mt-2 gap-2">
              <span id="payment-target-number" class="text-base font-black text-blue-700 font-mono tracking-wider"></span>
              <button type="button" onclick="UI.copyPaymentNumber()" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 px-3 rounded-md shadow-sm transition-all active:scale-95 flex items-center gap-1">
                <span id="copy-btn-text">نسخ الرقم</span>
                <i class="far fa-copy"></i>
              </button>
            </div>
          </div>
        </div>
      `;
      
      // نضع الخيارات فوق زر الإرسال النهائي مباشرة
      const submitBtn = parentForm.querySelector("button[type='submit']") || parentForm.lastElementChild;
      if (submitBtn) {
        submitBtn.insertAdjacentHTML('beforebegin', paymentHTML);
      } else {
        parentForm.insertAdjacentHTML('beforeend', paymentHTML);
      }
    } else if (document.getElementById("payment-methods-section")) {
      // إعادة ضبط الاختيار الافتراضي عند فتح المودال مجدداً
      const defaultRadio = document.querySelector('input[name="paymentMethod"][value="cash"]');
      if (defaultRadio) {
        defaultRadio.checked = true;
        this.handlePaymentMethodChange(defaultRadio);
      }
    }

    document.getElementById("checkoutModal")?.classList.add("active");
    document.body.style.overflow = "hidden";
  },

  // التحكم في ستايل الاختيارات وعرض صندوق الأرقام ديناميكياً
  handlePaymentMethodChange(radio) {
    const box = document.getElementById("payment-details-box");
    const instructionText = document.getElementById("payment-instruction-text");
    const targetNumber = document.getElementById("payment-target-number");
    
    // إعادة تعيين ألوان الخلفيات للبطاقات للوضع غير النشط
    document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
      const parentLabel = input.closest('label');
      if (parentLabel) {
        parentLabel.className = "flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all active:scale-[0.98]";
      }
    });

    // تمييز البطاقة النشطة حالياً خلفية رمادية خفيفة
    if (radio.checked) {
      radio.closest('label').className = "flex items-center gap-3 p-3 bg-gray-50 border border-blue-500/30 rounded-xl cursor-pointer transition-all active:scale-[0.98] ring-1 ring-blue-500/20";
    }

    // إظهار أو إخفاء صندوق التحويل الرقمي بناءً على نوع الدفع
    if (radio.value === "cash") {
      box?.classList.add("hidden");
    } else if (radio.value === "wallet") {
      box?.classList.remove("hidden");
      if (instructionText) instructionText.textContent = CONFIG.PAYMENT_METHODS.VODAFONE.instruction;
      if (targetNumber) targetNumber.textContent = CONFIG.PAYMENT_METHODS.VODAFONE.number;
    } else if (radio.value === "instapay") {
      box?.classList.remove("hidden");
      if (instructionText) instructionText.textContent = CONFIG.PAYMENT_METHODS.INSTAPAY.instruction;
      if (targetNumber) targetNumber.textContent = CONFIG.PAYMENT_METHODS.INSTAPAY.number;
    }
    
    // إعادة تعيين نص زر النسخ
    const btnText = document.getElementById("copy-btn-text");
    if (btnText) btnText.textContent = "نسخ الرقم";
  },

  // وظيفة النسخ الذكي والسرع بنقرة واحدة
  copyPaymentNumber() {
    const numberText = document.getElementById("payment-target-number")?.textContent;
    const btnText = document.getElementById("copy-btn-text");
    if (!numberText) return;

    navigator.clipboard.writeText(numberText).then(() => {
      if (btnText) {
        btnText.textContent = "تم النسخ! ✓";
        setTimeout(() => { btnText.textContent = "نسخ الرقم"; }, 2500);
      }
    }).catch(err => {
      console.error("فشل النسخ تلقائياً: ", err);
    });
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
      }, 2000);

    } catch (e) {
      console.warn("فشل جلب العرض المنبثق للرئيسية", e);
    }
  },

};
