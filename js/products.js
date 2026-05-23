// ============================================================
//  products.js — عرض المنتجات، فلترة، بحث
// ============================================================

const Products = {
  all: [],
  filtered: [],

  // 📦 تحميل المنتجات من الـ API
  async load() {
    this.showSkeleton();
    try {
      this.all = await API.getProducts();
      this.filtered = this.all;
      this.render(this.all);
    } catch (e) {
      this.showError();
    }
  },

  // 🖼️ تحديد رابط الصورة
  _getImageSrc(image) {
    if (!image) return "images/products/default.avif";
    if (image.startsWith("http")) return image;
    return `images/products/${image}`;
  },

  // 🎨 رسم المنتجات على الشاشة
  render(list) {
    const container = document.getElementById("products-list");
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="col-span-2 text-center py-16 text-gray-400">
          <i class="fas fa-search text-4xl mb-3 block opacity-30"></i>
          <p class="font-bold">مفيش منتجات في النتيجة دي</p>
        </div>`;
      return;
    }

    container.innerHTML = list.map(item => `
      <div class="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center relative active:scale-95 transition-transform duration-150">

        ${item.Stock == 0 ? `<div class="absolute top-2 right-2 bg-red-100 text-red-500 text-[9px] font-bold px-2 py-1 rounded-full">نفذ</div>` : ""}

        <img
          src="${this._getImageSrc(item.Image)}"
          alt="${item.Name}"
          class="w-full h-24 object-contain mb-2 mt-2 rounded-lg"
          onerror="this.src='images/products/default.avif'"
        >

        <h3 class="font-bold text-xs text-gray-800 text-center w-full leading-tight mb-1 line-clamp-2">${item.Name}</h3>

        ${item.Description ? `<p class="text-[10px] text-gray-400 text-center w-full truncate mb-1">${item.Description}</p>` : ""}

        <div class="flex justify-between items-center w-full mt-auto pt-2 border-t border-gray-50">
          <p class="text-blue-600 font-bold text-sm">${item.Price} ج.م</p>
          <button
            onclick="Products.addToCart('${item.ID}', '${item.Name}', ${item.Price}, ${item.Stock}, this)"
            class="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform ${item.Stock == 0 ? 'opacity-40 cursor-not-allowed' : ''}"
            ${item.Stock == 0 ? "disabled" : ""}
          >
            <i class="fas fa-plus text-xs"></i>
          </button>
        </div>
      </div>
    `).join("");
  },

  // ➕ إضافة للسلة من بطاقة المنتج
  addToCart(id, name, price, stock, btn) {
    if (stock == 0) return;
    Cart.add({ id: String(id), name, price: Number(price) });

    if (btn) {
      btn.innerHTML = `<i class="fas fa-check text-xs"></i>`;
      btn.classList.replace("bg-blue-600", "bg-green-500");
      setTimeout(() => {
        btn.innerHTML = `<i class="fas fa-plus text-xs"></i>`;
        btn.classList.replace("bg-green-500", "bg-blue-600");
      }, 700);
    }
  },

  // 🔍 بحث في المنتجات
  search(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filtered = this.all;
    } else {
      this.filtered = this.all.filter(p =>
        p.Name.toLowerCase().includes(q) ||
        (p.Description && p.Description.toLowerCase().includes(q)) ||
        (p.Category && p.Category.includes(q))
      );
    }
    this.render(this.filtered);
  },

  // 🗂️ فلترة بالكاتيجوري
  filterByCategory(cat) {
    if (cat === "الكل") {
      this.filtered = this.all;
    } else {
      this.filtered = this.all.filter(p => p.Category === cat);
    }
    this.render(this.filtered);
  },

  // ⏳ Skeleton Loading
  showSkeleton() {
    const container = document.getElementById("products-list");
    if (!container) return;
    const skeletonCard = `
      <div class="bg-white p-3 rounded-2xl border border-gray-100 animate-pulse">
        <div class="w-full h-24 bg-gray-200 rounded-lg mb-3"></div>
        <div class="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
        <div class="flex justify-between items-center pt-2 border-t border-gray-50">
          <div class="h-4 bg-gray-200 rounded w-12"></div>
          <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </div>`;
    container.innerHTML = skeletonCard.repeat(6);
  },

  // ❌ رسالة خطأ
  showError() {
    const container = document.getElementById("products-list");
    if (!container) return;
    container.innerHTML = `
      <div class="col-span-2 text-center py-16 text-gray-400">
        <i class="fas fa-wifi text-4xl mb-3 block opacity-30"></i>
        <p class="font-bold text-sm">مش قادر يحمل المنتجات</p>
        <button onclick="Products.load()" class="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">إعادة المحاولة</button>
      </div>`;
  },
};
