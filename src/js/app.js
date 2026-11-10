/**
 * ShoeStyle — Step in Style
 * Contrôleur Vanilla JS avec support bilingue complet (Français / العربية)
 * et système d'animations professionnelles
 */
import {
  CATEGORIES,
  COLOR_SWATCHES,
  I18N,
  IMAGES,
  PRODUCTS,
  TESTIMONIALS,
  WILAYAS,
  formatDA,
} from './data.js';
import { store } from './state.js';
import {
  adminState,
  initAdminFromSupabase,
  openAdminDashboard,
} from './admin.js';
import { subscribeRealtimeSync } from './supabase.js';

let toastTimeout = null;
let heroSlideIndex = 0;
let heroIntervalId = null;
let scrollObserver = null;

const HERO_SLIDES = [
  {
    kicker_fr: 'Nouvelle Collection',
    kicker_ar: 'تشكيلة جديدة وحصرية',
    titleHtml_fr: 'Élégance<br />à chaque pas',
    titleHtml_ar: 'أناقة<br />في كل خطوة',
    subtitle_fr:
      'Découvrez nos sneakers tendances, escarpins vernis rose poudré, sandales fines et bottines élégantes.',
    subtitle_ar:
      'اكتشفي تشكيلة السنيكرز العصرية، أحذية الكعب الوردي اللامع، الصنادل الرقيقة والبوتينات الفخمة.',
    ctaLabel_fr: 'Découvrir',
    ctaLabel_ar: 'اكتشفي الآن',
    targetCategory: 'Talons',
    image: IMAGES.hero,
  },
  {
    kicker_fr: 'Édition Soirée & Satin',
    kicker_ar: 'تشكيلة السهرات والساتان',
    titleHtml_fr: 'Féminité<br />&amp; Raffinement',
    titleHtml_ar: 'أنوثة<br />وفخامة راقية',
    subtitle_fr:
      'Des talons galbés et confortables pensés pour sublimer chacune de vos occasions spéciales.',
    subtitle_ar:
      'أحذية كعب مريحة ومصممة بعناية لتتألقي في جميع مناسباتك وسهراتك الخاصة.',
    ctaLabel_fr: 'Voir les Talons',
    ctaLabel_ar: 'تشكيلة الكعب',
    targetCategory: 'Talons',
    image: IMAGES.talons,
  },
  {
    kicker_fr: 'Allure Citadine',
    kicker_ar: 'أناقة يومية عصرية',
    titleHtml_fr: 'Douceur<br />au Quotidien',
    titleHtml_ar: 'خفة ونعومة<br />لكل يوم',
    subtitle_fr:
      'Sneakers en cuir souple et daim rose poudré : l’alliance parfaite du style et de la légèreté.',
    subtitle_ar:
      'سنيكرز من جلد مرن ومخمل وردي ناعم: المزيج المثالي بين الراحة والجاذبية.',
    ctaLabel_fr: 'Voir les Sneakers',
    ctaLabel_ar: 'تشكيلة السنيكرز',
    targetCategory: 'Sneakers',
    image: IMAGES.sneakers,
  },
  {
    kicker_fr: 'Finesse & Légèreté',
    kicker_ar: 'رقة وانسيابية',
    titleHtml_fr: 'Brides Fines<br />&amp; Cuir Doux',
    titleHtml_ar: 'شرائط ناعمة<br />ولمسة ناعمة',
    subtitle_fr:
      'Sandales à brides croisées et ballerines Mary Jane livrées en 24h–48h sur les 58 wilayas.',
    subtitle_ar:
      'صنادل بشرائط متداخلة وباليرين ماري جين مع توصيل سريع خلال 24 إلى 48 ساعة لـ 58 ولاية.',
    ctaLabel_fr: 'Explorer',
    ctaLabel_ar: 'استكشاف التشكيلة',
    targetCategory: 'Sandales',
    image: IMAGES.sandales,
  },
];

function getT() {
  return I18N[store.lang] || I18N.fr;
}

function getArrowNext() {
  return store.lang === 'ar' ? '←' : '→';
}

function getBackIconSvg() {
  if (store.lang === 'ar') {
    return `<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />`;
  }
  return `<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />`;
}

export function showToast(message) {
  const toastEl = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-message');
  if (!toastEl || !toastText) return;

  toastText.textContent = message;
  toastEl.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
  toastEl.classList.add('opacity-100', 'translate-y-0');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
    toastEl.classList.remove('opacity-100', 'translate-y-0');
  }, 2400);
}

/**
 * Animation de particule volante vers l'icône du panier + rebond du compteur
 */
function animateFlyToCart(sourceEl) {
  if (!sourceEl) return;
  const targetCartBtn =
    document.getElementById('header-cart-trigger') ||
    document.getElementById('mobile-cart-trigger');
  if (!targetCartBtn) return;

  const startRect = sourceEl.getBoundingClientRect();
  const endRect = targetCartBtn.getBoundingClientRect();

  const orb = document.createElement('div');
  orb.className = 'ss-flying-orb';
  orb.innerHTML = '🛍️';
  orb.style.left = `${startRect.left + startRect.width / 2 - 14}px`;
  orb.style.top = `${startRect.top + startRect.height / 2 - 14}px`;
  document.body.appendChild(orb);

  const deltaX =
    endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
  const deltaY =
    endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);

  requestAnimationFrame(() => {
    orb.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.35)`;
    orb.style.opacity = '0.2';
  });

  setTimeout(() => {
    orb.remove();
    const badges = document.querySelectorAll('.ss-cart-badge');
    badges.forEach((badge) => {
      badge.classList.remove('animate-pop-spring');
      void badge.offsetWidth;
      badge.classList.add('animate-pop-spring');
    });
  }, 600);
}

/**
 * Explosion de petits cœurs roses lors de l'ajout aux favoris
 */
function spawnHeartBurst(sourceEl) {
  if (!sourceEl) return;
  const rect = sourceEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const offsets = [
    { tx: '-18px', ty: '-26px' },
    { tx: '18px', ty: '-24px' },
    { tx: '0px', ty: '-34px' },
    { tx: '-24px', ty: '-10px' },
    { tx: '24px', ty: '-12px' },
  ];

  offsets.forEach((offset) => {
    const p = document.createElement('span');
    p.className = 'ss-heart-particle';
    p.textContent = '♥';
    p.style.left = `${centerX - 6}px`;
    p.style.top = `${centerY - 8}px`;
    p.style.setProperty('--tx', offset.tx);
    p.style.setProperty('--ty', offset.ty);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 660);
  });
}

/**
 * IntersectionObserver pour révéler les sections au défilement
 */
function initScrollReveal() {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  elements.forEach((el) => scrollObserver.observe(el));
}

/**
 * SVG Logo Escarpin Rose ShoeStyle
 */
function renderHighHeelLogoSVG(sizeClass = 'w-9 h-9') {
  return `
    <svg class="${sizeClass} shrink-0 transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF5C93" />
          <stop offset="55%" stop-color="#DE1B61" />
          <stop offset="100%" stop-color="#A30E44" />
        </linearGradient>
      </defs>
      <path
        d="M52 10C48 10 44 16 39 26C33 37 25 44 15 46C9 47 6 49 6 51C6 53 10 54 18 54C29 54 37 46 44 35C46 32 48 33 48 37V53C48 54.1 48.9 55 50 55C51.1 55 52 54.1 52 53V24C54 19 55 10 52 10Z"
        fill="url(#heelGrad)"
      />
    </svg>
  `;
}

/**
 * Carte Produit ShoeStyle bilingue avec animation d'entrée en cascade
 */
function renderShoeStyleCard(product, staggerIndex = 0) {
  const wishlisted = store.isWishlisted(product.id);
  const t = getT();
  const prodName = store.lang === 'ar' ? product.name_ar : product.name_fr;

  return `
    <article
      class="ss-product-card group animate-stagger-item"
      style="--i: ${staggerIndex};"
    >
      <div
        class="ss-product-img-box cursor-pointer"
        data-action="open-pdp"
        data-id="${product.id}"
      >
        <img
          src="${product.image}"
          alt="${prodName}"
          referrerpolicy="no-referrer"
          loading="lazy"
          onerror="this.style.display='none';"
        />

        <!-- Bouton Cœur en haut à droite -->
        <button
          type="button"
          data-action="toggle-wishlist"
          data-id="${product.id}"
          class="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 active:scale-90"
          aria-label="${t.nav.wishlist}"
        >
          <svg
            class="w-4 h-4 transition-transform ${
              wishlisted
                ? 'fill-[#DE1B61] text-[#DE1B61] animate-pop-spring'
                : 'fill-none text-[#18181B]'
            }"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.9"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </button>

        <!-- Badge Réduction rose en bas à gauche (-25%, -20%, -30%) -->
        ${
          product.discountPercent > 0
            ? `<span class="absolute bottom-2.5 start-2.5 px-2.5 py-0.5 rounded-full bg-[#DE1B61] text-white text-[11px] font-bold tabular-nums shadow-xs">
                -${product.discountPercent}%
              </span>`
            : ''
        }
      </div>

      <!-- Infos produit -->
      <div class="p-3 pt-2.5 flex flex-col flex-1 justify-between">
        <div>
          <h3 class="text-[14px] sm:text-[15px] font-bold text-[#18181B] leading-snug truncate">
            <button
              type="button"
              data-action="open-pdp"
              data-id="${product.id}"
              class="text-start hover:text-[#DE1B61] transition-colors"
            >
              ${prodName}
            </button>
          </h3>

          <div class="mt-1 flex items-baseline gap-1.5 flex-wrap tabular-nums">
            <span class="text-[14px] sm:text-[15px] font-extrabold text-[#DE1B61]">
              ${formatDA(product.price, store.lang)}
            </span>
            ${
              product.originalPrice
                ? `<span class="text-[11px] sm:text-xs text-[#8E8E93] line-through">
                    ${formatDA(product.originalPrice, store.lang)}
                  </span>`
                : ''
            }
          </div>
        </div>

        <!-- Ligne Note étoile + Bouton rond panier -->
        <div class="mt-2 flex items-center justify-between">
          <div class="flex items-center gap-1 text-xs tabular-nums">
            <span class="text-[#FBBF24] text-sm">★</span>
            <span class="font-bold text-[#18181B]">${product.rating}</span>
            <span class="text-[#8E8E93]">(${product.reviewsCount})</span>
          </div>

          <button
            type="button"
            data-action="quick-add-cart"
            data-id="${product.id}"
            class="w-8 h-8 rounded-full border border-[#18181B]/25 hover:border-[#DE1B61] hover:bg-[#DE1B61] hover:text-white text-[#18181B] flex items-center justify-center transition-all hover:scale-110 active:scale-90"
            aria-label="${t.pdp.addToCart}"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="19" cy="21" r="1.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 3h2.5l2.2 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 7H6" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Barre d'en-tête dynamique selon l'écran actif
 */
