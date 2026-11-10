/**
 * ShoeStyle — Gestion d'état réactive (Vanilla JS)
 * Avec support bilingue (Français / العربية)
 */
import { PRODUCTS, WILAYAS } from './data.js';
import { syncOrderToSupabase } from './supabase.js';

const STORAGE_KEYS = {
  CART: 'shoestyle_cart_v2',
  WISHLIST: 'shoestyle_wishlist_v2',
  ORDERS: 'shoestyle_orders_v2',
  LANG: 'shoestyle_lang_v1',
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

const initialLang = (function() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    if (saved === 'ar' || saved === 'fr') return saved;
  } catch {}
  return 'fr';
})();

export const store = {
  // Langue active: 'fr' | 'ar'
  lang: initialLang,

  // 'home' | 'category' | 'pdp' | 'cart' | 'checkout' | 'confirmation' | 'wishlist' | 'account'
  currentScreen: 'home',
  previousScreen: 'home',
  activeCategory: 'Talons',
  searchQuery: '',
  searchOpen: false,
  filterPrice: 'all', // 'all' | 'under-4500' | '4500-plus'
  filterSize: 'all', // 'all' | 36 | 37 | 38 | 39 | 40
  filterColor: 'all', // 'all' | 'Rose' | 'Noir' | 'Beige' | 'Blanc' | 'Rouge'

  // Articles initiaux dans le panier (comme sur l'écran 4)
  cart: loadFromStorage(STORAGE_KEYS.CART, [
    {
      productId: 'ss-01',
      size: 37,
      color: 'Rose',
      quantity: 1,
    },
    {
      productId: 'ss-02',
      size: 38,
      color: 'Blanc',
      quantity: 1,
    },
  ]),
  wishlist: loadFromStorage(STORAGE_KEYS.WISHLIST, ['ss-01']),
  orders: loadFromStorage(STORAGE_KEYS.ORDERS, []),

  // État PDP (Fiche produit)
  activeProductId: 'ss-01',
  pdpSelectedColor: 'Rose',
  pdpSelectedSize: 37,
  pdpGalleryIndex: 0,

  selectedWilayaCode: '16',
  lastConfirmedOrder: null,
  listeners: [],

  subscribe(fn) {
    this.listeners.push(fn);
  },

  save() {
    saveToStorage(STORAGE_KEYS.CART, this.cart);
    saveToStorage(STORAGE_KEYS.WISHLIST, this.wishlist);
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, this.lang);
    } catch {}
  },

  notify() {
    this.save();
    this.listeners.forEach((fn) => fn(this));
  },

  setLanguage(newLang) {
    if (newLang !== 'fr' && newLang !== 'ar') return;
    this.lang = newLang;
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    this.notify();
  },

  toggleLanguage() {
    this.setLanguage(this.lang === 'fr' ? 'ar' : 'fr');
  },

  navigate(screen, options = {}) {
    if (screen !== this.currentScreen) {
      this.previousScreen = this.currentScreen;
    }
    this.currentScreen = screen;
    if (options.category) {
      this.activeCategory = options.category;
    }
    if (options.productId) {
      this.activeProductId = options.productId;
      const prod = PRODUCTS.find((p) => p.id === options.productId);
      if (prod) {
        this.pdpSelectedColor = prod.colors[0] || 'Rose';
        this.pdpSelectedSize = prod.sizes.includes(37) ? 37 : prod.sizes[0];
        this.pdpGalleryIndex = 0;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  },

  goBack() {
    if (this.currentScreen === 'checkout') {
      this.navigate('cart');
    } else if (this.currentScreen === 'pdp') {
      this.navigate(this.previousScreen === 'category' ? 'category' : 'home');
    } else {
      this.navigate('home');
    }
  },

  getActiveProduct() {
    return (
      PRODUCTS.find((p) => p.id === this.activeProductId) || PRODUCTS[0]
    );
  },

  toggleWishlist(productId, silent = false) {
    const idx = this.wishlist.indexOf(productId);
    let added = false;
    if (idx === -1) {
      this.wishlist.push(productId);
      added = true;
    } else {
      this.wishlist.splice(idx, 1);
    }
    if (silent) {
      this.save();
    } else {
      this.notify();
    }
    return added;
  },

  isWishlisted(productId) {
    return this.wishlist.includes(productId);
  },

  addToCart(productId, size, color, quantity = 1, silent = false) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return null;

    const chosenSize = Number(size || (product.sizes.includes(37) ? 37 : product.sizes[0]));
    const chosenColor = color || product.colors[0];

    const existing = this.cart.find(
      (item) =>
        item.productId === productId &&
        item.size === chosenSize &&
        item.color === chosenColor
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        productId,
        size: chosenSize,
        color: chosenColor,
        quantity,
      });
    }
    if (silent) {
      this.save();
    } else {
      this.notify();
    }
    return { product, size: chosenSize, color: chosenColor };
  },

  updateCartQuantity(index, delta) {
    const item = this.cart[index];
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart.splice(index, 1);
    }
    this.notify();
  },

  clearCart() {
    this.cart = [];
    this.notify();
  },

  getCartDetails() {
    const items = this.cart
      .map((item, index) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          ...item,
          index,
          product,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter(Boolean);

    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const wilaya =
      WILAYAS.find((w) => w.code === this.selectedWilayaCode) || WILAYAS[0];
    const shippingFee = subtotal === 0 ? 0 : wilaya.fee;
    const total = subtotal + shippingFee;

    return {
      items,
      totalCount,
      subtotal,
      shippingFee,
      total,
      wilaya,
    };
  },

  submitOrder({ fullName, phone, wilayaCode, address }) {
    const details = this.getCartDetails();
    if (details.items.length === 0) return null;

    const orderNumber = 'SS-' + Math.floor(1000 + Math.random() * 9000);
    const wilayaObj =
      WILAYAS.find((w) => w.code === wilayaCode) || details.wilaya;

    const wilayaLabel = this.lang === 'ar' ? wilayaObj.name_ar : wilayaObj.name_fr;

    const itemsSummary = details.items
      .map(
        (item) =>
          `${this.lang === 'ar' ? item.product.name_ar : item.product.name_fr} (${this.lang === 'ar' ? 'مقاس' : 'Pointure'} ${item.size} × ${item.quantity})`
      )
      .join(' + ');

    const newOrder = {
      id: orderNumber,
      date: new Date().toISOString().slice(0, 10),
      fullName,
      phone,
      wilaya: `${wilayaObj.code} - ${wilayaLabel}`,
      address,
      itemsSummary,
      customer: {
        fullName,
        phone,
        wilaya: wilayaLabel,
        address,
      },
      items: details.items.map((item) => ({
        name: this.lang === 'ar' ? item.product.name_ar : item.product.name_fr,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal: details.subtotal,
      shippingFee: details.shippingFee,
      total: details.total,
      status: 'new',
    };

    this.orders.unshift(newOrder);
    this.cart = [];
    this.lastConfirmedOrder = newOrder;
    this.currentScreen = 'confirmation';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
    syncOrderToSupabase(newOrder);
    return newOrder;
  },
};