function renderHeader() {
  const headerEl = document.getElementById('app-header');
  if (!headerEl) return;

  const details = store.getCartDetails();
  const screen = store.currentScreen;
  const t = getT();

  const isScrolled = (window.scrollY || 0) > 12;
  const scrollClass = isScrolled ? ' is-scrolled' : '';

  if (screen === 'pdp') {
    headerEl.innerHTML = '';
    headerEl.className = `hidden lg:block ss-smart-header${scrollClass}`;
  } else {
    headerEl.className = `ss-smart-header${scrollClass}`;
  }

  // Bouton de bascule de langue + Lien vers la page séparée Admin CMS (/admin.html)
  const langToggleBtn = `
    <a
      href="/admin.html"
      class="px-2.5 py-1 rounded-full bg-[#18181B] hover:bg-[#DE1B61] text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0 no-underline"
      title="لوحة التحكم المستقلة (Admin CMS)"
    >
      <span class="text-xs">⚙️</span>
      <span>${store.lang === 'ar' ? 'لوحة التحكم' : 'Admin CMS'}</span>
    </a>
    <button
      type="button"
      data-action="toggle-language"
      class="px-2.5 py-1 rounded-full bg-[#FCE8EE] hover:bg-[#DE1B61] text-[#DE1B61] hover:text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0"
      title="${t.switchTitle}"
    >
      <span class="text-xs">🌐</span>
      <span>${t.langBtn}</span>
    </button>
  `;

  const annBarHtml =
    adminState?.cms?.announcementEnabled && adminState?.cms?.announcementText
      ? `<div class="bg-[#DE1B61] text-white text-[11px] sm:text-xs font-bold text-center py-1.5 px-3">${adminState.cms.announcementText}</div>`
      : '';

  if (screen === 'home' || screen === 'pdp') {
    headerEl.innerHTML = `
      ${annBarHtml}
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <!-- Menu Hamburger / Catégories -->
        <button
          type="button"
          data-action="nav-screen"
          data-screen="category"
          data-category="Talons"
          class="w-10 h-10 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B] transition-transform active:scale-90"
          aria-label="${t.nav.categories}"
        >
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="7" x2="20" y2="7" stroke-linecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" stroke-linecap="round" />
            <line x1="4" y1="17" x2="15" y2="17" stroke-linecap="round" />
          </svg>
        </button>

        <!-- Logo central ShoeStyle — Step in Style -->
        <button
          type="button"
          data-action="nav-screen"
          data-screen="home"
          class="flex items-center gap-2 text-start group"
        >
          ${renderHighHeelLogoSVG('w-9 h-9')}
          <div class="leading-none">
            <span class="font-script text-3xl sm:text-[34px] font-bold text-[#18181B] tracking-tight block">
              ${adminState?.cms?.storeName || 'ShoeStyle'}
            </span>
            <span class="block text-[10px] italic text-[#71717A] tracking-wider -mt-1 text-center">
              — Step in Style —
            </span>
          </div>
        </button>

        <!-- Liens rapides Desktop bilingues -->
        <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-[#52525B]">
          <button type="button" data-action="nav-screen" data-screen="home" class="${
            screen === 'home' ? 'text-[#DE1B61]' : 'hover:text-[#18181B]'
          } transition-colors">${t.nav.home}</button>
          <button type="button" data-action="nav-screen" data-screen="category" data-category="Talons" class="hover:text-[#18181B] transition-colors">${store.lang === 'ar' ? 'كعب' : 'Talons'}</button>
          <button type="button" data-action="nav-screen" data-screen="category" data-category="Sneakers" class="hover:text-[#18181B] transition-colors">${store.lang === 'ar' ? 'سنيكرز' : 'Sneakers'}</button>
          <button type="button" data-action="nav-screen" data-screen="category" data-category="Sandales" class="hover:text-[#18181B] transition-colors">${store.lang === 'ar' ? 'صنادل' : 'Sandales'}</button>
          <button type="button" data-action="nav-screen" data-screen="category" data-category="Bottes" class="hover:text-[#18181B] transition-colors">${store.lang === 'ar' ? 'بوتين' : 'Bottes'}</button>
        </nav>

        <!-- Bouton Langue + Recherche & Sac Panier -->
        <div class="flex items-center gap-2">
          ${langToggleBtn}

          <button
            type="button"
            data-action="toggle-search"
            class="w-10 h-10 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B] transition-transform active:scale-90"
            aria-label="Recherche / بحث"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7.5" />
              <path stroke-linecap="round" d="M20 20l-3.8-3.8" />
            </svg>
          </button>

          <button
            id="header-cart-trigger"
            type="button"
            data-action="nav-screen"
            data-screen="cart"
            class="relative w-10 h-10 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B] transition-transform active:scale-90"
            aria-label="${t.nav.cart}"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span class="ss-cart-badge absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DE1B61] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              ${details.totalCount}
            </span>
          </button>
        </div>
      </div>

      ${
        store.searchOpen
          ? `<div class="max-w-6xl mx-auto px-4 pb-3 animate-screen-enter">
              <input
                id="global-search-input"
                type="search"
                value="${store.searchQuery}"
                placeholder="${t.search.placeholder}"
                class="w-full px-4 py-2 rounded-full bg-[#FDF5F7] border border-[#DE1B61]/25 text-xs text-[#18181B] focus:outline-none"
              />
            </div>`
          : ''
      }
    `;
    return;
  }

  if (screen === 'category' || screen === 'wishlist' || screen === 'account') {
    const activeCatObj = CATEGORIES.find((c) => c.id === store.activeCategory);
    const catName = activeCatObj
      ? store.lang === 'ar'
        ? activeCatObj.name_ar
        : activeCatObj.name_fr
      : t.nav.all;

    const title =
      screen === 'category'
        ? store.activeCategory === 'Tout'
          ? t.nav.all
          : catName
        : screen === 'wishlist'
        ? t.wishlist.title
        : t.account.title;

    headerEl.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          data-action="go-back"
          class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B] transition-transform active:scale-90"
          aria-label="${t.pdp.back}"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            ${getBackIconSvg()}
          </svg>
        </button>

        <h1 id="header-screen-title" class="text-base sm:text-lg font-bold text-[#18181B] animate-screen-enter">${title}</h1>

        <div class="flex items-center gap-1.5">
          ${langToggleBtn}

          <button
            type="button"
            data-action="toggle-search"
            class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
            aria-label="Recherche / بحث"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7.5" />
              <path stroke-linecap="round" d="M20 20l-3.8-3.8" />
            </svg>
          </button>

          <button
            id="header-cart-trigger"
            type="button"
            data-action="nav-screen"
            data-screen="cart"
            class="relative w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
            aria-label="${t.nav.cart}"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span class="ss-cart-badge absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#DE1B61] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              ${details.totalCount}
            </span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (screen === 'cart') {
    headerEl.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          data-action="go-back"
          class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
          aria-label="${t.pdp.back}"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            ${getBackIconSvg()}
          </svg>
        </button>

        <h1 class="text-base sm:text-lg font-bold text-[#18181B]">${t.cart.title}</h1>

        <div class="flex items-center gap-2">
          ${langToggleBtn}
          <button
            type="button"
            data-action="clear-cart"
            class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
            aria-label="${t.cart.clearCart}"
            title="${t.cart.clearCart}"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (screen === 'checkout' || screen === 'confirmation') {
    headerEl.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          data-action="go-back"
          class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
          aria-label="${t.pdp.back}"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            ${getBackIconSvg()}
          </svg>
        </button>

        <h1 class="text-base sm:text-lg font-bold text-[#18181B]">
          ${screen === 'checkout' ? t.checkout.title : t.confirmation.title}
        </h1>

        <div>${langToggleBtn}</div>
      </div>
    `;
  }
}

/**
 * ÉCRAN 1 : ACCUEIL (Home View bilingue)
 */
function renderHomeScreen() {
  const t = getT();
  const slide = HERO_SLIDES[heroSlideIndex] || HERO_SLIDES[0];
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);
  const specialOffers = PRODUCTS.filter((p) => p.isSpecialOffer).slice(0, 4);

  const slideKicker = store.lang === 'ar' ? slide.kicker_ar : slide.kicker_fr;
  const slideTitle = store.lang === 'ar' ? slide.titleHtml_ar : slide.titleHtml_fr;
  const slideSubtitle = store.lang === 'ar' ? slide.subtitle_ar : slide.subtitle_fr;
  const slideCta = store.lang === 'ar' ? slide.ctaLabel_ar : slide.ctaLabel_fr;

  return `
    <div class="max-w-6xl mx-auto animate-screen-enter">
      <!-- 1. Hero Banner ShoeStyle avec Carrousel Bilingue -->
      <section id="hero-banner-section" class="px-3 sm:px-6 pt-2 pb-4">
        <div class="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#EFE3DC] via-[#F6EAE6] to-[#FCE8EE] border border-[#DE1B61]/10 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-12 items-center min-h-[270px] sm:min-h-[340px]">
            <!-- Image Mode avec zoom Ken Burns -->
            <div class="md:col-span-7 relative h-[260px] sm:h-[340px] w-full overflow-hidden">
              <img
                id="hero-banner-img"
                src="${slide.image}"
                alt="ShoeStyle Collection"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover object-center animate-hero-zoom transition-opacity duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-[#FCE8EE]/95 md:to-transparent pointer-events-none"></div>

              <!-- Overlay Mobile -->
              <div id="hero-mobile-overlay" class="md:hidden absolute inset-y-0 end-0 w-[60%] flex flex-col items-end justify-center pe-4 text-end transition-opacity duration-300">
                <h2 id="hero-mobile-title" class="font-script text-[30px] leading-[1.08] font-bold text-[#18181B] drop-shadow-xs">
                  ${slideTitle}
                </h2>
                <span class="text-xl text-[#DE1B61] mt-1 me-2 animate-float-soft inline-block" aria-hidden="true">♡</span>
                <button
                  id="hero-mobile-cta"
                  type="button"
                  data-action="nav-screen"
                  data-screen="category"
                  data-category="${slide.targetCategory}"
                  class="mt-2.5 ss-btn-pink px-5 py-2 text-xs inline-flex items-center gap-1.5"
                >
                  <span id="hero-mobile-cta-label">${slideCta}</span>
                  <span id="hero-mobile-cta-arrow">${getArrowNext()}</span>
                </button>
              </div>
            </div>

            <!-- Texte Hero sur Desktop/Tablette -->
            <div id="hero-desktop-content" class="hidden md:flex md:col-span-5 flex-col items-start justify-center p-8 transition-opacity duration-300">
              <span id="hero-desktop-kicker" class="text-xs font-semibold uppercase tracking-widest text-[#DE1B61]">
                ${slideKicker}
              </span>
              <div class="flex items-end gap-2 mt-2">
                <h2 id="hero-desktop-title" class="font-script text-5xl font-bold text-[#18181B] leading-[1.1]">
                  ${slideTitle}
                </h2>
                <span class="text-2xl text-[#DE1B61] animate-float-soft inline-block mb-1">♡</span>
              </div>
              <p id="hero-desktop-subtitle" class="text-xs sm:text-sm text-[#52525B] mt-3 leading-relaxed">
                ${slideSubtitle}
              </p>
              <button
                id="hero-desktop-cta"
                type="button"
                data-action="nav-screen"
                data-screen="category"
                data-category="${slide.targetCategory}"
                class="mt-5 ss-btn-pink px-6 py-2.5 text-sm inline-flex items-center gap-2"
              >
                <span id="hero-desktop-cta-label">${slideCta}</span>
                <span id="hero-desktop-cta-arrow">${getArrowNext()}</span>
              </button>
            </div>
          </div>

          <!-- Points de pagination carrousel -->
          <div id="hero-dots-container" class="py-2.5 flex items-center justify-center gap-2 bg-white/65 backdrop-blur-xs">
            ${HERO_SLIDES.map(
              (_, idx) => `
              <button
                type="button"
                data-action="hero-slide"
                data-index="${idx}"
                aria-label="Diapositive ${idx + 1}"
                class="transition-all duration-300 rounded-full ${
                  idx === heroSlideIndex
                    ? 'w-5 h-2 bg-[#DE1B61]'
                    : 'w-2 h-2 bg-[#18181B]/25 hover:bg-[#18181B]/50'
                }"
              ></button>
            `
            ).join('')}
          </div>
        </div>
      </section>

      <!-- 2. Catégories Rondes bilingues -->
      <section class="px-4 sm:px-6 py-3">
        <div class="flex items-center justify-between sm:justify-around gap-3 overflow-x-auto no-scrollbar py-1">
          ${CATEGORIES.map(
            (cat, idx) => `
            <button
              type="button"
              data-action="nav-screen"
              data-screen="category"
              data-category="${cat.id}"
              style="--i: ${idx};"
              class="ss-category-btn animate-stagger-item flex flex-col items-center gap-2 shrink-0 group"
            >
              <div class="ss-category-circle">
                <img
                  src="${cat.image}"
                  alt="${store.lang === 'ar' ? cat.name_ar : cat.name_fr}"
                  referrerpolicy="no-referrer"
                  class="w-full h-full object-cover"
                />
              </div>
              <span class="text-xs sm:text-[13px] font-semibold text-[#18181B] group-hover:text-[#DE1B61] transition-colors">
                ${store.lang === 'ar' ? cat.name_ar : cat.name_fr}
              </span>
            </button>
          `
          ).join('')}
        </div>
      </section>

      <!-- 3. Section Nouveautés -->
      <section class="px-4 sm:px-6 py-5">
        <div class="flex items-center justify-between mb-3.5">
          <h2 class="text-lg sm:text-xl font-extrabold text-[#18181B]">${t.sections.newArrivals}</h2>
          <button
            type="button"
            data-action="nav-screen"
            data-screen="category"
            data-category="Tout"
            class="text-xs sm:text-sm font-semibold text-[#DE1B61] hover:underline inline-flex items-center gap-1 group"
          >
            <span>${t.nav.seeAll}</span>
            <span class="transition-transform group-hover:translate-x-1">${getArrowNext()}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          ${newArrivals.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
        </div>
      </section>

      <!-- 4. Section Meilleures Ventes -->
      <section class="px-4 sm:px-6 py-5 bg-[#FDF5F7]/70 reveal-on-scroll">
        <div class="flex items-center justify-between mb-3.5">
          <div>
            <h2 class="text-lg sm:text-xl font-extrabold text-[#18181B]">${t.sections.bestSellers}</h2>
            <p class="text-xs text-[#71717A]">${t.sections.bestSellersSub}</p>
          </div>
          <button
            type="button"
            data-action="nav-screen"
            data-screen="category"
            data-category="Talons"
            class="text-xs sm:text-sm font-semibold text-[#DE1B61] hover:underline inline-flex items-center gap-1 group"
          >
            <span>${t.nav.seeAll}</span>
            <span class="transition-transform group-hover:translate-x-1">${getArrowNext()}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          ${bestSellers.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
        </div>
      </section>

      <!-- 5. Section Offres Spéciales -->
      <section class="px-4 sm:px-6 py-5 reveal-on-scroll">
        <div class="flex items-center justify-between mb-3.5">
          <div>
            <h2 class="text-lg sm:text-xl font-extrabold text-[#18181B]">${t.sections.specialOffers}</h2>
            <p class="text-xs text-[#DE1B61] font-medium">${t.sections.specialOffersSub}</p>
          </div>
          <button
            type="button"
            data-action="nav-screen"
            data-screen="category"
            data-category="Talons"
            class="text-xs sm:text-sm font-semibold text-[#DE1B61] hover:underline inline-flex items-center gap-1 group"
          >
            <span>${t.sections.enjoy}</span>
            <span class="transition-transform group-hover:translate-x-1">${getArrowNext()}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          ${specialOffers.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
        </div>
      </section>

      <!-- 6. Avis Clientes -->
      <section class="px-4 sm:px-6 py-6 bg-[#FDF5F7] reveal-on-scroll">
        <h2 class="text-lg sm:text-xl font-extrabold text-[#18181B] mb-3.5">${t.sections.reviews}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          ${TESTIMONIALS.map(
            (item, idx) => `
            <article
              style="--i: ${idx};"
              class="animate-stagger-item bg-white p-4 rounded-2xl border border-[#DE1B61]/10 shadow-2xs transition-transform hover:-translate-y-1"
            >
              <div class="flex items-center justify-between text-xs">
                <span class="text-[#FBBF24] tracking-wider">★★★★★</span>
                <span class="text-[#71717A] font-medium">${store.lang === 'ar' ? item.city_ar : item.city_fr}</span>
              </div>
              <p class="mt-2 text-xs sm:text-sm text-[#18181B] leading-relaxed">« ${store.lang === 'ar' ? item.comment_ar : item.comment_fr} »</p>
              <div class="mt-3 pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                <strong class="text-[#18181B]">${item.name}</strong>
                <span class="text-[#DE1B61] font-medium">${store.lang === 'ar' ? item.product_ar : item.product_fr}</span>
              </div>
            </article>
          `
          ).join('')}
        </div>
      </section>

      <!-- 7. Newsletter & Footer ShoeStyle -->
      <section class="px-4 sm:px-6 py-8 text-center bg-gradient-to-b from-white to-[#FCE8EE]/60 border-t border-black/5 reveal-on-scroll">
        <div class="max-w-md mx-auto">
          <p class="font-script text-3xl text-[#DE1B61]">${t.newsletter.title}</p>
          <p class="text-xs text-[#52525B] mt-1">
            ${t.newsletter.sub}
          </p>
          <form id="newsletter-form" class="mt-4 flex gap-2">
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="${t.newsletter.placeholder}"
              class="flex-1 px-4 py-2.5 rounded-full bg-white border border-[#DE1B61]/25 text-xs"
            />
            <button type="submit" class="ss-btn-pink px-5 py-2.5 text-xs whitespace-nowrap">
              ${t.newsletter.btn}
            </button>
          </form>
        </div>

        <div class="mt-8 pt-5 border-t border-[#DE1B61]/15 flex flex-col items-center gap-1.5 text-xs text-[#71717A]">
          <p class="font-script text-2xl text-[#18181B]">
            ${t.footer.bye} <span class="text-[#DE1B61] inline-block animate-float-soft">♥</span>
          </p>
          <p>${t.footer.legal}</p>
        </div>
      </section>
    </div>
  `;
}

function getFilteredCategoryProducts() {
  let filtered = PRODUCTS.filter((p) => {
    const matchCat =
      store.activeCategory === 'Tout' || p.category === store.activeCategory;
    const matchPrice =
      store.filterPrice === 'all' ||
      (store.filterPrice === 'under-4500' && p.price <= 4500) ||
      (store.filterPrice === '4500-plus' && p.price > 4500);
    const matchSize =
      store.filterSize === 'all' || p.sizes.includes(Number(store.filterSize));
    const matchColor =
      store.filterColor === 'all' || p.colors.includes(store.filterColor);
    const q = store.searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.name_fr.toLowerCase().includes(q) ||
      p.name_ar.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    return matchCat && matchPrice && matchSize && matchColor && matchSearch;
  });

  if (
    filtered.length === 0 &&
    store.filterPrice === 'all' &&
    store.filterColor === 'all'
  ) {
    filtered = PRODUCTS;
  }

  return filtered;
}

/**
 * ÉCRAN 2 : PAGE CATÉGORIE
 */
function renderCategoryScreen() {
  const t = getT();
  const activeCatObj =
    CATEGORIES.find((c) => c.id === store.activeCategory) || CATEGORIES[1];
  const filtered = getFilteredCategoryProducts();

  const catName = store.lang === 'ar' ? activeCatObj.name_ar : activeCatObj.name_fr;
  const catSub = store.lang === 'ar' ? activeCatObj.subtitle_ar : activeCatObj.subtitle_fr;

  return `
    <div class="max-w-5xl mx-auto pb-8 animate-screen-enter">
      <!-- Bannière Catégorie -->
      <div class="relative h-44 sm:h-56 overflow-hidden bg-gradient-to-r from-[#F5E1E6] via-[#F9EBEF] to-[#F3E5E0]">
        <img
          id="cat-banner-img"
          src="${activeCatObj.image}"
          alt="${catName}"
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover object-left opacity-90 animate-hero-zoom transition-opacity duration-300"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-[#F9EBEF]/95 flex flex-col items-end justify-center pe-6 sm:pe-12 text-center">
          <div class="max-w-[200px] sm:max-w-xs animate-stagger-item" style="--i: 1;">
            <h2 id="cat-banner-title" class="font-script text-4xl sm:text-5xl font-bold text-[#18181B]">
              ${store.activeCategory === 'Tout' ? t.nav.all : catName}
            </h2>
            <p id="cat-banner-sub" class="text-xs sm:text-sm font-medium text-[#3F3F46] mt-0.5">
              ${catSub}
            </p>
            <!-- Ligne courbe rose avec petit cœur -->
            <svg class="w-28 h-4 mx-auto mt-1 text-[#DE1B61]" viewBox="0 0 120 18" fill="none">
              <path d="M4 12C35 4 75 18 108 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <circle cx="112" cy="6" r="2.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Sélecteur rapide de catégories -->
      <div class="px-4 sm:px-6 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        ${['Tout', ...CATEGORIES.map((c) => c.id)]
          .map((catId) => {
            const catObj = CATEGORIES.find((c) => c.id === catId);
            const label =
              catId === 'Tout'
                ? t.filters.allCategories
                : store.lang === 'ar'
                ? catObj?.name_ar
                : catObj?.name_fr;
            return `
            <button
              type="button"
              data-action="select-category-pill"
              data-category="${catId}"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                store.activeCategory === catId
                  ? 'bg-[#18181B] text-white scale-105 shadow-xs'
                  : 'bg-[#F5F3F4] text-[#52525B] hover:text-[#18181B]'
              }"
            >
              ${label}
            </button>
          `;
          })
          .join('')}
      </div>

      <!-- Barre de Filtres ("Filtrer", "Prix ▾", "Taille ▾", "Couleur ▾") -->
      <div class="px-4 sm:px-6 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          data-action="reset-category-filters"
          class="ss-btn-pink px-4 py-1.5 text-xs inline-flex items-center gap-1.5 shrink-0"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8" cy="6" r="2" fill="currentColor" />
            <circle cx="16" cy="12" r="2" fill="currentColor" />
            <circle cx="10" cy="18" r="2" fill="currentColor" />
          </svg>
          <span>${t.filters.filterBtn}</span>
        </button>

        <!-- Filtre Prix -->
        <select
          id="filter-price-select"
          aria-label="${t.filters.price}"
          class="px-3.5 py-1.5 rounded-full bg-[#F8EEF1] text-[#18181B] text-xs font-semibold border border-transparent focus:border-[#DE1B61] cursor-pointer shrink-0 transition-colors hover:bg-[#FCE8EE]"
        >
          <option value="all" ${store.filterPrice === 'all' ? 'selected' : ''}>${t.filters.price}</option>
          <option value="under-4500" ${store.filterPrice === 'under-4500' ? 'selected' : ''}>${t.filters.priceUnder4500}</option>
          <option value="4500-plus" ${store.filterPrice === '4500-plus' ? 'selected' : ''}>${t.filters.price4500Plus}</option>
        </select>

        <!-- Filtre Taille -->
        <select
          id="filter-size-select"
          aria-label="${t.filters.size}"
          class="px-3.5 py-1.5 rounded-full bg-[#F8EEF1] text-[#18181B] text-xs font-semibold border border-transparent focus:border-[#DE1B61] cursor-pointer shrink-0 transition-colors hover:bg-[#FCE8EE]"
        >
          <option value="all" ${store.filterSize === 'all' ? 'selected' : ''}>${t.filters.size}</option>
          ${[36, 37, 38, 39, 40]
            .map(
              (sz) =>
                `<option value="${sz}" ${
                  String(store.filterSize) === String(sz) ? 'selected' : ''
                }>${t.filters.sizePrefix} ${sz}</option>`
            )
            .join('')}
        </select>

        <!-- Filtre Couleur -->
        <select
          id="filter-color-select"
          aria-label="${t.filters.color}"
          class="px-3.5 py-1.5 rounded-full bg-[#F8EEF1] text-[#18181B] text-xs font-semibold border border-transparent focus:border-[#DE1B61] cursor-pointer shrink-0 transition-colors hover:bg-[#FCE8EE]"
        >
          <option value="all" ${store.filterColor === 'all' ? 'selected' : ''}>${t.filters.color}</option>
          ${Object.keys(COLOR_SWATCHES)
            .map((c) => {
              const label = store.lang === 'ar' ? COLOR_SWATCHES[c].label_ar : COLOR_SWATCHES[c].label_fr;
              return `<option value="${c}" ${
                store.filterColor === c ? 'selected' : ''
              }>${label}</option>`;
            })
            .join('')}
        </select>
      </div>

      <!-- Grille Produits -->
      <div id="category-products-grid" class="px-4 sm:px-6 pt-1 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        ${filtered.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
      </div>
    </div>
  `;
}

/**
 * ÉCRAN 3 : FICHE PRODUIT DÉTAILLÉE
 */
function renderPDPScreen() {
  const t = getT();
  const product = store.getActiveProduct();
  const wishlisted = store.isWishlisted(product.id);
  const galleryImages =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.image, IMAGES.hero, IMAGES.sandales, IMAGES.sneakers];
  const activeImg =
    galleryImages[store.pdpGalleryIndex % galleryImages.length] || product.image;

  const prodName = store.lang === 'ar' ? product.name_ar : product.name_fr;
  const prodDesc = store.lang === 'ar' ? product.description_ar : product.description_fr;
  const selectedColorLabel =
    COLOR_SWATCHES[store.pdpSelectedColor]
      ? store.lang === 'ar'
        ? COLOR_SWATCHES[store.pdpSelectedColor].label_ar
        : COLOR_SWATCHES[store.pdpSelectedColor].label_fr
      : store.pdpSelectedColor;

  return `
    <div class="max-w-4xl mx-auto bg-white pb-8 animate-screen-enter">
      <div class="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:p-6">
        <!-- Grande photo produit avec boutons flottants -->
        <div class="relative aspect-4/4 sm:aspect-4/3 md:aspect-square w-full bg-[#F5E8EC] md:rounded-2xl overflow-hidden">
          <img
            id="pdp-main-img"
            src="${activeImg}"
            alt="${prodName}"
            referrerpolicy="no-referrer"
            class="w-full h-full object-cover transition-opacity duration-300"
          />

          <!-- Bouton Retour en haut -->
          <button
            type="button"
            data-action="go-back"
            class="absolute top-4 start-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-[#18181B] transition-transform hover:scale-105 active:scale-90"
            aria-label="${t.pdp.back}"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              ${getBackIconSvg()}
            </svg>
          </button>

          <!-- Boutons Favoris (♡) & Partager (↑) -->
          <div class="absolute top-4 end-4 flex items-center gap-2">
            <button
              type="button"
              data-action="toggle-wishlist"
              data-id="${product.id}"
              class="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-[#18181B] transition-transform hover:scale-105 active:scale-90"
              aria-label="${t.nav.wishlist}"
            >
              <svg
                class="w-5 h-5 ${
                  wishlisted
                    ? 'fill-[#DE1B61] text-[#DE1B61] animate-pop-spring'
                    : 'fill-none text-[#18181B]'
                }"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            </button>

            <button
              type="button"
              data-action="share-product"
              class="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-sm flex items-center justify-center text-[#18181B] transition-transform hover:scale-105 active:scale-90"
              aria-label="${t.pdp.share}"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </button>
          </div>

          <!-- Points de pagination cliquables -->
          <div id="pdp-dots-container" class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/15 backdrop-blur-xs">
            ${[0, 1, 2, 3]
              .map(
                (idx) => `
                <button
                  type="button"
                  data-action="pdp-gallery-dot"
                  data-index="${idx}"
                  aria-label="Vue ${idx + 1}"
                  class="transition-all duration-300 rounded-full ${
                    store.pdpGalleryIndex === idx
                      ? 'w-4 h-2 bg-[#DE1B61]'
                      : 'w-2 h-2 bg-white/85 hover:bg-white'
                  }"
                ></button>
              `
              )
              .join('')}
          </div>
        </div>

        <!-- Détails du Produit -->
        <div class="px-5 pt-5 flex flex-col justify-between">
          <div>
            <h1 class="text-xl sm:text-2xl font-extrabold text-[#18181B] animate-stagger-item" style="--i: 1;">
              ${prodName}
            </h1>

            <!-- Étoiles + Avis -->
            <div class="mt-1.5 flex items-center gap-2 text-xs sm:text-sm tabular-nums animate-stagger-item" style="--i: 2;">
              <span class="text-[#FBBF24] tracking-tight text-base">★★★★★</span>
              <span class="font-bold text-[#18181B]">${product.rating}</span>
              <span class="text-[#71717A]">(${product.reviewsCount} ${t.pdp.reviewsLabel})</span>
            </div>

            <!-- Prix & Réduction -->
            <div class="mt-3 flex items-center justify-between gap-2 tabular-nums animate-stagger-item" style="--i: 3;">
              <div class="flex items-baseline gap-2.5">
                <span class="text-2xl sm:text-3xl font-extrabold text-[#DE1B61]">
                  ${formatDA(product.price, store.lang)}
                </span>
                ${
                  product.originalPrice
                    ? `<span class="text-sm sm:text-base text-[#71717A] line-through">
                        ${formatDA(product.originalPrice, store.lang)}
                      </span>`
                    : ''
                }
              </div>

              ${
                product.discountPercent > 0
                  ? `<span class="px-3 py-1 rounded-full bg-[#DE1B61] text-white text-xs font-bold animate-pop-spring">
                      -${product.discountPercent}%
                    </span>`
                  : ''
              }
            </div>

            <p class="mt-3 text-xs sm:text-sm text-[#52525B] leading-relaxed animate-stagger-item" style="--i: 4;">
              ${prodDesc}
            </p>

            <!-- Sélecteur de Couleur -->
            <div class="mt-5 animate-stagger-item" style="--i: 5;">
              <p class="text-xs sm:text-sm text-[#18181B]">
                <span class="font-bold">${t.pdp.colorLabel}</span> <span id="pdp-selected-color-label">${selectedColorLabel}</span>
              </p>
              <div class="mt-2.5 flex items-center gap-3">
                ${product.colors
                  .map((colorName) => {
                    const swatch = COLOR_SWATCHES[colorName];
                    const hex = swatch ? swatch.hex : '#F38BA8';
                    const isSelected = store.pdpSelectedColor === colorName;
                    return `
                      <button
                        type="button"
                        data-action="pdp-select-color"
                        data-color="${colorName}"
                        class="ss-color-swatch ${isSelected ? 'active' : 'border-black/15'}"
                        aria-label="${colorName}"
                      >
                        <span
                          class="block w-full h-full rounded-full border border-black/10"
                          style="background-color: ${hex};"
                        ></span>
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>

            <!-- Sélecteur de Taille -->
            <div class="mt-5 animate-stagger-item" style="--i: 6;">
              <p class="text-xs sm:text-sm font-bold text-[#18181B]">${t.pdp.sizeLabel}</p>
              <div class="mt-2.5 grid grid-cols-5 gap-2 max-w-xs tabular-nums">
                ${product.sizes
                  .slice(0, 5)
                  .map((size) => {
                    const isSelected = Number(store.pdpSelectedSize) === Number(size);
                    return `
                      <button
                        type="button"
                        data-action="pdp-select-size"
                        data-size="${size}"
                        class="py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                          isSelected
                            ? 'border-2 border-[#DE1B61] text-[#DE1B61] bg-[#FCE8EE]/35 animate-pop-spring'
                            : 'border-black/12 text-[#18181B] bg-white hover:border-black/30'
                        }"
                      >
                        ${size}
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>
          </div>

          <!-- Bouton Sticky Ajouter au panier -->
          <div class="mt-7 pt-3 sticky bottom-16 lg:bottom-0 bg-white">
            <button
              type="button"
              data-action="pdp-add-to-cart"
              class="w-full py-3.5 px-6 ss-btn-pink text-sm sm:text-base flex items-center justify-center gap-2.5"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1.5" />
                <circle cx="19" cy="21" r="1.5" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 3h2.5l2.2 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 7H6" />
              </svg>
              <span>${t.pdp.addToCart}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * ÉCRAN 4 : MON PANIER
 */
function renderCartScreen() {
  const t = getT();
  const details = store.getCartDetails();

  if (details.items.length === 0) {
    return `
      <div class="max-w-xl mx-auto px-4 py-16 text-center animate-screen-enter">
        <div class="w-16 h-16 rounded-full bg-[#FCE8EE] text-[#DE1B61] flex items-center justify-center mx-auto mb-4 animate-float-soft">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-[#18181B]">${t.cart.emptyTitle}</h2>
        <p class="text-xs sm:text-sm text-[#71717A] mt-1">
          ${t.cart.emptySub}
        </p>
        <button
          type="button"
          data-action="nav-screen"
          data-screen="home"
          class="mt-6 ss-btn-pink px-6 py-3 text-xs sm:text-sm"
        >
          ${t.cart.exploreBtn}
        </button>
      </div>
    `;
  }

  return `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between min-h-[calc(100vh-140px)] animate-screen-enter">
      <!-- Liste des articles du panier -->
      <div class="divide-y divide-black/8">
        ${details.items
          .map((item, idx) => {
            const wishlisted = store.isWishlisted(item.product.id);
            const prodName = store.lang === 'ar' ? item.product.name_ar : item.product.name_fr;
            const swatch = COLOR_SWATCHES[item.color];
            const colorLabel = swatch
              ? store.lang === 'ar'
                ? swatch.label_ar
                : swatch.label_fr
              : item.color;

            return `
              <div
                style="--i: ${idx};"
                class="py-4 flex gap-3.5 items-center animate-stagger-item"
              >
                <!-- Miniature carrée arrondie -->
                <img
                  src="${item.product.image}"
                  alt="${prodName}"
                  referrerpolicy="no-referrer"
                  class="w-22 h-22 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#F5F3F4] shrink-0 cursor-pointer transition-transform hover:scale-105"
                  data-action="open-pdp"
                  data-id="${item.product.id}"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h3 class="text-sm sm:text-base font-bold text-[#18181B] truncate">
                        ${prodName}
                      </h3>
                      <p class="text-xs text-[#71717A] mt-0.5">
                        ${colorLabel} · ${t.cart.sizePrefix} ${item.size}
                      </p>
                    </div>

                    <button
                      type="button"
                      data-action="toggle-wishlist"
                      data-id="${item.product.id}"
                      class="text-[#71717A] hover:text-[#DE1B61] p-1 transition-transform active:scale-90"
                      aria-label="${t.nav.wishlist}"
                    >
                      <svg
                        class="w-4 h-4 ${
                          wishlisted
                            ? 'fill-[#DE1B61] text-[#DE1B61]'
                            : 'fill-none text-current'
                        }"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.9"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        />
                      </svg>
                    </button>
                  </div>

                  <p class="mt-1 text-xs sm:text-sm font-extrabold text-[#DE1B61] tabular-nums">
                    ${formatDA(item.product.price, store.lang)}
                  </p>

                  <!-- Stepper (− 1 +) et Total Ligne à droite -->
                  <div class="mt-2 flex items-center justify-between">
                    <div class="inline-flex items-center bg-[#F5F3F4] rounded-full px-1.5 py-0.5 border border-black/8">
                      <button
                        type="button"
                        data-action="cart-qty"
                        data-index="${item.index}"
                        data-delta="-1"
                        class="w-6 h-6 text-sm font-bold text-[#18181B] hover:text-[#DE1B61] transition-transform active:scale-75"
                        aria-label="Moins"
                      >−</button>
                      <span class="px-3 text-xs font-bold tabular-nums">${item.quantity}</span>
                      <button
                        type="button"
                        data-action="cart-qty"
                        data-index="${item.index}"
                        data-delta="1"
                        class="w-6 h-6 text-sm font-bold text-[#18181B] hover:text-[#DE1B61] transition-transform active:scale-75"
                        aria-label="Plus"
                      >+</button>
                    </div>

                    <span class="text-sm sm:text-base font-extrabold text-[#18181B] tabular-nums">
                      ${formatDA(item.lineTotal, store.lang)}
                    </span>
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>

      <!-- Résumé Sous-total / Livraison / Total + Bouton Passer la commande -->
      <div class="pt-4 border-t border-black/10 space-y-2 tabular-nums animate-stagger-item" style="--i: 3;">
        <div class="flex justify-between text-xs sm:text-sm text-[#52525B]">
          <span>${t.cart.subtotal}</span>
          <span class="font-bold text-[#18181B]">${formatDA(details.subtotal, store.lang)}</span>
        </div>
        <div class="flex justify-between text-xs sm:text-sm text-[#52525B]">
          <span>${t.cart.shipping}</span>
          <span class="font-bold text-[#18181B]">${formatDA(details.shippingFee, store.lang)}</span>
        </div>
        <div class="pt-2 border-t border-black/8 flex justify-between items-baseline">
          <span class="text-base sm:text-lg font-extrabold text-[#18181B]">${t.cart.total}</span>
          <span class="text-lg sm:text-xl font-extrabold text-[#18181B]">${formatDA(details.total, store.lang)}</span>
        </div>

        <div class="pt-3">
          <button
            type="button"
            data-action="nav-screen"
            data-screen="checkout"
            class="w-full py-3.5 px-6 ss-btn-pink text-sm sm:text-base flex items-center justify-center gap-2.5"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 9V7a5 5 0 0 0-10 0v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2zm-8-2a3 3 0 0 1 6 0v2H9V7z" />
            </svg>
            <span>${t.cart.checkoutBtn}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * ÉCRAN 5 : COMMANDE / LIVRAISON
 */
function renderCheckoutScreen() {
  const t = getT();

  return `
    <div class="max-w-xl mx-auto px-5 py-5 animate-screen-enter">
      <!-- Barre d'étapes : Panier —— Livraison (Actif Rose) —— Paiement -->
      <div class="flex items-center justify-between max-w-xs mx-auto mb-7">
        <!-- Étape 1 : Panier -->
        <div class="flex flex-col items-center gap-1">
          <div class="w-7 h-7 rounded-full bg-[#FCE8EE] text-[#DE1B61] flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="19" cy="21" r="1.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 3h2.5l2.2 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 7H6" />
            </svg>
          </div>
          <span class="text-[11px] text-[#52525B]">${t.checkout.stepCart}</span>
        </div>

        <div class="flex-1 h-[2px] bg-[#DE1B61] mx-2 -mt-4"></div>

        <!-- Étape 2 : Livraison (Active en rose) -->
        <div class="flex flex-col items-center gap-1">
          <div class="w-7 h-7 rounded-full bg-[#DE1B61] text-white flex items-center justify-center shadow-sm animate-pop-spring">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
            </svg>
          </div>
          <span class="text-[11px] font-bold text-[#DE1B61]">${t.checkout.stepDelivery}</span>
        </div>

        <div class="flex-1 h-[1.5px] bg-black/15 mx-2 -mt-4"></div>

        <!-- Étape 3 : Paiement -->
        <div class="flex flex-col items-center gap-1">
          <div class="w-7 h-7 rounded-full bg-[#71717A] text-white flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="text-[11px] text-[#52525B]">${t.checkout.stepPayment}</span>
        </div>
      </div>

      <!-- Titre section : Informations de livraison -->
      <div class="flex items-center gap-2 mb-4 animate-stagger-item" style="--i: 1;">
        <svg class="w-5 h-5 text-[#18181B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <h2 class="text-sm sm:text-base font-bold text-[#18181B]">${t.checkout.sectionTitle}</h2>
      </div>

      <!-- Formulaire de commande -->
      <form id="shoestyle-checkout-form" class="space-y-4">
        <div class="animate-stagger-item" style="--i: 2;">
          <label for="checkout-name" class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${t.checkout.fullName} <span class="text-[#DE1B61]">*</span>
          </label>
          <input
            id="checkout-name"
            name="fullName"
            type="text"
            required
            placeholder="${t.checkout.fullNamePlaceholder}"
            class="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-black/12 text-xs sm:text-sm text-[#18181B] placeholder:text-[#A1A1AA] transition-all focus:border-[#DE1B61] focus:bg-white"
          />
        </div>

        <div class="animate-stagger-item" style="--i: 3;">
          <label for="checkout-phone" class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${t.checkout.phone} <span class="text-[#DE1B61]">*</span>
          </label>
          <input
            id="checkout-phone"
            name="phone"
            type="tel"
            required
            placeholder="${t.checkout.phonePlaceholder}"
            class="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-black/12 text-xs sm:text-sm text-[#18181B] placeholder:text-[#A1A1AA] tabular-nums transition-all focus:border-[#DE1B61] focus:bg-white"
          />
        </div>

        <div class="animate-stagger-item" style="--i: 4;">
          <label for="checkout-wilaya" class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${t.checkout.wilaya} <span class="text-[#DE1B61]">*</span>
          </label>
          <select
            id="checkout-wilaya"
            name="wilayaCode"
            required
            class="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-black/12 text-xs sm:text-sm text-[#18181B] transition-all focus:border-[#DE1B61] focus:bg-white"
          >
            <option value="" disabled>${t.checkout.wilayaPlaceholder}</option>
            ${WILAYAS.map(
              (w) => `
              <option value="${w.code}" ${
                w.code === store.selectedWilayaCode ? 'selected' : ''
              }>
                ${store.lang === 'ar' ? w.name_ar : w.name_fr}
              </option>
            `
            ).join('')}
          </select>
        </div>

        <div class="animate-stagger-item" style="--i: 5;">
          <label for="checkout-address" class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${t.checkout.address} <span class="text-[#DE1B61]">*</span>
          </label>
          <input
            id="checkout-address"
            name="address"
            type="text"
            required
            placeholder="${t.checkout.addressPlaceholder}"
            class="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-black/12 text-xs sm:text-sm text-[#18181B] placeholder:text-[#A1A1AA] transition-all focus:border-[#DE1B61] focus:bg-white"
          />
        </div>

        <div class="pt-3 animate-stagger-item" style="--i: 6;">
          <button
            type="submit"
            class="w-full py-3.5 px-6 ss-btn-pink text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <span>${t.checkout.continueBtn}</span>
            <span>${getArrowNext()}</span>
          </button>
        </div>
      </form>
    </div>
  `;
}

/**
 * ÉCRAN 6 : COMMANDE CONFIRMÉE !
 */
function renderConfirmationScreen() {
  const t = getT();
  const order = store.lastConfirmedOrder;

  return `
    <div class="max-w-lg mx-auto px-6 py-8 text-center relative overflow-hidden animate-screen-enter">
      <!-- Confettis & Cœurs décoratifs animés -->
      <div class="flex justify-between items-center px-6 text-[#DE1B61] text-lg select-none" aria-hidden="true">
        <span class="animate-confetti" style="--i: 1; --rot: -25deg;">🎊</span>
        <span class="text-sm text-[#FBBF24] animate-confetti" style="--i: 2; --rot: 35deg;">✦</span>
        <span class="animate-confetti" style="--i: 3; --rot: -15deg;">♡</span>
        <span class="text-sm text-[#43A047] animate-confetti" style="--i: 4; --rot: 20deg;">✦</span>
        <span class="animate-confetti" style="--i: 5; --rot: 30deg;">🎉</span>
      </div>

      <!-- Grand cercle vert avec coche blanche rebondissante -->
      <div class="w-20 h-20 rounded-full bg-[#43A047] text-white flex items-center justify-center mx-auto mt-2 shadow-md animate-check-bounce">
        <svg class="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 class="mt-5 text-2xl sm:text-3xl font-extrabold text-[#18181B] animate-stagger-item" style="--i: 1;">
        ${t.confirmation.title}
      </h2>
      <p class="mt-1.5 text-sm sm:text-base text-[#3F3F46] font-medium animate-stagger-item" style="--i: 2;">
        ${t.confirmation.thankYou} <span class="text-[#DE1B61] inline-block animate-pop-spring">♥</span>
      </p>

      ${
        order
          ? `<p class="mt-1 text-xs text-[#71717A] tabular-nums animate-stagger-item" style="--i: 3;">
              ${t.confirmation.refPrefix} #${order.id} · ${t.confirmation.amountDue} <strong>${formatDA(order.total, store.lang)}</strong>
            </p>`
          : ''
      }

      <!-- Illustration Sac Shopping Rose avec Escarpin Rose flottant -->
      <div class="my-7 relative flex items-center justify-center animate-float-soft">
        <span class="absolute left-8 top-6 text-2xl text-[#DE1B61]" aria-hidden="true">♡</span>
        <span class="absolute right-8 top-10 text-2xl text-[#DE1B61]" aria-hidden="true">♡</span>

        <div class="relative w-44 h-44 flex items-center justify-center">
          <!-- Anse du sac -->
          <div class="absolute top-3 w-16 h-10 rounded-t-full border-4 border-[#DE1B61]"></div>
          <!-- Corps du sac rose -->
          <div class="mt-6 w-36 h-32 rounded-b-xl rounded-t-md bg-gradient-to-b from-[#FBCFE8] to-[#F48FB1] shadow-md flex items-center justify-center relative border border-[#F48FB1]">
            ${renderHighHeelLogoSVG('w-16 h-16')}
          </div>
        </div>
      </div>

      <!-- Bouton Rose : Suivre ma commande -->
      <button
        type="button"
        data-action="nav-screen"
        data-screen="account"
        class="w-full py-3.5 px-6 ss-btn-pink text-sm sm:text-base flex items-center justify-center gap-2.5 animate-stagger-item"
        style="--i: 4;"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
        <span>${t.confirmation.trackOrderBtn}</span>
      </button>

      <!-- Lien Retour à l'accueil -->
      <button
        type="button"
        data-action="nav-screen"
        data-screen="home"
        class="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#18181B] hover:text-[#DE1B61] transition-colors animate-stagger-item"
        style="--i: 5;"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
        <span>${t.confirmation.backHomeBtn}</span>
      </button>

      <!-- Signature finale : À bientôt sur ShoeStyle ♥ -->
      <div class="mt-7 pt-4 border-t border-[#DE1B61]/15 animate-stagger-item" style="--i: 6;">
        <p class="font-script text-2xl text-[#18181B]">
          — ${t.confirmation.byeCatch} <span class="font-bold">ShoeStyle</span> <span class="text-[#DE1B61]">♥</span> —
        </p>
      </div>
    </div>
  `;
}

/**
 * ÉCRANS FAVORIS & COMPTE
 */
function renderWishlistScreen() {
  const t = getT();
  const wished = PRODUCTS.filter((p) => store.wishlist.includes(p.id));
  return `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-screen-enter">
      ${
        wished.length === 0
          ? `<div class="text-center py-14">
              <p class="text-lg font-bold text-[#18181B]">${t.wishlist.emptyTitle}</p>
              <p class="text-xs text-[#71717A] mt-1">${t.wishlist.emptySub}</p>
            </div>`
          : `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              ${wished.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
            </div>`
      }
    </div>
  `;
}

function renderAccountScreen() {
  const t = getT();

  return `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-screen-enter">
      <div class="p-5 rounded-2xl bg-gradient-to-r from-[#FCE8EE] to-[#FDF5F7] border border-[#DE1B61]/15 flex items-center gap-4">
        ${renderHighHeelLogoSVG('w-12 h-12')}
        <div>
          <h2 class="text-base font-bold text-[#18181B]">${t.account.headerTitle}</h2>
          <p class="text-xs text-[#52525B]">${t.account.headerSub}</p>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-bold text-[#18181B] mb-3">${t.account.ordersTitle}</h3>
        ${
          store.orders.length === 0
            ? `<div class="p-6 rounded-2xl bg-[#FAFAFA] border border-black/8 text-center text-xs text-[#71717A]">
                ${t.account.noOrders}
              </div>`
            : `<div class="space-y-3">
                ${store.orders
                  .map(
                    (o, idx) => `
                    <div
                      style="--i: ${idx};"
                      class="animate-stagger-item p-4 rounded-2xl bg-white border border-black/8 shadow-2xs text-xs space-y-1.5"
                    >
                      <div class="flex justify-between font-bold text-[#18181B]">
                        <span>${t.account.orderPrefix} #${o.id}</span>
                        <span class="text-[#DE1B61] tabular-nums">${formatDA(o.total, store.lang)}</span>
                      </div>
                      <p class="text-[#52525B]">${o.customer.fullName} · ${o.customer.wilaya}</p>
                      <p class="text-[#43A047] font-semibold">✓ ${o.status}</p>
                    </div>
                  `
                  )
                  .join('')}
              </div>`
        }
      </div>
    </div>
  `;
}

/**
 * Barre inférieure Mobile bilingue
 */
function renderNavigationBars() {
  const t = getT();
  const details = store.getCartDetails();
  const screen = store.currentScreen;

  const bottomNav = document.getElementById('mobile-bottom-nav');
  if (bottomNav) {
    bottomNav.innerHTML = `
      <button
        type="button"
        data-action="nav-screen"
        data-screen="home"
        class="flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'home' ? 'text-[#DE1B61] font-bold' : 'text-[#52525B]'
        }"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="${
          screen === 'home' ? 'currentColor' : 'none'
        }" stroke="currentColor" stroke-width="1.9">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
        <span class="text-[10px] mt-0.5">${t.nav.home}</span>
      </button>

      <button
        type="button"
        data-action="nav-screen"
        data-screen="category"
        data-category="Talons"
        class="flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'category' ? 'text-[#DE1B61] font-bold' : 'text-[#52525B]'
        }"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span class="text-[10px] mt-0.5">${t.nav.categories}</span>
      </button>

      <button
        type="button"
        data-action="nav-screen"
        data-screen="wishlist"
        class="relative flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'wishlist' ? 'text-[#DE1B61] font-bold' : 'text-[#52525B]'
        }"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="${
          screen === 'wishlist' ? 'currentColor' : 'none'
        }" stroke="currentColor" stroke-width="1.9">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span class="text-[10px] mt-0.5">${t.nav.wishlist}</span>
      </button>

      <button
        id="mobile-cart-trigger"
        type="button"
        data-action="nav-screen"
        data-screen="cart"
        class="relative flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'cart' || screen === 'checkout'
            ? 'text-[#DE1B61] font-bold'
            : 'text-[#52525B]'
        }"
      >
        <div class="relative">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
            <circle cx="9" cy="21" r="1.5" />
            <circle cx="19" cy="21" r="1.5" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 3h2.5l2.2 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 7H6" />
          </svg>
          <span class="ss-cart-badge absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#DE1B61] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
            ${details.totalCount}
          </span>
        </div>
        <span class="text-[10px] mt-0.5">${t.nav.cart}</span>
      </button>

      <button
        type="button"
        data-action="nav-screen"
        data-screen="account"
        class="flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'account' ? 'text-[#DE1B61] font-bold' : 'text-[#52525B]'
        }"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="text-[10px] mt-0.5">${t.nav.account}</span>
      </button>
    `;
  }
}

function renderAll() {
  document.documentElement.lang = store.lang;
  document.documentElement.dir = store.lang === 'ar' ? 'rtl' : 'ltr';

  renderHeader();
  renderNavigationBars();

  const mainEl = document.getElementById('app-main');
  if (!mainEl) return;

  switch (store.currentScreen) {
    case 'home':
      mainEl.innerHTML = renderHomeScreen();
      break;
    case 'category':
      mainEl.innerHTML = renderCategoryScreen();
      break;
    case 'pdp':
      mainEl.innerHTML = renderPDPScreen();
      break;
    case 'cart':
      mainEl.innerHTML = renderCartScreen();
      break;
    case 'checkout':
      mainEl.innerHTML = renderCheckoutScreen();
      break;
    case 'confirmation':
      mainEl.innerHTML = renderConfirmationScreen();
      break;
    case 'wishlist':
      mainEl.innerHTML = renderWishlistScreen();
      break;
    case 'account':
      mainEl.innerHTML = renderAccountScreen();
      break;
    default:
      mainEl.innerHTML = renderHomeScreen();
  }

  requestAnimationFrame(() => initScrollReveal());
}

function updateHeroSlide(nextIndex) {
  heroSlideIndex = (nextIndex + HERO_SLIDES.length) % HERO_SLIDES.length;

  if (store.currentScreen !== 'home') {
    return;
  }

  const heroImg = document.getElementById('hero-banner-img');
  if (!heroImg) {
    return;
  }

  const slide = HERO_SLIDES[heroSlideIndex] || HERO_SLIDES[0];
  const slideKicker = store.lang === 'ar' ? slide.kicker_ar : slide.kicker_fr;
  const slideTitle = store.lang === 'ar' ? slide.titleHtml_ar : slide.titleHtml_fr;
  const slideSubtitle = store.lang === 'ar' ? slide.subtitle_ar : slide.subtitle_fr;
  const slideCta = store.lang === 'ar' ? slide.ctaLabel_ar : slide.ctaLabel_fr;
  const arrow = getArrowNext();

  const mobOverlay = document.getElementById('hero-mobile-overlay');
  const deskContent = document.getElementById('hero-desktop-content');

  // Smooth cross-fade transition
  heroImg.style.opacity = '0.35';
  if (mobOverlay) mobOverlay.style.opacity = '0.35';
  if (deskContent) deskContent.style.opacity = '0.35';

  setTimeout(() => {
    // Update image and restart gentle Ken Burns effect smoothly
    if (heroImg) {
      heroImg.src = slide.image;
      heroImg.classList.remove('animate-hero-zoom');
      // trigger reflow to restart CSS animation smoothly
      void heroImg.offsetWidth;
      heroImg.classList.add('animate-hero-zoom');
      heroImg.style.opacity = '1';
    }

    // Update Mobile overlay
    const mobTitle = document.getElementById('hero-mobile-title');
    if (mobTitle) mobTitle.innerHTML = slideTitle;
    const mobCta = document.getElementById('hero-mobile-cta');
    if (mobCta) mobCta.setAttribute('data-category', slide.targetCategory);
    const mobCtaLabel = document.getElementById('hero-mobile-cta-label');
    if (mobCtaLabel) mobCtaLabel.textContent = slideCta;
    const mobCtaArrow = document.getElementById('hero-mobile-cta-arrow');
    if (mobCtaArrow) mobCtaArrow.textContent = arrow;
    if (mobOverlay) mobOverlay.style.opacity = '1';

    // Update Desktop content
    const deskKicker = document.getElementById('hero-desktop-kicker');
    if (deskKicker) deskKicker.textContent = slideKicker;
    const deskTitle = document.getElementById('hero-desktop-title');
    if (deskTitle) deskTitle.innerHTML = slideTitle;
    const deskSub = document.getElementById('hero-desktop-subtitle');
    if (deskSub) deskSub.textContent = slideSubtitle;
    const deskCta = document.getElementById('hero-desktop-cta');
    if (deskCta) deskCta.setAttribute('data-category', slide.targetCategory);
    const deskCtaLabel = document.getElementById('hero-desktop-cta-label');
    if (deskCtaLabel) deskCtaLabel.textContent = slideCta;
    const deskCtaArrow = document.getElementById('hero-desktop-cta-arrow');
    if (deskCtaArrow) deskCtaArrow.textContent = arrow;
    if (deskContent) deskContent.style.opacity = '1';
  }, 160);

  // Update dots indicator in-place
  const dots = document.querySelectorAll('[data-action="hero-slide"]');
  dots.forEach((dot) => {
    const idx = Number(dot.getAttribute('data-index'));
    if (idx === heroSlideIndex) {
      dot.className =
        'transition-all duration-300 rounded-full w-5 h-2 bg-[#DE1B61]';
    } else {
      dot.className =
        'transition-all duration-300 rounded-full w-2 h-2 bg-[#18181B]/25 hover:bg-[#18181B]/50';
    }
  });
}

function updatePDPGallery(idx) {
  store.pdpGalleryIndex = idx;
  const prod = store.getActiveProduct();
  if (!prod) return;

  const galleryImages =
    prod.gallery && prod.gallery.length ? prod.gallery : [prod.image];
  const activeIndex = store.pdpGalleryIndex % galleryImages.length;
  const activeImg = galleryImages[activeIndex] || prod.image;

  const pdpImg = document.getElementById('pdp-main-img');
  if (pdpImg) {
    pdpImg.style.opacity = '0.35';
    setTimeout(() => {
      pdpImg.src = activeImg;
      pdpImg.style.opacity = '1';
    }, 120);
  }

  const dots = document.querySelectorAll('[data-action="pdp-gallery-dot"]');
  dots.forEach((dot) => {
    const dotIdx = Number(dot.getAttribute('data-index'));
    if (dotIdx === activeIndex) {
      dot.className =
        'transition-all duration-300 rounded-full w-4 h-2 bg-[#DE1B61]';
    } else {
      dot.className =
        'transition-all duration-300 rounded-full w-2 h-2 bg-white/85 hover:bg-white';
    }
  });
}

function updatePDPColorInPlace(color) {
  store.pdpSelectedColor = color;

  const colorLabelEl = document.getElementById('pdp-selected-color-label');
  if (colorLabelEl) {
    const swatch = COLOR_SWATCHES[color];
    colorLabelEl.textContent = swatch
      ? store.lang === 'ar'
        ? swatch.label_ar
        : swatch.label_fr
      : color;
  }

  const swatches = document.querySelectorAll('[data-action="pdp-select-color"]');
  swatches.forEach((btn) => {
    const btnColor = btn.getAttribute('data-color');
    if (btnColor === color) {
      btn.className = 'ss-color-swatch active';
    } else {
      btn.className = 'ss-color-swatch border-black/15';
    }
  });
}

function updatePDPSizeInPlace(size) {
  store.pdpSelectedSize = Number(size);

  const sizeBtns = document.querySelectorAll('[data-action="pdp-select-size"]');
  sizeBtns.forEach((btn) => {
    const btnSize = Number(btn.getAttribute('data-size'));
    if (btnSize === store.pdpSelectedSize) {
      btn.className =
        'py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all border-2 border-[#DE1B61] text-[#DE1B61] bg-[#FCE8EE]/35 animate-pop-spring';
    } else {
      btn.className =
        'py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all border-black/12 text-[#18181B] bg-white hover:border-black/30';
    }
  });
}

function updateCategoryInPlace(updateBanner = false) {
  const t = getT();
  const filtered = getFilteredCategoryProducts();

  // Update products grid in-place
  const gridEl = document.getElementById('category-products-grid');
  if (gridEl) {
    gridEl.innerHTML = filtered
      .map((p, idx) => renderShoeStyleCard(p, idx))
      .join('');
  }

  // Update category pills active state
  const pills = document.querySelectorAll('[data-action="select-category-pill"]');
  pills.forEach((pill) => {
    const catId = pill.getAttribute('data-category');
    if (catId === store.activeCategory) {
      pill.className =
        'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all bg-[#18181B] text-white scale-105 shadow-xs';
    } else {
      pill.className =
        'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all bg-[#F5F3F4] text-[#52525B] hover:text-[#18181B]';
    }
  });

  if (updateBanner) {
    const activeCatObj =
      CATEGORIES.find((c) => c.id === store.activeCategory) || CATEGORIES[1];
    const catName =
      store.lang === 'ar' ? activeCatObj.name_ar : activeCatObj.name_fr;
    const catSub =
      store.lang === 'ar' ? activeCatObj.subtitle_ar : activeCatObj.subtitle_fr;
    const displayTitle =
      store.activeCategory === 'Tout' ? t.nav.all : catName;

    const headerTitleEl = document.getElementById('header-screen-title');
    if (headerTitleEl) headerTitleEl.textContent = displayTitle;

    const bannerTitleEl = document.getElementById('cat-banner-title');
    if (bannerTitleEl) bannerTitleEl.textContent = displayTitle;

    const bannerSubEl = document.getElementById('cat-banner-sub');
    if (bannerSubEl) bannerSubEl.textContent = catSub;

    const bannerImgEl = document.getElementById('cat-banner-img');
    if (bannerImgEl && bannerImgEl.getAttribute('src') !== activeCatObj.image) {
      bannerImgEl.style.opacity = '0.35';
      setTimeout(() => {
        bannerImgEl.src = activeCatObj.image;
        bannerImgEl.alt = catName;
        bannerImgEl.style.opacity = '0.9';
      }, 130);
    }
  }
}

function updateWishlistButtonsInPlace(productId, added) {
  const buttons = document.querySelectorAll(
    `[data-action="toggle-wishlist"][data-id="${productId}"]`
  );
  buttons.forEach((btn) => {
    const svg = btn.querySelector('svg');
    if (!svg) return;
    const isLarge = svg.classList.contains('w-5');
    const sizeCls = isLarge ? 'w-5 h-5' : 'w-4 h-4 transition-transform';
    svg.setAttribute(
      'class',
      `${sizeCls} ${
        added
          ? 'fill-[#DE1B61] text-[#DE1B61] animate-pop-spring'
          : 'fill-none text-[#18181B]'
      }`
    );
  });
}

function updateCartBadgesInPlace() {
  const details = store.getCartDetails();
  const badges = document.querySelectorAll('.ss-cart-badge');
  badges.forEach((b) => {
    b.textContent = String(details.totalCount);
  });
}

function startHeroAutoSlider() {
  if (heroIntervalId) clearInterval(heroIntervalId);
  heroIntervalId = setInterval(() => {
    if (store.currentScreen === 'home') {
      const next = (heroSlideIndex + 1) % HERO_SLIDES.length;
      updateHeroSlide(next);
    }
  }, 5000);
}

function setupEvents() {
  document.addEventListener('click', (e) => {
    const target =
      e.target instanceof Element ? e.target.closest('[data-action]') : null;
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    const t = getT();

    switch (action) {
      case 'open-admin': {
        openAdminDashboard();
        break;
      }

      case 'toggle-language': {
        store.toggleLanguage();
        showToast(
          store.lang === 'ar'
            ? 'تم التحويل إلى اللغة العربية'
            : 'Passé en langue Française'
        );
        break;
      }

      case 'nav-screen': {
        const screen = target.getAttribute('data-screen') || 'home';
        const category = target.getAttribute('data-category');
        store.navigate(screen, { category });
        break;
      }

      case 'hero-slide': {
        const idx = Number(target.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          updateHeroSlide(idx);
          startHeroAutoSlider();
        }
        break;
      }

      case 'pdp-gallery-dot': {
        const idx = Number(target.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          updatePDPGallery(idx);
        }
        break;
      }

      case 'go-back': {
        store.goBack();
        break;
      }

      case 'toggle-search': {
        store.searchOpen = !store.searchOpen;
        renderHeader();
        if (store.searchOpen) {
          setTimeout(() => {
            const input = document.getElementById('global-search-input');
            if (input) input.focus();
          }, 50);
        }
        break;
      }

      case 'open-pdp': {
        if (!id) break;
        store.navigate('pdp', { productId: id });
        break;
      }

      case 'toggle-wishlist': {
        e.stopPropagation();
        if (!id) break;
        const isWishlistScreen = store.currentScreen === 'wishlist';
        const added = store.toggleWishlist(id, !isWishlistScreen);
        if (added) {
          spawnHeartBurst(target);
        }
        if (!isWishlistScreen) {
          updateWishlistButtonsInPlace(id, added);
        }
        showToast(added ? t.wishlist.added : t.wishlist.removed);
        break;
      }

      case 'quick-add-cart': {
        e.stopPropagation();
        if (!id) break;
        animateFlyToCart(target);
        const res = store.addToCart(id, undefined, undefined, 1, true);
        if (res) {
          updateCartBadgesInPlace();
          const pName = store.lang === 'ar' ? res.product.name_ar : res.product.name_fr;
          showToast(`${pName} ${t.cart.addedToast}`);
        }
        break;
      }

      case 'select-category-pill': {
        const cat = target.getAttribute('data-category') || 'Talons';
        store.activeCategory = cat;
        updateCategoryInPlace(true);
        break;
      }

      case 'reset-category-filters': {
        store.filterPrice = 'all';
        store.filterSize = 'all';
        store.filterColor = 'all';
        const priceSel = document.getElementById('filter-price-select');
        if (priceSel instanceof HTMLSelectElement) priceSel.value = 'all';
        const sizeSel = document.getElementById('filter-size-select');
        if (sizeSel instanceof HTMLSelectElement) sizeSel.value = 'all';
        const colorSel = document.getElementById('filter-color-select');
        if (colorSel instanceof HTMLSelectElement) colorSel.value = 'all';
        updateCategoryInPlace(false);
        showToast(t.filters.reset);
        break;
      }

      case 'pdp-select-color': {
        const color = target.getAttribute('data-color');
        if (color) {
          updatePDPColorInPlace(color);
        }
        break;
      }

      case 'pdp-select-size': {
        const size = Number(target.getAttribute('data-size'));
        if (size) {
          updatePDPSizeInPlace(size);
        }
        break;
      }

      case 'pdp-add-to-cart': {
        animateFlyToCart(target);
        const prod = store.getActiveProduct();
        const res = store.addToCart(
          prod.id,
          store.pdpSelectedSize,
          store.pdpSelectedColor,
          1,
          true
        );
        if (res) {
          updateCartBadgesInPlace();
          const pName = store.lang === 'ar' ? res.product.name_ar : res.product.name_fr;
          const swatch = COLOR_SWATCHES[res.color];
          const colorName = swatch
            ? store.lang === 'ar'
              ? swatch.label_ar
              : swatch.label_fr
            : res.color;
          showToast(`${pName} (${colorName}, ${t.cart.sizePrefix} ${res.size}) ${t.cart.addedToast}!`);
          setTimeout(() => {
            store.navigate('cart');
          }, 380);
        }
        break;
      }

      case 'share-product': {
        showToast(t.pdp.shareCopied);
        break;
      }

      case 'cart-qty': {
        const index = Number(target.getAttribute('data-index'));
        const delta = Number(target.getAttribute('data-delta'));
        store.updateCartQuantity(index, delta);
        break;
      }

      case 'clear-cart': {
        store.clearCart();
        showToast(t.cart.clearedToast);
        break;
      }
    }
  });

  document.addEventListener('input', (e) => {
    const target = e.target;
    if (
      target instanceof HTMLInputElement &&
      target.id === 'global-search-input'
    ) {
      store.searchQuery = target.value;
      if (store.currentScreen !== 'category') {
        store.currentScreen = 'category';
        store.activeCategory = 'Tout';
        const mainEl = document.getElementById('app-main');
        if (mainEl) mainEl.innerHTML = renderCategoryScreen();
        renderNavigationBars();
      } else {
        updateCategoryInPlace(false);
      }
    }
  });

  document.addEventListener('change', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;

    if (target.id === 'filter-price-select') {
      store.filterPrice = target.value;
      updateCategoryInPlace(false);
    } else if (target.id === 'filter-size-select') {
      store.filterSize = target.value;
      updateCategoryInPlace(false);
    } else if (target.id === 'filter-color-select') {
      store.filterColor = target.value;
      updateCategoryInPlace(false);
    } else if (target.id === 'checkout-wilaya') {
      store.selectedWilayaCode = target.value;
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    const t = getT();
    if (form.id === 'shoestyle-checkout-form') {
      e.preventDefault();
      const data = new FormData(form);
      const fullName = String(data.get('fullName') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const wilayaCode = String(data.get('wilayaCode') || '16');
      const address = String(data.get('address') || '').trim();

      if (!fullName || !phone || !address) return;
      store.submitOrder({ fullName, phone, wilayaCode, address });
      showToast(t.confirmation.title);
    } else if (form.id === 'newsletter-form') {
      e.preventDefault();
      form.reset();
      showToast(t.newsletter.toast);
    }
  });

  // Pause carrousel on hover / touch so the user can comfortably view and click
  document.addEventListener(
    'mouseenter',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el && el.closest('#hero-banner-section') && heroIntervalId) {
        clearInterval(heroIntervalId);
        heroIntervalId = null;
      }
    },
    true
  );

  document.addEventListener(
    'mouseleave',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (
        el &&
        el.closest('#hero-banner-section') &&
        !heroIntervalId &&
        store.currentScreen === 'home'
      ) {
        startHeroAutoSlider();
      }
    },
    true
  );

  document.addEventListener(
    'touchstart',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el && el.closest('#hero-banner-section') && heroIntervalId) {
        clearInterval(heroIntervalId);
        heroIntervalId = null;
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'touchend',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (
        el &&
        el.closest('#hero-banner-section') &&
        !heroIntervalId &&
        store.currentScreen === 'home'
      ) {
        startHeroAutoSlider();
      }
    },
    { passive: true }
  );
  // Smart sticky header: hide on scroll down, immediately reveal on scroll up
  let lastScrollY = window.scrollY || 0;
  let scrollTicking = false;

  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) return;
      scrollTicking = true;

      requestAnimationFrame(() => {
        const headerEl = document.getElementById('app-header');
        const currentScrollY = Math.max(
          0,
          window.scrollY || document.documentElement.scrollTop || 0
        );
        const delta = currentScrollY - lastScrollY;

        if (headerEl) {
          if (currentScrollY <= 16) {
            headerEl.classList.remove('is-hidden', 'is-scrolled');
          } else {
            headerEl.classList.add('is-scrolled');
            if (delta > 5 && currentScrollY > 60 && !store.searchOpen) {
              // Scrolling down: hide header smoothly
              headerEl.classList.add('is-hidden');
            } else if (delta < -2) {
              // Immediately upon scrolling up: show header
              headerEl.classList.remove('is-hidden');
            }
          }
        }

        lastScrollY = currentScrollY;
        scrollTicking = false;
      });
    },
    { passive: true }
  );
}

document.addEventListener('DOMContentLoaded', async () => {
  renderAll();
  store.subscribe(() => renderAll());
  setupEvents();
  startHeroAutoSlider();

  // جلب البيانات المحدثة من Supabase وتحديث واجهة المتجر تلقائياً
  const updatedFromSupabase = await initAdminFromSupabase();
  if (updatedFromSupabase) {
    renderAll();
  }

  // الاستماع لأي تعديلات تجري في صفحة لوحة التحكم المستقلة (/admin.html) عبر Supabase Realtime
  subscribeRealtimeSync(async () => {
    adminState.reloadFromStorage();
    await initAdminFromSupabase();
    renderAll();
  });
});
