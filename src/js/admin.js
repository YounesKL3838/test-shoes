/**
 * ShoeStyle — لوحة التحكم الإدارية الشاملة ثنائية اللغة (العربية / Français)
 * Mobile-First Chic Blush Pink & Ivory Identity — Vanilla JS + LocalStorage
 */
import { IMAGES, PRODUCTS, WILAYAS, formatDA } from './data.js';
import { store, showToast } from './app_bridge.js';
import {
  deleteLandingPageFromSupabase,
  deleteOrderFromSupabase,
  deleteProductFromSupabase,
  deleteShippingRateFromSupabase,
  fetchAllFromSupabase,
  notifyCrossTabSync,
  syncCmsToSupabase,
  syncLandingPageToSupabase,
  syncOrderToSupabase,
  syncProductToSupabase,
  syncShippingRateToSupabase,
} from './supabase.js';

const CMS_STORAGE_KEY = 'shoestyle_full_cms_v1';
const LANDING_STORAGE_KEY = 'shoestyle_landing_pages_v1';
const INVENTORY_STORAGE_KEY = 'shoestyle_inventory_v1';
const SHIPPING_STORAGE_KEY = 'shoestyle_shipping_v1';
const ORDERS_ADMIN_KEY = 'shoestyle_orders_v2';

function getLang() {
  return store && store.lang === 'fr' ? 'fr' : 'ar';
}

/**
 * قاموس الترجمة الكامل للوحة التحكم (العربية / الفرنسية)
 */
const ADMIN_I18N = {
  ar: {
    brandSubtitle: 'لوحة التحكم الشاملة للمتجر',
    viewStore: 'عرض المتجر',
    logout: 'خروج',
    switchLangBtn: '🌐 Français',
    tabs: {
      inventory: 'المنتجات والمخزون',
      inventoryShort: 'المنتجات',
      orders: 'الطلبات',
      ordersShort: 'الطلبات',
      cms: 'واجهة المتجر',
      cmsShort: 'الواجهة',
      landing: 'صفحات الهبوط',
      landingShort: 'الهبوط',
      shipping: 'التوصيل',
      shippingShort: 'التوصيل',
    },
    kpi: {
      totalSales: 'إجمالي المبيعات',
      totalOrdersFoot: (n) => `${n} طلب إجمالي`,
      newOrders: 'طلبات جديدة',
      orderUnit: 'طلب',
      awaitingConfirm: 'بانتظار التأكيد',
      productsCount: 'عدد المنتجات',
      shoeUnit: 'حذاء',
      lowStockFoot: (n) => `${n} بمخزون منخفض`,
      freeShipping: 'الشحن المجاني',
      activeWilayas: (n) => `${n} ولاية مفعلة`,
    },
    inv: {
      lowStockAlert: (names) => `⚠️ تنبيه مخزون منخفض (أقل من 5 قطع): ${names}`,
      productsBadge: (n) => `${n} منتجات`,
      editProdTitle: (name) => `✏️ تعديل المنتج: ${name}`,
      addProdTitle: '➕ إضافة حذاء جديد للمتجر',
      prodFormSub: 'ارفع صورة الحذاء مباشرة من هاتفك أو حاسوبك وحدد السعر والكمية',
      cancelEdit: 'إلغاء التعديل',
      mainPhotoLabel: 'صورة الحذاء الأساسية (اضغط لرفع صورة من هاتفك أو جهازك)',
      uploadTapTitle: '📷 اضغط هنا لاختيار صورة من الاستوديو أو الكاميرا',
      uploadTapSub: 'بدون روابط — رفع مباشر وسريع',
      uploadBtn: 'رفع صورة',
      nameArLabel: 'اسم الحذاء (بالعربية)',
      nameArPlaceholder: 'مثال: حذاء كعب عالي كلاسيك وردي',
      nameFrLabel: 'اسم الحذاء (بالفرنسية)',
      nameFrPlaceholder: 'Ex: Escarpins Classiques Rose',
      categoryLabel: 'القسم / التصنيف',
      priceLabel: 'السعر (د.ج)',
      stockLabel: 'الكمية المتوفرة في المخزون',
      galleryLabel: 'صور إضافية للحذاء (اختياري)',
      galleryTapTitle: (n) => `🖼️ إضافة صور أخرى للمعرض (${n} صور مرفوعة)`,
      galleryTapSub: 'يمكنك اختيار عدة صور معاً من هاتفك',
      galleryBtn: '➕ صور إضافية',
      saveProdChanges: '💾 حفظ التعديلات',
      addProdNow: '➕ إضافة الحذاء للمتجر الآن',
      currentProdsTitle: (n) => `المنتجات الحالية والتحكم السريع بالمخزون (${n})`,
      currentProdsSub: 'اضغط على (+) أو (-) لتعديل المخزون فوراً، أو اضغط على الصورة لتغييرها من هاتفك',
      searchPlaceholder: '🔍 ابحث عن اسم الحذاء...',
      changePhotoBtn: '📷 تغيير',
      outOfStock: 'نفد (0)',
      lowStockBadge: (n) => `⚠️ منخفض (${n})`,
      inStockBadge: (n) => `متوفر (${n})`,
      editBtn: 'تعديل',
      deleteBtn: 'حذف',
    },
    orders: {
      title: (n) => `🛍️ طلبات الزبائن (${n})`,
      sub: 'غيّر حالة الطلب بلمسة واحدة أو اتصل بالزبون مباشرة من البطاقة',
      addDemoBtn: '➕ إضافة طلب تجريبي',
      allFilter: (n) => `الكل (${n})`,
      emptyOrders: 'لا توجد طلبات في هذه الحالة حالياً',
      totalAmount: 'المبلغ الإجمالي',
      sizeWord: 'مقاس',
      statuses: {
        new: 'جديد',
        confirming: 'قيد التأكيد',
        shipping: 'قيد الشحن',
        delivered: 'تم التسليم',
        cancelled: 'ملغى',
      },
    },
    cms: {
      livePreviewBanner: '👁️ معاينة مباشرة لواجهة المتجر (تتغير تلقائياً أثناء الكتابة)',
      navLinksPreview: 'الرئيسية · كعب · سنيكرز',
      formTitle: '🎨 تعديل نصوص وصور الواجهة الرئيسية',
      formSub: 'عدّل اسم المتجر، الإعلانات، البانر، والمميزات ثم اضغط حفظ',
      saveBtn: '💾 حفظ التعديلات',
      storeNameLabel: 'اسم المتجر',
      logoLabel: 'تغيير صورة شعار المتجر (من الهاتف)',
      logoUploadTitle: '📷 رفع صورة الشعار',
      chooseBtn: 'اختيار',
      annSwitchTitle: 'إظهار شريط الإعلانات الوردي بأعلى الموقع',
      annSwitchSub: 'لعرض عروض التوصيل المجاني أو التخفيضات',
      annTextLabel: 'نص شريط الإعلانات العلوي',
      heroTitleLabel: 'عنوان البانر الرئيسي',
      heroBtnLabel: 'نص زر البانر',
      heroSubLabel: 'الوصف التسويقي للبانر',
      heroImgLabel: 'صورة البانر الرئيسي (رفع مباشر من الجهاز)',
      heroImgTitle: '🖼️ اضغط لرفع صورة جديدة للبانر الرئيسي',
      heroImgSub: 'تظهر فوراً في المعاينة أعلاه',
      featLabel: (i) => `الميزة ${i} (الأيقونة والعنوان)`,
      featDescLabel: (i) => `وصف الميزة ${i}`,
      saveAllCmsBtn: '💾 حفظ وتطبيق تعديلات الواجهة',
    },
    lp: {
      editTitle: (t) => `✏️ تعديل العرض: ${t}`,
      createTitle: '🚀 إنشاء صفحة هبوط لعرض ترويجي',
      sub: 'صفحة خاصة بمنتج مخفض مع استمارة شراء سريع تزيد المبيعات',
      cancelBtn: 'إلغاء',
      offerTitleLabel: 'عنوان العرض الترويجي',
      offerTitlePlaceholder: 'مثال: عرض خاص: حذاء كعب سهرة + توصيل مجاني',
      slugLabel: 'رابط العرض المخصص (Slug)',
      origPriceLabel: 'السعر قبل التخفيض (د.ج)',
      discPriceLabel: 'سعر العرض المخفض (د.ج)',
      mainImgLabel: 'صورة العرض الرئيسية (من الهاتف)',
      mainImgTitle: '📷 رفع صورة العرض',
      mainImgSub: 'من ألبوم الصور',
      galleryLabel: 'صور إضافية لمعرض العرض',
      galleryTitle: (n) => `🖼️ إضافة صور للمعرض (${n})`,
      gallerySub: 'اختيار متعدد',
      addPhotosBtn: '➕ صور',
      descLabel: 'وصف العرض ومميزاته',
      descPlaceholder: 'اشرح مميزات الحذاء والعرض...',
      updateBtn: '💾 تحديث صفحة الهبوط',
      createBtn: '➕ إنشاء وحفظ صفحة الهبوط',
      activeListTitle: (n) => `صفحات الهبوط النشطة (${n})`,
      activeListSub: 'اضغط على "معاينة العرض" لتجربة استمارة الشراء السريع',
      previewBtn: '👁️ معاينة العرض',
      modalHeader: (slug) => `✨ معاينة صفحة الهبوط (${slug})`,
      closeModal: 'إغلاق ✕',
      quickOrderTitle: '🛍️ اطلبي الآن — الدفع عند الاستلام',
      quickOrderSub: 'أدخلي معلوماتكِ ليصلكِ الطلب لباب المنزل',
      fullNamePlaceholder: 'الاسم واللقب *',
      phonePlaceholder: 'رقم الهاتف *',
      addressPlaceholder: 'العنوان الكامل (البلدية والحي) *',
      confirmQuickOrder: (price) => `تأكيد الطلب — ${price}`,
    },
    ship: {
      title: '🚚 سقف التوصيل المجاني وإضافة ولاية',
      sub: 'حدد المبلغ الذي يصبح بعده الشحن مجانياً تلقائياً',
      thresholdLabel: 'سقف التوصيل المجاني (د.ج)',
      saveThresholdBtn: '💾 حفظ سقف الشحن المجاني',
      addWilayaLabel: 'إضافة ولاية جديدة (الرمز والاسم)',
      wilayaNamePlaceholder: 'اسم الولاية (مثلاً: بجاية)',
      feesLabel: 'سعر المنزل والمكتب (د.ج)',
      homePlaceholder: 'المنزل 600',
      deskPlaceholder: 'المكتب 400',
      addBtn: '➕ إضافة',
      ratesListTitle: (n) => `أسعار التوصيل حسب الولايات (${n})`,
      ratesListSub: 'عدّل السعر مباشرة وسيتم الحفظ تلقائياً',
      homeFeeLabel: '🏠 للمنزل (د.ج)',
      deskFeeLabel: '🏢 للمكتب (د.ج)',
    },
    toasts: {
      loggedOut: 'تم الخروج والعودة إلى واجهة المتجر',
      lpDeleted: 'تم حذف صفحة الهبوط',
      prodDeleted: 'تم حذف المنتج من الكتالوج',
      newOrderAdded: (id) => `تم تسجيل الطلب الجديد #${id}`,
      orderDeleted: 'تم حذف الطلب',
      wilayaDeleted: 'تم حذف الولاية',
      photoUploaded: '📷 تم رفع الصورة بنجاح',
      galleryAdded: (n) => `🖼️ تمت إضافة ${n} صور`,
      prodPhotoUpdated: (name) => `✅ تم تحديث صورة "${name}" فوراً`,
      invalidImage: '⚠️ يرجى اختيار صورة صالحة',
      orderStatusChanged: (id, st) => `✅ تم تحديث حالة الطلب #${id} إلى "${st}"`,
      cmsSaved: '💖 تم حفظ تعديلات واجهة المتجر بنجاح!',
      lpUpdated: '✅ تم تحديث العرض الترويجي',
      lpCreated: '🚀 تم إنشاء صفحة الهبوط الجديدة',
      prodUpdated: '✅ تم حفظ تعديلات المنتج',
      prodCreated: '👠 تمت إضافة الحذاء الجديد للمتجر',
      thresholdSaved: '✅ تم حفظ سقف التوصيل المجاني',
      wilayaAdded: (name) => `✅ تمت إضافة ولاية ${name}`,
      langSwitched: '🌐 تم التبديل إلى اللغة العربية',
    },
  },
  fr: {
    brandSubtitle: 'Panneau d’Administration & CMS Complet',
    viewStore: 'Voir la Boutique',
    logout: 'Quitter',
    switchLangBtn: '🌐 العربية',
    tabs: {
      inventory: 'Produits & Stock',
      inventoryShort: 'Produits',
      orders: 'Commandes',
      ordersShort: 'Commandes',
      cms: 'Design & CMS',
      cmsShort: 'Vitrine',
      landing: 'Landing Pages',
      landingShort: 'Offres',
      shipping: 'Livraison',
      shippingShort: 'Livraison',
    },
    kpi: {
      totalSales: 'Chiffre d’Affaires',
      totalOrdersFoot: (n) => `${n} commandes au total`,
      newOrders: 'Nouvelles Commandes',
      orderUnit: 'cmd',
      awaitingConfirm: 'En attente de confirmation',
      productsCount: 'Catalogue Produits',
      shoeUnit: 'modèles',
      lowStockFoot: (n) => `${n} en stock faible`,
      freeShipping: 'Livraison Gratuite',
      activeWilayas: (n) => `${n} wilayas actives`,
    },
    inv: {
      lowStockAlert: (names) => `⚠️ Alerte stock faible (moins de 5 pièces) : ${names}`,
      productsBadge: (n) => `${n} produits`,
      editProdTitle: (name) => `✏️ Modifier le produit : ${name}`,
      addProdTitle: '➕ Ajouter une nouvelle chaussure',
      prodFormSub: 'Importez la photo directement depuis votre téléphone ou PC et fixez le prix',
      cancelEdit: 'Annuler',
      mainPhotoLabel: 'Photo principale (Appuyez pour importer depuis votre téléphone)',
      uploadTapTitle: '📷 Appuyez ici pour choisir une photo (Galerie ou Caméra)',
      uploadTapSub: 'Sans lien URL — Importation directe et rapide',
      uploadBtn: 'Importer',
      nameArLabel: 'Nom de la chaussure (Arabe)',
      nameArPlaceholder: 'Ex: حذاء كعب عالي كلاسيك وردي',
      nameFrLabel: 'Nom de la chaussure (Français)',
      nameFrPlaceholder: 'Ex: Escarpins Classiques Rose',
      categoryLabel: 'Catégorie',
      priceLabel: 'Prix (DA)',
      stockLabel: 'Quantité en stock',
      galleryLabel: 'Photos supplémentaires pour la galerie (Optionnel)',
      galleryTapTitle: (n) => `🖼️ Ajouter d’autres angles (${n} photos importées)`,
      galleryTapSub: 'Sélection multiple possible depuis votre téléphone',
      galleryBtn: '➕ Photos',
      saveProdChanges: '💾 Enregistrer les modifications',
      addProdNow: '➕ Ajouter au catalogue maintenant',
      currentProdsTitle: (n) => `Catalogue & Contrôle Rapide du Stock (${n})`,
      currentProdsSub: 'Appuyez sur (+) ou (-) pour ajuster le stock, ou sur la photo pour la remplacer',
      searchPlaceholder: '🔍 Rechercher un modèle...',
      changePhotoBtn: '📷 Changer',
      outOfStock: 'Épuisé (0)',
      lowStockBadge: (n) => `⚠️ Faible (${n})`,
      inStockBadge: (n) => `En stock (${n})`,
      editBtn: 'Modifier',
      deleteBtn: 'Supprimer',
    },
    orders: {
      title: (n) => `🛍️ Commandes Clients (${n})`,
      sub: 'Changez le statut en un clic ou appelez directement le client depuis la carte',
      addDemoBtn: '➕ Commande test',
      allFilter: (n) => `Toutes (${n})`,
      emptyOrders: 'Aucune commande avec ce statut pour le moment',
      totalAmount: 'Montant Total',
      sizeWord: 'Pointure',
      statuses: {
        new: 'Nouveau',
        confirming: 'En confirmation',
        shipping: 'En livraison',
        delivered: 'Livré',
        cancelled: 'Annulé',
      },
    },
    cms: {
      livePreviewBanner: '👁️ Aperçu en direct de la boutique (Mise à jour instantanée)',
      navLinksPreview: 'Accueil · Talons · Sneakers',
      formTitle: '🎨 Personnaliser les textes et images de la vitrine',
      formSub: 'Modifiez le nom, la barre d’annonce, la bannière Hero et les avantages',
      saveBtn: '💾 Enregistrer',
      storeNameLabel: 'Nom de la boutique',
      logoLabel: 'Changer le logo (Depuis le téléphone)',
      logoUploadTitle: '📷 Importer le logo',
      chooseBtn: 'Choisir',
      annSwitchTitle: 'Afficher la barre d’annonce rose en haut du site',
      annSwitchSub: 'Pour annoncer la livraison gratuite ou les promotions',
      annTextLabel: 'Texte de la barre d’annonce',
      heroTitleLabel: 'Titre principal de la bannière (Hero)',
      heroBtnLabel: 'Texte du bouton d’action',
      heroSubLabel: 'Sous-titre de la bannière',
      heroImgLabel: 'Image de la bannière principale (Importation directe)',
      heroImgTitle: '🖼️ Appuyez pour importer une nouvelle image de bannière',
      heroImgSub: 'S’affiche immédiatement dans l’aperçu ci-dessus',
      featLabel: (i) => `Avantage ${i} (Icône & Titre)`,
      featDescLabel: (i) => `Description de l’avantage ${i}`,
      saveAllCmsBtn: '💾 Enregistrer et appliquer à la boutique',
    },
    lp: {
      editTitle: (t) => `✏️ Modifier l’offre : ${t}`,
      createTitle: '🚀 Créer une Landing Page promotionnelle',
      sub: 'Page dédiée à une offre spéciale avec formulaire de commande rapide intégré',
      cancelBtn: 'Annuler',
      offerTitleLabel: 'Titre de l’offre promotionnelle',
      offerTitlePlaceholder: 'Ex: Offre VIP : Escarpins Rose + Sac de soirée offert',
      slugLabel: 'Lien personnalisé (Slug)',
      origPriceLabel: 'Prix initial avant remise (DA)',
      discPriceLabel: 'Prix promo (DA)',
      mainImgLabel: 'Photo principale de l’offre (Depuis téléphone)',
      mainImgTitle: '📷 Importer la photo',
      mainImgSub: 'Depuis la galerie',
      galleryLabel: 'Galerie photos de l’offre',
      galleryTitle: (n) => `🖼️ Ajouter à la galerie (${n})`,
      gallerySub: 'Sélection multiple',
      addPhotosBtn: '➕ Photos',
      descLabel: 'Description marketing de l’offre',
      descPlaceholder: 'Décrivez les avantages du modèle et de la promotion...',
      updateBtn: '💾 Mettre à jour la Landing Page',
      createBtn: '➕ Créer et publier la Landing Page',
      activeListTitle: (n) => `Landing Pages Actives (${n})`,
      activeListSub: 'Cliquez sur "Aperçu" pour tester le formulaire de commande rapide',
      previewBtn: '👁️ Aperçu de l’offre',
      modalHeader: (slug) => `✨ Aperçu de la Landing Page (${slug})`,
      closeModal: 'Fermer ✕',
      quickOrderTitle: '🛍️ Commandez maintenant — Paiement à la livraison',
      quickOrderSub: 'Remplissez vos coordonnées pour recevoir votre colis à domicile',
      fullNamePlaceholder: 'Nom et Prénom *',
      phonePlaceholder: 'Numéro de téléphone *',
      addressPlaceholder: 'Adresse complète (Commune et quartier) *',
      confirmQuickOrder: (price) => `Confirmer la commande — ${price}`,
    },
    ship: {
      title: '🚚 Seuil de livraison gratuite & Ajout de Wilaya',
      sub: 'Définissez le montant à partir duquel la livraison devient gratuite',
      thresholdLabel: 'Seuil de livraison gratuite (DA)',
      saveThresholdBtn: '💾 Enregistrer le seuil',
      addWilayaLabel: 'Ajouter une wilaya (Code & Nom)',
      wilayaNamePlaceholder: 'Nom de la wilaya (ex: Béjaïa)',
      feesLabel: 'Tarifs Domicile & Stop-Desk (DA)',
      homePlaceholder: 'Domicile 600',
      deskPlaceholder: 'Stop-Desk 400',
      addBtn: '➕ Ajouter',
      ratesListTitle: (n) => `Tarifs de livraison par Wilaya (${n})`,
      ratesListSub: 'Modifiez directement les tarifs, sauvegarde automatique',
      homeFeeLabel: '🏠 À Domicile (DA)',
      deskFeeLabel: '🏢 Stop-Desk (DA)',
    },
    toasts: {
      loggedOut: 'Déconnexion réussie — Retour à la boutique',
      lpDeleted: 'Landing Page supprimée',
      prodDeleted: 'Produit supprimé du catalogue',
      newOrderAdded: (id) => `Nouvelle commande #${id} enregistrée`,
      orderDeleted: 'Commande supprimée',
      wilayaDeleted: 'Wilaya supprimée',
      photoUploaded: '📷 Photo importée avec succès',
      galleryAdded: (n) => `🖼️ ${n} photos ajoutées`,
      prodPhotoUpdated: (name) => `✅ Photo de "${name}" mise à jour`,
      invalidImage: '⚠️ Veuillez sélectionner une image valide',
      orderStatusChanged: (id, st) => `✅ Statut de #${id} changé en "${st}"`,
      cmsSaved: '💖 Modifications de la vitrine enregistrées !',
      lpUpdated: '✅ Offre promotionnelle mise à jour',
      lpCreated: '🚀 Nouvelle Landing Page créée',
      prodUpdated: '✅ Produit mis à jour avec succès',
      prodCreated: '👠 Nouveau modèle ajouté à la boutique',
      thresholdSaved: '✅ Seuil de livraison gratuite enregistré',
      wilayaAdded: (name) => `✅ Wilaya ${name} ajoutée`,
      langSwitched: '🌐 Langue changée en Français',
    },
  },
};

function t() {
  return ADMIN_I18N[getLang()];
}

const CATEGORY_LABELS = {
  Talons: { ar: 'كعب عالي (Talons)', fr: 'Talons (Escarpins)' },
  Sneakers: { ar: 'سنيكرز (Sneakers)', fr: 'Sneakers (Baskets)' },
  Sandales: { ar: 'صنادل (Sandales)', fr: 'Sandales' },
  Ballerines: { ar: 'باليرين (Ballerines)', fr: 'Ballerines' },
  Bottes: { ar: 'بوتين (Bottes)', fr: 'Bottes & Bottines' },
};

/**
 * توحيد حالات الطلب بين العربية والفرنسية
 */
const STATUS_KEYS = ['new', 'confirming', 'shipping', 'delivered', 'cancelled'];

function normalizeStatusKey(rawStatus) {
  if (!rawStatus) return 'new';
  const map = {
    new: 'new',
    'جديد': 'new',
    Nouveau: 'new',
    confirming: 'confirming',
    'قيد التأكيد': 'confirming',
    'En confirmation': 'confirming',
    shipping: 'shipping',
    'قيد الشحن': 'shipping',
    'قيد التجهيز للشحن': 'shipping',
    'En livraison': 'shipping',
    'En cours de préparation': 'shipping',
    delivered: 'delivered',
    'تم التسليم': 'delivered',
    Livré: 'delivered',
    cancelled: 'cancelled',
    'ملغى': 'cancelled',
    Annulé: 'cancelled',
  };
  return map[rawStatus] || 'new';
}

function getStatusLabel(rawStatus) {
  const key = normalizeStatusKey(rawStatus);
  return t().orders.statuses[key] || rawStatus;
}

function getStatusBadgeClass(rawStatus) {
  const key = normalizeStatusKey(rawStatus);
  switch (key) {
    case 'new':
      return 'adm-badge adm-badge-new';
    case 'confirming':
      return 'adm-badge adm-badge-confirming';
    case 'shipping':
      return 'adm-badge adm-badge-shipping';
    case 'delivered':
      return 'adm-badge adm-badge-delivered';
    case 'cancelled':
      return 'adm-badge adm-badge-cancelled';
    default:
      return 'adm-badge adm-badge-new';
  }
}

/**
 * قراءة وضغط ملف الصورة المرفوع من الهاتف أو الحاسوب
 */
function readAndCompressImageFile(file, maxWidth = 850, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = String(e.target?.result || '');
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Read error'));
    reader.readAsDataURL(file);
  });
}

function renderShoeStyleHeelSVG() {
  return `
    <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
      <defs>
        <linearGradient id="admHeelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF5C93" />
          <stop offset="55%" stop-color="#DE1B61" />
          <stop offset="100%" stop-color="#A30E44" />
        </linearGradient>
      </defs>
      <path
        d="M52 10C48 10 44 16 39 26C33 37 25 44 15 46C9 47 6 49 6 51C6 53 10 54 18 54C29 54 37 46 44 35C46 32 48 33 48 37V53C48 54.1 48.9 55 50 55C51.1 55 52 54.1 52 53V24C54 19 55 10 52 10Z"
        fill="url(#admHeelGrad)"
      />
    </svg>
  `;
}

const DEFAULT_CMS = {
  storeName: 'ShoeStyle',
  logoUrl: IMAGES.talons,
  announcementText:
    '✨ توصيل مجاني للطلبات فوق 8,000 د.ج لجميع الولايات الـ 58 | Livraison gratuite dès 8 000 DA',
  announcementEnabled: true,
  heroTitle: 'أناقة في كل خطوة · Élégance à chaque pas',
  heroSubtitle:
    'اكتشفي أحدث تشكيلة من الأحذية النسائية الفاخرة، الكعب الوردي اللامع، والسنيكرز العصرية.',
  heroBgUrl: IMAGES.hero,
  heroBtnText: 'اكتشفي التشكيلة · Découvrir',
  heroBtnLink: 'Talons',
  features: [
    {
      icon: '🚚',
      title: 'توصيل سريع 58 ولاية · Livraison 58 Wilayas',
      desc: 'شحن مباشر لباب المنزل أو المكتب خلال 24-48 ساعة',
    },
    {
      icon: '🤝',
      title: 'الدفع عند الاستلام · Paiement à la livraison',
      desc: 'معاينة الطلبية والتأكد من المقاس قبل الدفع بكل أمان',
    },
    {
      icon: '💖',
      title: 'ضمان الاستبدال · Échange garanti',
      desc: 'إمكانية استبدال المقاس مجاناً خلال 7 أيام من الاستلام',
    },
  ],
};

const DEFAULT_LANDING_PAGES = [
  {
    id: 'lp-101',
    title: 'عرض خاص: حذاء كعب عالي كلاسيك روز · Offre VIP Escarpins Rose',
    slug: '/offer/pink-heels-vip',
    originalPrice: 6990,
    discountPrice: 4490,
    imageUrl: IMAGES.talons,
    gallery: [IMAGES.talons, IMAGES.hero, IMAGES.sandales],
    description:
      'تألقي بإطلالة أنثوية ساحرة مع حذاء الكعب الوردي اللامع المصنوع من الجلد المرن المريح للقدم طوال السهرة. Un style raffiné et confortable avec livraison rapide.',
    quickFormEnabled: true,
    createdAt: '2026-11-08',
  },
  {
    id: 'lp-102',
    title: 'تخفيض نهاية الأسبوع: سنيكرز أبيض ووردي · Promo Sneakers Mode',
    slug: '/offer/urban-sneakers-pack',
    originalPrice: 5400,
    discountPrice: 3790,
    imageUrl: IMAGES.sneakers,
    gallery: [IMAGES.sneakers, IMAGES.ballerines],
    description:
      'الحذاء اليومي الأكثر مبيعاً! نعل خفيف مضاد للانزلاق وتصميم عصري ناعم يناسب الجامعة والعمل والنزهات اليومية.',
    quickFormEnabled: true,
    createdAt: '2026-11-09',
  },
];

const DEFAULT_ORDERS = [
  {
    id: 'SS-8491',
    date: '2026-11-09',
    fullName: 'Sara Benali / سارة بن علي',
    phone: '0554 12 89 34',
    wilaya: '16 - Alger / الجزائر',
    address: 'Hydra, Rue des Frères Bouadou / حي حيدرة',
    itemsSummary: 'Escarpins Élégants Rose (37 × 1) + Baskets Mode (38 × 1)',
    total: 9380,
    status: 'new',
  },
  {
    id: 'SS-8488',
    date: '2026-11-09',
    fullName: 'Yasmine Mansouri / ياسمين منصوري',
    phone: '0661 45 78 90',
    wilaya: '31 - Oran / وهران',
    address: 'Akid Lotfi / حي العقيد لطفي',
    itemsSummary: 'Sandales Soirée Dorées (38 × 1)',
    total: 5390,
    status: 'confirming',
  },
  {
    id: 'SS-8475',
    date: '2026-11-08',
    fullName: 'Nourhane Kacimi / نورهان قاسمي',
    phone: '0770 98 23 11',
    wilaya: '25 - Constantine / قسنطينة',
    address: 'Ali Mendjeli UV 7 / علي منجلي',
    itemsSummary: 'Bottines Cuir Noir (39 × 1)',
    total: 6490,
    status: 'shipping',
  },
  {
    id: 'SS-8460',
    date: '2026-11-07',
    fullName: 'Meriem Bouzid / مريم بوزيد',
    phone: '0550 33 21 09',
    wilaya: '19 - Sétif / سطيف',
    address: 'Cité Boumarchi / حي بومرشي',
    itemsSummary: 'Ballerines Mary Jane (37 × 2)',
    total: 7480,
    status: 'delivered',
  },
];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export const adminState = {
  activeTab: 'inventory', // 'inventory' | 'orders' | 'cms' | 'landing' | 'shipping'
  editingLandingId: null,
  editingProductId: null,
  previewLandingId: null,
  orderFilterStatus: 'all',
  inventorySearch: '',

  draftProductImage: IMAGES.talons,
  draftProductGallery: [],
  draftLandingMainImage: IMAGES.talons,
  draftLandingGallery: [IMAGES.talons, IMAGES.hero],
  draftCmsLogo: null,
  draftCmsHeroBg: null,

  cms: loadJSON(CMS_STORAGE_KEY, DEFAULT_CMS),
  landingPages: loadJSON(LANDING_STORAGE_KEY, DEFAULT_LANDING_PAGES),
  inventory: loadJSON(
    INVENTORY_STORAGE_KEY,
    PRODUCTS.map((p, idx) => ({
      id: p.id,
      name: p.name_ar || p.name_fr,
      name_fr: p.name_fr || p.name_ar,
      price: p.price,
      image: p.image,
      gallery: p.gallery || [p.image],
      category: p.category,
      stock: idx === 1 ? 3 : idx === 4 ? 2 : idx === 7 ? 4 : 14,
    }))
  ),
  orders: loadJSON(ORDERS_ADMIN_KEY, DEFAULT_ORDERS),
  shipping: loadJSON(SHIPPING_STORAGE_KEY, {
    freeShippingThreshold: 8000,
    rates: WILAYAS.map((w) => ({
      code: w.code,
      name: w.name_ar,
      name_fr: w.name_fr,
      homeFee: w.fee,
      deskFee: Math.max(250, w.fee - 150),
    })),
  }),

  syncWithStorefront() {
    this.inventory.forEach((invItem) => {
      const existing = PRODUCTS.find((p) => p.id === invItem.id);
      if (existing) {
        existing.name_ar = invItem.name || invItem.name_fr;
        existing.name_fr = invItem.name_fr || invItem.name;
        existing.price = Number(invItem.price);
        existing.image = invItem.image;
        existing.category = invItem.category;
        if (invItem.gallery && invItem.gallery.length > 0) {
          existing.gallery = invItem.gallery;
        }
      } else {
        PRODUCTS.unshift({
          id: invItem.id,
          name_fr: invItem.name_fr || invItem.name,
          name_ar: invItem.name || invItem.name_fr,
          category: invItem.category,
          price: Number(invItem.price),
          originalPrice: Math.round(Number(invItem.price) * 1.25),
          discountPercent: 20,
          rating: 4.9,
          reviewsCount: 45,
          isNew: true,
          isBestSeller: true,
          isSpecialOffer: false,
          colors: ['Rose', 'Noir', 'Beige'],
          sizes: [36, 37, 38, 39, 40],
          image: invItem.image,
          gallery:
            invItem.gallery && invItem.gallery.length > 0
              ? invItem.gallery
              : [invItem.image],
          description_fr: invItem.name_fr || invItem.name,
          description_ar: `${invItem.name || invItem.name_fr} بتصميم عصري وخامة مريحة عالية الجودة.`,
        });
      }
    });
  },

  reloadFromStorage() {
    this.cms = loadJSON(CMS_STORAGE_KEY, this.cms);
    this.landingPages = loadJSON(LANDING_STORAGE_KEY, this.landingPages);
    this.inventory = loadJSON(INVENTORY_STORAGE_KEY, this.inventory);
    this.orders = loadJSON(ORDERS_ADMIN_KEY, this.orders);
    this.shipping = loadJSON(SHIPPING_STORAGE_KEY, this.shipping);
    this.syncWithStorefront();
  },

  saveAll() {
    saveJSON(CMS_STORAGE_KEY, this.cms);
    saveJSON(LANDING_STORAGE_KEY, this.landingPages);
    saveJSON(INVENTORY_STORAGE_KEY, this.inventory);
    saveJSON(ORDERS_ADMIN_KEY, this.orders);
    saveJSON(SHIPPING_STORAGE_KEY, this.shipping);
    this.syncWithStorefront();
    notifyCrossTabSync('all', 'save');
  },
};

export async function initAdminFromSupabase() {
  const remoteData = await fetchAllFromSupabase();
  if (!remoteData) return false;

  let changed = false;
  if (remoteData.products) {
    adminState.inventory = remoteData.products;
    changed = true;
  }
  if (remoteData.orders) {
    adminState.orders = remoteData.orders;
    changed = true;
  }
  if (remoteData.cms) {
    const { freeShippingThreshold, ...cmsFields } = remoteData.cms;
    adminState.cms = { ...adminState.cms, ...cmsFields };
    if (freeShippingThreshold !== undefined) {
      adminState.shipping.freeShippingThreshold = freeShippingThreshold;
    }
    changed = true;
  }
  if (remoteData.landingPages) {
    adminState.landingPages = remoteData.landingPages;
    changed = true;
  }
  if (remoteData.shippingRates) {
    adminState.shipping.rates = remoteData.shippingRates;
    changed = true;
  }

  if (changed) {
    adminState.saveAll();
    renderAdminDashboard();
  }
  return changed;
}

adminState.syncWithStorefront();

function getProdDisplayName(prod) {
  const lang = getLang();
  return lang === 'fr' ? prod.name_fr || prod.name : prod.name || prod.name_fr;
}

function getWilayaDisplayName(rate) {
  const lang = getLang();
  if (lang === 'fr') {
    if (rate.name_fr) return rate.name_fr;
    const found = WILAYAS.find((w) => w.code === rate.code);
    return found ? found.name_fr : rate.name;
  }
  return rate.name;
}

export function renderAdminDashboard() {
  const root = document.getElementById('admin-dashboard-root');
  if (!root) return;

  const lang = getLang();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const tr = t();

  const lowStockItems = adminState.inventory.filter((item) => Number(item.stock) < 5);
  const newOrdersCount = adminState.orders.filter(
    (o) => normalizeStatusKey(o.status) === 'new'
  ).length;
  const totalRevenue = adminState.orders
    .filter((o) => normalizeStatusKey(o.status) !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const tabs = [
    {
      id: 'inventory',
      icon: '📦',
      label: tr.tabs.inventory,
      shortLabel: tr.tabs.inventoryShort,
      badge: adminState.inventory.length,
    },
    {
      id: 'orders',
      icon: '🛍️',
      label: tr.tabs.orders,
      shortLabel: tr.tabs.ordersShort,
      badge: adminState.orders.length,
    },
    {
      id: 'cms',
      icon: '🎨',
      label: tr.tabs.cms,
      shortLabel: tr.tabs.cmsShort,
      badge: 'CMS',
    },
    {
      id: 'landing',
      icon: '🚀',
      label: tr.tabs.landing,
      shortLabel: tr.tabs.landingShort,
      badge: adminState.landingPages.length,
    },
    {
      id: 'shipping',
      icon: '🚚',
      label: tr.tabs.shipping,
      shortLabel: tr.tabs.shippingShort,
      badge: adminState.shipping.rates.length,
    },
  ];

  root.innerHTML = `
    <div class="adm-shell" dir="${dir}" lang="${lang}">
      <!-- 1. الهيدر العلوي بنفس الهوية البصرية لـ ShoeStyle مع زر تبديل اللغة (العربية / Français) -->
      <header class="adm-header">
        <div class="adm-header-inner">
          <div class="adm-brand-lockup">
            ${renderShoeStyleHeelSVG()}
            <div>
              <span class="adm-brand-script">${adminState.cms.storeName}</span>
              <span class="adm-brand-tag">${tr.brandSubtitle}</span>
            </div>
          </div>

          <div class="adm-header-actions">
            <button
              type="button"
              data-adm-action="toggle-admin-lang"
              class="adm-btn adm-btn-soft adm-btn-sm"
            >
              <span>${tr.switchLangBtn}</span>
            </button>
            <button
              type="button"
              data-adm-action="close-admin"
              class="adm-btn adm-btn-pink adm-btn-sm"
            >
              <span>👁️</span>
              <span>${tr.viewStore}</span>
            </button>
            <button
              type="button"
              data-adm-action="logout-admin"
              class="adm-btn adm-btn-outline adm-btn-sm"
            >
              <span>${tr.logout}</span>
            </button>
          </div>
        </div>

        <!-- شريط التبويبات السلس -->
        <nav class="adm-desktop-tabs">
          ${tabs
            .map(
              (tab) => `
              <button
                type="button"
                data-adm-action="switch-tab"
                data-tab="${tab.id}"
                class="adm-tab-pill ${adminState.activeTab === tab.id ? 'active' : ''}"
              >
                <span>${tab.icon}</span>
                <span>${tab.label}</span>
                <span class="adm-tab-pill-badge">${tab.badge}</span>
              </button>
            `
            )
            .join('')}
        </nav>
      </header>

      <!-- 2. المحتوى الرئيسي المبسط والمناسب للهاتف -->
      <main class="adm-container">
        <!-- ملخص سريع (KPIs) -->
        <section class="adm-kpi-strip">
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${tr.kpi.totalSales}</span>
            <span class="adm-kpi-num">${formatDA(totalRevenue, lang)}</span>
            <span class="adm-kpi-foot">${tr.kpi.totalOrdersFoot(adminState.orders.length)}</span>
          </div>
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${tr.kpi.newOrders}</span>
            <span class="adm-kpi-num">${newOrdersCount} ${tr.kpi.orderUnit}</span>
            <span class="adm-kpi-foot">${tr.kpi.awaitingConfirm}</span>
          </div>
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${tr.kpi.productsCount}</span>
            <span class="adm-kpi-num">${adminState.inventory.length} ${tr.kpi.shoeUnit}</span>
            <span class="adm-kpi-foot">${tr.kpi.lowStockFoot(lowStockItems.length)}</span>
          </div>
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${tr.kpi.freeShipping}</span>
            <span class="adm-kpi-num">${formatDA(adminState.shipping.freeShippingThreshold, lang)}</span>
            <span class="adm-kpi-foot">${tr.kpi.activeWilayas(adminState.shipping.rates.length)}</span>
          </div>
        </section>

        <!-- تبويب 1: المنتجات والمخزون -->
        <section id="adm-tab-inventory" class="adm-tab-section ${adminState.activeTab === 'inventory' ? 'active' : ''}">
          ${renderInventorySection()}
        </section>

        <!-- تبويب 2: الطلبات والمبيعات -->
        <section id="adm-tab-orders" class="adm-tab-section ${adminState.activeTab === 'orders' ? 'active' : ''}">
          ${renderOrdersSection()}
        </section>

        <!-- تبويب 3: واجهة ومحتوى الموقع -->
        <section id="adm-tab-cms" class="adm-tab-section ${adminState.activeTab === 'cms' ? 'active' : ''}">
          ${renderCMSSection()}
        </section>

        <!-- تبويب 4: صفحات الهبوط والعروض -->
        <section id="adm-tab-landing" class="adm-tab-section ${adminState.activeTab === 'landing' ? 'active' : ''}">
          ${renderLandingBuilderSection()}
        </section>

        <!-- تبويب 5: أسعار التوصيل والشحن -->
        <section id="adm-tab-shipping" class="adm-tab-section ${adminState.activeTab === 'shipping' ? 'active' : ''}">
          ${renderShippingSection()}
        </section>
      </main>

      <!-- 3. شريط التنقل السفلي للهاتف (Mobile Bottom Bar) -->
      <nav class="adm-bottom-nav">
        ${tabs
          .map(
            (tab) => `
            <button
              type="button"
              data-adm-action="switch-tab"
              data-tab="${tab.id}"
              class="adm-bottom-nav-btn ${adminState.activeTab === tab.id ? 'active' : ''}"
            >
              <span class="adm-bnav-icon">${tab.icon}</span>
              <span class="adm-bnav-label">${tab.shortLabel}</span>
            </button>
          `
          )
          .join('')}
      </nav>
    </div>

    <!-- نافذة معاينة صفحة الهبوط -->
    <div id="adm-landing-modal" class="adm-modal-backdrop ${adminState.previewLandingId ? 'open' : ''}">
      ${renderLandingPreviewModal()}
    </div>
  `;
}

/**
 * القسم 1: إدارة المنتجات والمخزون
 */
function renderInventorySection() {
  const tr = t();
  const lang = getLang();

  const editingProd = adminState.editingProductId
    ? adminState.inventory.find((p) => p.id === adminState.editingProductId)
    : null;

  const currentProdImg =
    adminState.draftProductImage || (editingProd ? editingProd.image : IMAGES.talons);
  const currentProdGallery = adminState.draftProductGallery || [];

  const lowStockItems = adminState.inventory.filter((p) => Number(p.stock) < 5);

  const q = adminState.inventorySearch.trim().toLowerCase();
  const filteredProducts = adminState.inventory.filter(
    (p) =>
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.name_fr && p.name_fr.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
  );

  return `
    ${
      lowStockItems.length > 0
        ? `<div class="adm-alert-low" role="alert">
            <span>${tr.inv.lowStockAlert(lowStockItems.map((i) => getProdDisplayName(i)).join(' · '))}</span>
            <span class="adm-badge adm-badge-cancelled">${tr.inv.productsBadge(lowStockItems.length)}</span>
          </div>`
        : ''
    }

    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">
            ${editingProd ? tr.inv.editProdTitle(getProdDisplayName(editingProd)) : tr.inv.addProdTitle}
          </h2>
          <p class="adm-card-sub">${tr.inv.prodFormSub}</p>
        </div>
        ${
          editingProd
            ? `<button type="button" data-adm-action="cancel-product-edit" class="adm-btn adm-btn-outline adm-btn-sm">${tr.inv.cancelEdit}</button>`
            : ''
        }
      </div>

      <form id="adm-product-form" class="adm-form-grid">
        <div class="adm-field full">
          <label class="adm-label">${tr.inv.mainPhotoLabel}</label>
          <div class="adm-upload-box">
            <div class="adm-upload-left">
              <img
                id="adm-prod-img-preview"
                src="${currentProdImg}"
                alt="Product"
                referrerpolicy="no-referrer"
                class="adm-upload-thumb"
              />
              <div>
                <span class="adm-upload-title">${tr.inv.uploadTapTitle}</span>
                <span class="adm-upload-sub">${tr.inv.uploadTapSub}</span>
              </div>
            </div>
            <span class="adm-btn adm-btn-pink adm-btn-sm">${tr.inv.uploadBtn}</span>
            <input
              id="adm-prod-file-input"
              type="file"
              accept="image/*"
              class="adm-file-hidden"
            />
          </div>
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.inv.nameArLabel}</label>
          <input
            name="name"
            type="text"
            class="adm-input"
            placeholder="${tr.inv.nameArPlaceholder}"
            value="${editingProd ? editingProd.name : ''}"
            required
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.inv.nameFrLabel}</label>
          <input
            name="name_fr"
            type="text"
            class="adm-input"
            placeholder="${tr.inv.nameFrPlaceholder}"
            value="${editingProd ? editingProd.name_fr || editingProd.name : ''}"
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.inv.categoryLabel}</label>
          <select name="category" class="adm-select">
            ${Object.keys(CATEGORY_LABELS)
              .map(
                (catId) =>
                  `<option value="${catId}" ${editingProd && editingProd.category === catId ? 'selected' : ''}>${CATEGORY_LABELS[catId][lang]}</option>`
              )
              .join('')}
          </select>
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.inv.priceLabel}</label>
          <input
            name="price"
            type="number"
            min="100"
            class="adm-input"
            placeholder="4990"
            value="${editingProd ? editingProd.price : ''}"
            required
          />
        </div>

        <div class="adm-field full">
          <label class="adm-label">${tr.inv.stockLabel}</label>
          <input
            name="stock"
            type="number"
            min="0"
            class="adm-input"
            placeholder="15"
            value="${editingProd ? editingProd.stock : '12'}"
            required
          />
        </div>

        <div class="adm-field full">
          <label class="adm-label">${tr.inv.galleryLabel}</label>
          <div class="adm-upload-box">
            <div class="adm-upload-left">
              <div>
                <span class="adm-upload-title">${tr.inv.galleryTapTitle(currentProdGallery.length)}</span>
                <span class="adm-upload-sub">${tr.inv.galleryTapSub}</span>
              </div>
            </div>
            <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.inv.galleryBtn}</span>
            <input
              id="adm-prod-gallery-input"
              type="file"
              accept="image/*"
              multiple
              class="adm-file-hidden"
            />
          </div>
          ${
            currentProdGallery.length > 0
              ? `<div class="adm-thumbs-row">
                  ${currentProdGallery
                    .map(
                      (gImg, idx) => `
                      <div class="adm-thumb-chip">
                        <img src="${gImg}" alt="Gallery ${idx + 1}" referrerpolicy="no-referrer" />
                        <button
                          type="button"
                          data-adm-action="remove-prod-gallery-img"
                          data-index="${idx}"
                          class="adm-thumb-del"
                        >×</button>
                      </div>
                    `
                    )
                    .join('')}
                </div>`
              : ''
          }
        </div>

        <div class="adm-field full">
          <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.85rem;">
            ${editingProd ? tr.inv.saveProdChanges : tr.inv.addProdNow}
          </button>
        </div>
      </form>
    </div>

    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.inv.currentProdsTitle(filteredProducts.length)}</h2>
          <p class="adm-card-sub">${tr.inv.currentProdsSub}</p>
        </div>
        <div style="width:100%; max-width:280px;">
          <input
            id="adm-inventory-search"
            type="search"
            class="adm-input"
            placeholder="${tr.inv.searchPlaceholder}"
            value="${adminState.inventorySearch}"
          />
        </div>
      </div>

      <div id="adm-inventory-grid" class="adm-products-grid">
        ${renderInventoryCards(filteredProducts)}
      </div>
    </div>
  `;
}

function renderInventoryCards(productsList) {
  const tr = t();
  const lang = getLang();

  return productsList
    .map((p) => {
      const isLow = Number(p.stock) < 5;
      const isOut = Number(p.stock) === 0;
      const displayName = getProdDisplayName(p);
      return `
        <article id="adm-prod-card-${p.id}" class="adm-prod-card ${isLow ? 'low-stock' : ''}">
          <div class="adm-prod-top">
            <label class="adm-prod-img-wrap">
              <img
                id="adm-row-thumb-${p.id}"
                src="${p.image}"
                alt="${displayName}"
                referrerpolicy="no-referrer"
              />
              <span class="adm-prod-cam-btn">${tr.inv.changePhotoBtn}</span>
              <input
                type="file"
                accept="image/*"
                data-adm-row-img-upload="${p.id}"
                style="display:none;"
              />
            </label>

            <div class="adm-prod-info">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:0.4rem;">
                <span style="font-size:0.7rem; font-weight:700; color:var(--adm-text-muted);">${p.category}</span>
                <span id="adm-stock-badge-${p.id}">
                  ${
                    isOut
                      ? `<span class="adm-badge adm-badge-cancelled">${tr.inv.outOfStock}</span>`
                      : isLow
                      ? `<span class="adm-badge adm-badge-confirming">${tr.inv.lowStockBadge(p.stock)}</span>`
                      : `<span class="adm-badge adm-badge-delivered">${tr.inv.inStockBadge(p.stock)}</span>`
                  }
                </span>
              </div>
              <h3 class="adm-prod-name">${displayName}</h3>
              <div class="adm-prod-price">${formatDA(p.price, lang)}</div>
            </div>
          </div>

          <div class="adm-prod-bottom">
            <div class="adm-stock-stepper">
              <button
                type="button"
                data-adm-action="step-stock"
                data-id="${p.id}"
                data-delta="1"
                class="adm-step-btn"
              >+</button>
              <input
                id="adm-stock-input-${p.id}"
                type="number"
                min="0"
                data-adm-stock-id="${p.id}"
                value="${p.stock}"
                class="adm-stock-num-input"
              />
              <button
                type="button"
                data-adm-action="step-stock"
                data-id="${p.id}"
                data-delta="-1"
                class="adm-step-btn"
              >−</button>
            </div>

            <div style="display:flex; gap:0.35rem;">
              <button
                type="button"
                data-adm-action="edit-product"
                data-id="${p.id}"
                class="adm-btn adm-btn-soft adm-btn-sm"
              >
                ${tr.inv.editBtn}
              </button>
              <button
                type="button"
                data-adm-action="delete-product"
                data-id="${p.id}"
                class="adm-btn adm-btn-danger adm-btn-sm"
              >
                ${tr.inv.deleteBtn}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

/**
 * القسم 2: إدارة الطلبات والمبيعات
 */
function renderOrdersSection() {
  const tr = t();
  const lang = getLang();

  const filteredOrders =
    adminState.orderFilterStatus === 'all'
      ? adminState.orders
      : adminState.orders.filter(
          (o) => normalizeStatusKey(o.status) === adminState.orderFilterStatus
        );

  return `
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.orders.title(filteredOrders.length)}</h2>
          <p class="adm-card-sub">${tr.orders.sub}</p>
        </div>

        <button
          type="button"
          data-adm-action="add-demo-order"
          class="adm-btn adm-btn-soft adm-btn-sm"
        >
          ${tr.orders.addDemoBtn}
        </button>
      </div>

      <div style="display:flex; gap:0.4rem; overflow-x:auto; padding-bottom:0.85rem; margin-bottom:0.75rem;">
        <button
          type="button"
          data-adm-action="filter-orders"
          data-status="all"
          class="adm-tab-pill ${adminState.orderFilterStatus === 'all' ? 'active' : ''}"
          style="padding:0.4rem 0.85rem; font-size:0.76rem;"
        >
          ${tr.orders.allFilter(adminState.orders.length)}
        </button>
        ${STATUS_KEYS.map(
          (stKey) => `
            <button
              type="button"
              data-adm-action="filter-orders"
              data-status="${stKey}"
              class="adm-tab-pill ${adminState.orderFilterStatus === stKey ? 'active' : ''}"
              style="padding:0.4rem 0.85rem; font-size:0.76rem;"
            >
              ${tr.orders.statuses[stKey]}
            </button>
          `
        ).join('')}
      </div>

      <div class="adm-orders-list">
        ${
          filteredOrders.length === 0
            ? `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--adm-text-muted);">${tr.orders.emptyOrders}</div>`
            : filteredOrders
                .map((order) => {
                  const stKey = normalizeStatusKey(order.status);
                  return `
                  <article class="adm-order-card">
                    <div class="adm-order-top">
                      <div>
                        <strong style="color:var(--adm-pink); font-size:0.9rem;">#${order.id}</strong>
                        <span style="font-size:0.74rem; color:var(--adm-text-muted); margin-inline-start:0.4rem;">📅 ${order.date}</span>
                      </div>
                      <span id="adm-order-badge-${order.id}" class="${getStatusBadgeClass(stKey)}">
                        ${getStatusLabel(stKey)}
                      </span>
                    </div>

                    <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                      <div>
                        <strong style="font-size:0.92rem; display:block;">👤 ${order.fullName}</strong>
                        <span style="font-size:0.78rem; color:var(--adm-text-body);">📍 ${order.wilaya} — ${order.address}</span>
                      </div>
                      <a
                        href="tel:${order.phone}"
                        class="adm-btn adm-btn-soft adm-btn-sm"
                        style="text-decoration:none;"
                      >
                        📞 ${order.phone}
                      </a>
                    </div>

                    <div style="background:var(--adm-pink-soft); padding:0.6rem 0.8rem; border-radius:12px; font-size:0.8rem; color:var(--adm-text-body);">
                      👠 ${
                        order.itemsSummary ||
                        (order.items
                          ? order.items
                              .map(
                                (i) =>
                                  `${i.name || i.product?.name_fr || i.product?.name_ar || 'ShoeStyle'} (${tr.orders.sizeWord} ${i.size} × ${i.quantity})`
                              )
                              .join(' + ')
                          : 'ShoeStyle')
                      }
                    </div>

                    <div style="display:flex; align-items:center; justify-content:space-between; gap:0.6rem; padding-top:0.4rem;">
                      <div>
                        <span style="font-size:0.72rem; color:var(--adm-text-muted); display:block;">${tr.orders.totalAmount}</span>
                        <strong style="font-size:1.05rem; color:var(--adm-pink);">${formatDA(order.total, lang)}</strong>
                      </div>

                      <div style="display:flex; align-items:center; gap:0.4rem; flex:1; max-width:230px;">
                        <select
                          data-adm-order-status="${order.id}"
                          class="adm-select"
                          style="padding:0.45rem 0.65rem; font-size:0.8rem;"
                        >
                          ${STATUS_KEYS.map(
                            (k) =>
                              `<option value="${k}" ${stKey === k ? 'selected' : ''}>${tr.orders.statuses[k]}</option>`
                          ).join('')}
                        </select>
                        <button
                          type="button"
                          data-adm-action="delete-order"
                          data-id="${order.id}"
                          class="adm-btn adm-btn-danger adm-btn-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </article>
                `;
                })
                .join('')
        }
      </div>
    </div>
  `;
}

/**
 * القسم 3: التحكم الشامل في واجهة ومحتوى الموقع (Full Website CMS)
 */
function renderCMSSection() {
  const tr = t();
  const c = adminState.cms;
  const currentLogo = adminState.draftCmsLogo || c.logoUrl;
  const currentHeroBg = adminState.draftCmsHeroBg || c.heroBgUrl;

  return `
    <div class="adm-card" style="padding:0; overflow:hidden;">
      <div style="background:var(--adm-pink-light); color:var(--adm-pink); padding:0.55rem 1rem; font-size:0.76rem; font-weight:800; display:flex; justify-content:space-between;">
        <span>${tr.cms.livePreviewBanner}</span>
        <span>ShoeStyle Live</span>
      </div>

      <div
        id="preview-ann-bar"
        style="background:#de1b61; color:#fff; text-align:center; padding:0.4rem 0.75rem; font-size:0.74rem; font-weight:700; display:${c.announcementEnabled ? 'block' : 'none'};"
      >
        ${c.announcementText}
      </div>

      <div style="background:#fff; padding:0.65rem 1rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05);">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <img id="preview-logo-img" src="${currentLogo}" alt="Logo" referrerpolicy="no-referrer" style="width:32px; height:32px; border-radius:8px; object-fit:cover;" />
          <strong id="preview-store-name" style="font-family:'Dancing Script', cursive; font-size:1.5rem;">${c.storeName}</strong>
        </div>
        <span style="font-size:0.74rem; color:#71717a;">${tr.cms.navLinksPreview}</span>
      </div>

      <div
        id="preview-hero-box"
        style="position:relative; min-height:190px; background-image:url('${currentHeroBg}'); background-size:cover; background-position:center; display:flex; align-items:center; padding:1.25rem;"
      >
        <div style="position:absolute; inset:0; background:linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(252,232,238,0.92) 65%);"></div>
        <div style="position:relative; z-index:2; max-width:75%;">
          <h3 id="preview-hero-title" style="font-size:1.25rem; font-weight:800; margin:0 0 0.3rem; color:#18181b;">${c.heroTitle}</h3>
          <p id="preview-hero-sub" style="font-size:0.76rem; color:#3f3f46; margin:0 0 0.75rem;">${c.heroSubtitle}</p>
          <span id="preview-hero-btn" class="adm-btn adm-btn-pink adm-btn-sm">${c.heroBtnText}</span>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; padding:0.75rem; background:#fff;">
        ${c.features
          .map(
            (f, idx) => `
            <div style="background:var(--adm-pink-soft); border-radius:12px; padding:0.55rem; text-align:center;">
              <span id="preview-feat-icon-${idx}" style="font-size:1.1rem; display:block;">${f.icon}</span>
              <strong id="preview-feat-title-${idx}" style="font-size:0.72rem; display:block; color:#18181b;">${f.title}</strong>
              <span id="preview-feat-desc-${idx}" style="font-size:0.64rem; color:#71717a;">${f.desc}</span>
            </div>
          `
          )
          .join('')}
      </div>
    </div>

    <form id="adm-cms-form" class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.cms.formTitle}</h2>
          <p class="adm-card-sub">${tr.cms.formSub}</p>
        </div>
        <button type="submit" class="adm-btn adm-btn-pink">
          ${tr.cms.saveBtn}
        </button>
      </div>

      <div class="adm-form-grid">
        <div class="adm-field">
          <label class="adm-label" for="cms-store-name">${tr.cms.storeNameLabel}</label>
          <input id="cms-store-name" name="storeName" type="text" class="adm-input" value="${c.storeName}" required />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.cms.logoLabel}</label>
          <div class="adm-upload-box" style="padding:0.5rem 0.75rem;">
            <div class="adm-upload-left">
              <img id="cms-logo-preview-thumb" src="${currentLogo}" alt="Logo" referrerpolicy="no-referrer" style="width:40px; height:40px; border-radius:10px; object-fit:cover;" />
              <span class="adm-upload-title" style="font-size:0.78rem;">${tr.cms.logoUploadTitle}</span>
            </div>
            <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.cms.chooseBtn}</span>
            <input id="cms-logo-file-input" type="file" accept="image/*" class="adm-file-hidden" />
          </div>
        </div>

        <div class="adm-field full">
          <div class="adm-switch-row">
            <div>
              <strong style="font-size:0.84rem; display:block;">${tr.cms.annSwitchTitle}</strong>
              <span style="font-size:0.72rem; color:var(--adm-text-muted);">${tr.cms.annSwitchSub}</span>
            </div>
            <label class="adm-switch">
              <input id="cms-ann-enabled" name="announcementEnabled" type="checkbox" ${c.announcementEnabled ? 'checked' : ''} />
              <span class="adm-switch-slider"></span>
            </label>
          </div>
        </div>

        <div class="adm-field full">
          <label class="adm-label" for="cms-ann-text">${tr.cms.annTextLabel}</label>
          <input id="cms-ann-text" name="announcementText" type="text" class="adm-input" value="${c.announcementText}" />
        </div>

        <div class="adm-field">
          <label class="adm-label" for="cms-hero-title">${tr.cms.heroTitleLabel}</label>
          <input id="cms-hero-title" name="heroTitle" type="text" class="adm-input" value="${c.heroTitle}" required />
        </div>

        <div class="adm-field">
          <label class="adm-label" for="cms-hero-btn">${tr.cms.heroBtnLabel}</label>
          <input id="cms-hero-btn" name="heroBtnText" type="text" class="adm-input" value="${c.heroBtnText}" required />
        </div>

        <div class="adm-field full">
          <label class="adm-label" for="cms-hero-sub">${tr.cms.heroSubLabel}</label>
          <textarea id="cms-hero-sub" name="heroSubtitle" class="adm-textarea">${c.heroSubtitle}</textarea>
        </div>

        <div class="adm-field full">
          <label class="adm-label">${tr.cms.heroImgLabel}</label>
          <div class="adm-upload-box">
            <div class="adm-upload-left">
              <img id="cms-hero-preview-thumb" src="${currentHeroBg}" alt="Hero" referrerpolicy="no-referrer" class="adm-upload-thumb" />
              <div>
                <span class="adm-upload-title">${tr.cms.heroImgTitle}</span>
                <span class="adm-upload-sub">${tr.cms.heroImgSub}</span>
              </div>
            </div>
            <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.inv.uploadBtn}</span>
            <input id="cms-hero-file-input" type="file" accept="image/*" class="adm-file-hidden" />
          </div>
        </div>

        ${c.features
          .map(
            (f, idx) => `
            <div class="adm-field">
              <label class="adm-label">${tr.cms.featLabel(idx + 1)}</label>
              <div style="display:flex; gap:0.4rem;">
                <input name="featIcon_${idx}" data-cms-feat-icon="${idx}" type="text" class="adm-input" style="width:58px; text-align:center;" value="${f.icon}" />
                <input name="featTitle_${idx}" data-cms-feat-title="${idx}" type="text" class="adm-input" value="${f.title}" />
              </div>
            </div>
            <div class="adm-field">
              <label class="adm-label">${tr.cms.featDescLabel(idx + 1)}</label>
              <input name="featDesc_${idx}" data-cms-feat-desc="${idx}" type="text" class="adm-input" value="${f.desc}" />
            </div>
          `
          )
          .join('')}

        <div class="adm-field full">
          <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.85rem;">
            ${tr.cms.saveAllCmsBtn}
          </button>
        </div>
      </div>
    </form>
  `;
}

/**
 * القسم 4: منشئ صفحات الهبوط الترويجية (Landing Pages Builder)
 */
function renderLandingBuilderSection() {
  const tr = t();
  const lang = getLang();

  const editingPage = adminState.editingLandingId
    ? adminState.landingPages.find((lp) => lp.id === adminState.editingLandingId)
    : null;

  const mainImg =
    adminState.draftLandingMainImage || (editingPage ? editingPage.imageUrl : IMAGES.talons);
  const galleryList =
    adminState.draftLandingGallery ||
    (editingPage && editingPage.gallery ? editingPage.gallery : [mainImg]);

  return `
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">
            ${editingPage ? tr.lp.editTitle(editingPage.title) : tr.lp.createTitle}
          </h2>
          <p class="adm-card-sub">${tr.lp.sub}</p>
        </div>
        ${
          editingPage
            ? `<button type="button" data-adm-action="cancel-landing-edit" class="adm-btn adm-btn-outline adm-btn-sm">${tr.lp.cancelBtn}</button>`
            : ''
        }
      </div>

      <form id="adm-landing-form" class="adm-form-grid">
        <div class="adm-field">
          <label class="adm-label">${tr.lp.offerTitleLabel}</label>
          <input
            name="title"
            type="text"
            class="adm-input"
            placeholder="${tr.lp.offerTitlePlaceholder}"
            value="${editingPage ? editingPage.title : ''}"
            required
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.lp.slugLabel}</label>
          <input
            name="slug"
            type="text"
            dir="ltr"
            class="adm-input"
            value="${editingPage ? editingPage.slug : '/offer/special-promo'}"
            required
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.lp.origPriceLabel}</label>
          <input
            name="originalPrice"
            type="number"
            min="0"
            class="adm-input"
            value="${editingPage ? editingPage.originalPrice : '6500'}"
            required
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.lp.discPriceLabel}</label>
          <input
            name="discountPrice"
            type="number"
            min="0"
            class="adm-input"
            value="${editingPage ? editingPage.discountPrice : '4500'}"
            required
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.lp.mainImgLabel}</label>
          <div class="adm-upload-box">
            <div class="adm-upload-left">
              <img id="lp-main-preview-thumb" src="${mainImg}" alt="Offer" referrerpolicy="no-referrer" class="adm-upload-thumb" />
              <div>
                <span class="adm-upload-title">${tr.lp.mainImgTitle}</span>
                <span class="adm-upload-sub">${tr.lp.mainImgSub}</span>
              </div>
            </div>
            <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.cms.chooseBtn}</span>
            <input id="adm-lp-main-file" type="file" accept="image/*" class="adm-file-hidden" />
          </div>
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.lp.galleryLabel}</label>
          <div class="adm-upload-box">
            <div class="adm-upload-left">
              <div>
                <span class="adm-upload-title">${tr.lp.galleryTitle(galleryList.length)}</span>
                <span class="adm-upload-sub">${tr.lp.gallerySub}</span>
              </div>
            </div>
            <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.lp.addPhotosBtn}</span>
            <input id="adm-lp-gallery-files" type="file" accept="image/*" multiple class="adm-file-hidden" />
          </div>
          <div class="adm-thumbs-row">
            ${galleryList
              .map(
                (imgSrc, idx) => `
                <div class="adm-thumb-chip">
                  <img src="${imgSrc}" alt="Photo ${idx + 1}" referrerpolicy="no-referrer" />
                  <button
                    type="button"
                    data-adm-action="remove-lp-gallery-img"
                    data-index="${idx}"
                    class="adm-thumb-del"
                  >×</button>
                </div>
              `
              )
              .join('')}
          </div>
        </div>

        <div class="adm-field full">
          <label class="adm-label">${tr.lp.descLabel}</label>
          <textarea
            name="description"
            class="adm-textarea"
            placeholder="${tr.lp.descPlaceholder}"
            required
          >${editingPage ? editingPage.description : ''}</textarea>
        </div>

        <div class="adm-field full">
          <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.85rem;">
            ${editingPage ? tr.lp.updateBtn : tr.lp.createBtn}
          </button>
        </div>
      </form>
    </div>

    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.lp.activeListTitle(adminState.landingPages.length)}</h2>
          <p class="adm-card-sub">${tr.lp.activeListSub}</p>
        </div>
      </div>

      <div class="adm-orders-list">
        ${adminState.landingPages
          .map(
            (lp) => `
            <article class="adm-order-card">
              <div style="display:flex; gap:0.85rem; align-items:center;">
                <img src="${lp.imageUrl}" alt="${lp.title}" referrerpolicy="no-referrer" style="width:74px; height:74px; border-radius:14px; object-fit:cover; flex-shrink:0;" />
                <div style="flex:1; min-width:0;">
                  <strong style="font-size:0.9rem; display:block;">${lp.title}</strong>
                  <span dir="ltr" style="font-size:0.74rem; color:var(--adm-pink); font-family:monospace;">${lp.slug}</span>
                  <div style="margin-top:4px;">
                    <strong style="color:var(--adm-pink); font-size:0.95rem;">${formatDA(lp.discountPrice, lang)}</strong>
                    <span style="text-decoration:line-through; color:var(--adm-text-muted); font-size:0.76rem; margin-inline-start:6px;">${formatDA(lp.originalPrice, lang)}</span>
                  </div>
                </div>
              </div>

              <div style="display:flex; gap:0.4rem; justify-content:flex-end; border-top:1px solid rgba(0,0,0,0.05); padding-top:0.6rem;">
                <button
                  type="button"
                  data-adm-action="preview-landing"
                  data-id="${lp.id}"
                  class="adm-btn adm-btn-pink adm-btn-sm"
                >
                  ${tr.lp.previewBtn}
                </button>
                <button
                  type="button"
                  data-adm-action="edit-landing"
                  data-id="${lp.id}"
                  class="adm-btn adm-btn-soft adm-btn-sm"
                >
                  ${tr.inv.editBtn}
                </button>
                <button
                  type="button"
                  data-adm-action="delete-landing"
                  data-id="${lp.id}"
                  class="adm-btn adm-btn-danger adm-btn-sm"
                >
                  ${tr.inv.deleteBtn}
                </button>
              </div>
            </article>
          `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderLandingPreviewModal() {
  if (!adminState.previewLandingId) return '';
  const lp = adminState.landingPages.find((item) => item.id === adminState.previewLandingId);
  if (!lp) return '';

  const tr = t();
  const lang = getLang();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const gallery =
    Array.isArray(lp.gallery) && lp.gallery.length > 0 ? lp.gallery : [lp.imageUrl];

  return `
    <div class="adm-modal-card" dir="${dir}">
      <div style="background:var(--adm-pink-light); padding:0.85rem 1.25rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid var(--adm-border);">
        <strong style="color:var(--adm-pink); font-size:0.86rem;">${tr.lp.modalHeader(lp.slug)}</strong>
        <button
          type="button"
          data-adm-action="close-landing-modal"
          class="adm-btn adm-btn-danger adm-btn-sm"
        >
          ${tr.lp.closeModal}
        </button>
      </div>

      <div style="padding:1.25rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1.25rem;">
        <div>
          <div style="border-radius:18px; overflow:hidden; aspect-ratio:4/3; margin-bottom:0.6rem; background:#fdf2f6;">
            <img id="lp-modal-main-img" src="${lp.imageUrl}" alt="${lp.title}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover;" />
          </div>
          <div style="display:flex; gap:0.45rem; overflow-x:auto;">
            ${gallery
              .map(
                (imgUrl) => `
                <img
                  src="${imgUrl}"
                  alt="Thumb"
                  data-adm-action="swap-lp-img"
                  data-src="${imgUrl}"
                  style="width:58px; height:58px; border-radius:12px; object-fit:cover; cursor:pointer; border:2px solid var(--adm-pink);"
                />
              `
              )
              .join('')}
          </div>
          <h3 style="font-size:1.15rem; font-weight:800; margin:0.85rem 0 0.35rem;">${lp.title}</h3>
          <div style="margin-bottom:0.6rem;">
            <strong style="font-size:1.4rem; color:var(--adm-pink);">${formatDA(lp.discountPrice, lang)}</strong>
            <span style="text-decoration:line-through; color:var(--adm-text-muted); margin-inline-start:8px;">${formatDA(lp.originalPrice, lang)}</span>
          </div>
          <p style="font-size:0.84rem; color:var(--adm-text-body);">${lp.description}</p>
        </div>

        <div style="background:var(--adm-pink-soft); border:1.5px solid var(--adm-border); border-radius:18px; padding:1.15rem;">
          <h4 style="margin:0 0 0.25rem; color:var(--adm-pink); font-size:1rem;">${tr.lp.quickOrderTitle}</h4>
          <p style="margin:0 0 0.9rem; font-size:0.75rem; color:var(--adm-text-muted);">${tr.lp.quickOrderSub}</p>

          <form id="adm-lp-quick-order-form" data-lp-id="${lp.id}" style="display:flex; flex-direction:column; gap:0.7rem;">
            <input name="fullName" type="text" required class="adm-input" style="background:#fff;" placeholder="${tr.lp.fullNamePlaceholder}" />
            <input name="phone" type="tel" required class="adm-input" style="background:#fff;" placeholder="${tr.lp.phonePlaceholder}" />
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
              <select name="wilaya" class="adm-select" style="background:#fff;">
                ${adminState.shipping.rates
                  .map(
                    (w) =>
                      `<option value="${w.code} - ${getWilayaDisplayName(w)}">${w.code} - ${getWilayaDisplayName(w)}</option>`
                  )
                  .join('')}
              </select>
              <select name="size" class="adm-select" style="background:#fff;">
                <option value="36">${tr.orders.sizeWord} 36</option>
                <option value="37" selected>${tr.orders.sizeWord} 37</option>
                <option value="38">${tr.orders.sizeWord} 38</option>
                <option value="39">${tr.orders.sizeWord} 39</option>
                <option value="40">${tr.orders.sizeWord} 40</option>
              </select>
            </div>
            <input name="address" type="text" required class="adm-input" style="background:#fff;" placeholder="${tr.lp.addressPlaceholder}" />
            <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.8rem;">
              ${tr.lp.confirmQuickOrder(formatDA(lp.discountPrice, lang))}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * القسم 5: إعدادات الشحن وأسعار التوصيل (Shipping Rates)
 */
function renderShippingSection() {
  const tr = t();

  return `
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.ship.title}</h2>
          <p class="adm-card-sub">${tr.ship.sub}</p>
        </div>
      </div>

      <form id="adm-shipping-threshold-form" class="adm-form-grid" style="align-items:end; margin-bottom:1.25rem;">
        <div class="adm-field">
          <label class="adm-label">${tr.ship.thresholdLabel}</label>
          <input
            id="adm-free-shipping-input"
            type="number"
            min="0"
            step="100"
            class="adm-input"
            value="${adminState.shipping.freeShippingThreshold}"
          />
        </div>
        <div class="adm-field">
          <button type="submit" class="adm-btn adm-btn-pink" style="width:100%;">
            ${tr.ship.saveThresholdBtn}
          </button>
        </div>
      </form>

      <form id="adm-add-wilaya-form" class="adm-form-grid" style="padding-top:1rem; border-top:1px solid var(--adm-border);">
        <div class="adm-field">
          <label class="adm-label">${tr.ship.addWilayaLabel}</label>
          <div style="display:flex; gap:0.4rem;">
            <input name="code" type="text" class="adm-input" placeholder="06" style="width:72px;" required />
            <input name="name" type="text" class="adm-input" placeholder="${tr.ship.wilayaNamePlaceholder}" required />
          </div>
        </div>
        <div class="adm-field">
          <label class="adm-label">${tr.ship.feesLabel}</label>
          <div style="display:flex; gap:0.4rem;">
            <input name="homeFee" type="number" class="adm-input" placeholder="${tr.ship.homePlaceholder}" required />
            <input name="deskFee" type="number" class="adm-input" placeholder="${tr.ship.deskPlaceholder}" required />
            <button type="submit" class="adm-btn adm-btn-soft">${tr.ship.addBtn}</button>
          </div>
        </div>
      </form>
    </div>

    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.ship.ratesListTitle(adminState.shipping.rates.length)}</h2>
          <p class="adm-card-sub">${tr.ship.ratesListSub}</p>
        </div>
      </div>

      <div class="adm-products-grid">
        ${adminState.shipping.rates
          .map(
            (r, idx) => `
            <div class="adm-prod-card" style="gap:0.5rem;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <strong style="font-size:0.9rem; color:var(--adm-pink);">${r.code} - ${getWilayaDisplayName(r)}</strong>
                <button
                  type="button"
                  data-adm-action="delete-wilaya"
                  data-index="${idx}"
                  class="adm-btn adm-btn-danger adm-btn-sm"
                  style="padding:0.2rem 0.55rem;"
                >${tr.inv.deleteBtn}</button>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
                <div>
                  <span style="font-size:0.7rem; color:var(--adm-text-muted); display:block;">${tr.ship.homeFeeLabel}</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    data-adm-ship-home="${idx}"
                    value="${r.homeFee}"
                    class="adm-input"
                    style="padding:0.4rem 0.6rem; font-weight:700;"
                  />
                </div>
                <div>
                  <span style="font-size:0.7rem; color:var(--adm-text-muted); display:block;">${tr.ship.deskFeeLabel}</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    data-adm-ship-desk="${idx}"
                    value="${r.deskFee}"
                    class="adm-input"
                    style="padding:0.4rem 0.6rem; font-weight:700;"
                  />
                </div>
              </div>
            </div>
          `
          )
          .join('')}
      </div>
    </div>
  `;
}

function updateProductStockUI(prodId, newStock) {
  const tr = t();
  const inputEl = document.getElementById(`adm-stock-input-${prodId}`);
  if (inputEl instanceof HTMLInputElement) {
    inputEl.value = String(newStock);
  }
  const cardEl = document.getElementById(`adm-prod-card-${prodId}`);
  if (cardEl) {
    cardEl.classList.toggle('low-stock', newStock < 5);
  }
  const badgeCell = document.getElementById(`adm-stock-badge-${prodId}`);
  if (badgeCell) {
    badgeCell.innerHTML =
      newStock === 0
        ? `<span class="adm-badge adm-badge-cancelled">${tr.inv.outOfStock}</span>`
        : newStock < 5
        ? `<span class="adm-badge adm-badge-confirming">${tr.inv.lowStockBadge(newStock)}</span>`
        : `<span class="adm-badge adm-badge-delivered">${tr.inv.inStockBadge(newStock)}</span>`;
  }
}

export function setupAdminEvents() {
  const root = document.getElementById('admin-dashboard-root');
  if (!root) return;

  root.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('[data-adm-action]') : null;
    if (!btn) return;

    const action = btn.getAttribute('data-adm-action');
    const id = btn.getAttribute('data-id');

    switch (action) {
      case 'toggle-admin-lang': {
        if (store) {
          store.toggleLanguage();
        }
        renderAdminDashboard();
        showToast(t().toasts.langSwitched);
        break;
      }

      case 'switch-tab': {
        const tab = btn.getAttribute('data-tab') || 'inventory';
        adminState.activeTab = tab;
        root.querySelectorAll('[data-adm-action="switch-tab"]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-tab') === tab);
        });
        root.querySelectorAll('.adm-tab-section').forEach((sec) => {
          sec.classList.toggle('active', sec.id === `adm-tab-${tab}`);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }

      case 'step-stock': {
        const delta = Number(btn.getAttribute('data-delta') || 0);
        const item = adminState.inventory.find((p) => p.id === id);
        if (item) {
          item.stock = Math.max(0, Number(item.stock || 0) + delta);
          adminState.saveAll();
          syncProductToSupabase(item);
          updateProductStockUI(item.id, item.stock);
        }
        break;
      }

      case 'filter-orders': {
        adminState.orderFilterStatus = btn.getAttribute('data-status') || 'all';
        renderAdminDashboard();
        break;
      }

      case 'close-admin': {
        closeAdminDashboard();
        break;
      }

      case 'logout-admin': {
        showToast(t().toasts.loggedOut);
        closeAdminDashboard();
        break;
      }

      case 'preview-landing': {
        adminState.previewLandingId = id;
        const modal = document.getElementById('adm-landing-modal');
        if (modal) {
          modal.innerHTML = renderLandingPreviewModal();
          modal.classList.add('open');
        }
        break;
      }

      case 'close-landing-modal': {
        adminState.previewLandingId = null;
        const modal = document.getElementById('adm-landing-modal');
        if (modal) modal.classList.remove('open');
        break;
      }

      case 'swap-lp-img': {
        const src = btn.getAttribute('data-src');
        const mainImg = document.getElementById('lp-modal-main-img');
        if (mainImg && src) mainImg.setAttribute('src', src);
        break;
      }

      case 'edit-landing': {
        const lp = adminState.landingPages.find((item) => item.id === id);
        if (lp) {
          adminState.editingLandingId = id;
          adminState.draftLandingMainImage = lp.imageUrl;
          adminState.draftLandingGallery = Array.isArray(lp.gallery)
            ? [...lp.gallery]
            : [lp.imageUrl];
          renderAdminDashboard();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      }

      case 'cancel-landing-edit': {
        adminState.editingLandingId = null;
        adminState.draftLandingMainImage = IMAGES.talons;
        adminState.draftLandingGallery = [IMAGES.talons, IMAGES.hero];
        renderAdminDashboard();
        break;
      }

      case 'remove-lp-gallery-img': {
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          adminState.draftLandingGallery.splice(idx, 1);
          renderAdminDashboard();
        }
        break;
      }

      case 'delete-landing': {
        adminState.landingPages = adminState.landingPages.filter((lp) => lp.id !== id);
        adminState.saveAll();
        if (id) deleteLandingPageFromSupabase(id);
        renderAdminDashboard();
        showToast(t().toasts.lpDeleted);
        break;
      }

      case 'edit-product': {
        const prod = adminState.inventory.find((p) => p.id === id);
        if (prod) {
          adminState.editingProductId = id;
          adminState.draftProductImage = prod.image;
          adminState.draftProductGallery = Array.isArray(prod.gallery)
            ? [...prod.gallery]
            : [prod.image];
          renderAdminDashboard();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      }

      case 'cancel-product-edit': {
        adminState.editingProductId = null;
        adminState.draftProductImage = IMAGES.talons;
        adminState.draftProductGallery = [];
        renderAdminDashboard();
        break;
      }

      case 'remove-prod-gallery-img': {
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          adminState.draftProductGallery.splice(idx, 1);
          renderAdminDashboard();
        }
        break;
      }

      case 'delete-product': {
        adminState.inventory = adminState.inventory.filter((p) => p.id !== id);
        adminState.saveAll();
        if (id) deleteProductFromSupabase(id);
        renderAdminDashboard();
        showToast(t().toasts.prodDeleted);
        break;
      }

      case 'add-demo-order': {
        const newOrder = {
          id: 'SS-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().slice(0, 10),
          fullName: getLang() === 'fr' ? 'Amira Belkacem' : 'أميرة بلقاسم',
          phone: '0558 91 42 10',
          wilaya: getLang() === 'fr' ? '09 - Blida' : '09 - البليدة',
          address: getLang() === 'fr' ? 'Centre-ville, Blida' : 'شارع فلسطين، وسط المدينة',
          itemsSummary:
            getLang() === 'fr'
              ? 'Escarpins Classiques Rose (Pointure 38 × 1)'
              : 'حذاء كعب عالي كلاسيك وردي (مقاس 38 × 1)',
          total: 5490,
          status: 'new',
        };
        adminState.orders.unshift(newOrder);
        adminState.saveAll();
        syncOrderToSupabase(newOrder);
        renderAdminDashboard();
        showToast(t().toasts.newOrderAdded(newOrder.id));
        break;
      }

      case 'delete-order': {
        adminState.orders = adminState.orders.filter((o) => o.id !== id);
        adminState.saveAll();
        if (id) deleteOrderFromSupabase(id);
        renderAdminDashboard();
        showToast(t().toasts.orderDeleted);
        break;
      }

      case 'delete-wilaya': {
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          const removed = adminState.shipping.rates.splice(idx, 1)[0];
          adminState.saveAll();
          if (removed?.code) deleteShippingRateFromSupabase(removed.code);
          renderAdminDashboard();
          showToast(t().toasts.wilayaDeleted);
        }
        break;
      }
    }
  });

  // المعاينة الحية وتعديل المخزون والبحث
  root.addEventListener('input', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.closest('#adm-cms-form')) {
      const storeNameEl = document.getElementById('cms-store-name');
      const annEnabledEl = document.getElementById('cms-ann-enabled');
      const annTextEl = document.getElementById('cms-ann-text');
      const heroTitleEl = document.getElementById('cms-hero-title');
      const heroSubEl = document.getElementById('cms-hero-sub');
      const heroBtnEl = document.getElementById('cms-hero-btn');

      const pName = document.getElementById('preview-store-name');
      if (pName && storeNameEl instanceof HTMLInputElement) pName.textContent = storeNameEl.value;

      const pAnn = document.getElementById('preview-ann-bar');
      if (pAnn && annEnabledEl instanceof HTMLInputElement && annTextEl instanceof HTMLInputElement) {
        pAnn.style.display = annEnabledEl.checked ? 'block' : 'none';
        pAnn.textContent = annTextEl.value;
      }

      const pHeroTitle = document.getElementById('preview-hero-title');
      if (pHeroTitle && heroTitleEl instanceof HTMLInputElement) pHeroTitle.textContent = heroTitleEl.value;

      const pHeroSub = document.getElementById('preview-hero-sub');
      if (pHeroSub && heroSubEl instanceof HTMLTextAreaElement) pHeroSub.textContent = heroSubEl.value;

      const pHeroBtn = document.getElementById('preview-hero-btn');
      if (pHeroBtn && heroBtnEl instanceof HTMLInputElement) {
        pHeroBtn.textContent = heroBtnEl.value;
      }

      [0, 1, 2].forEach((idx) => {
        const iconInp = root.querySelector(`[data-cms-feat-icon="${idx}"]`);
        const titleInp = root.querySelector(`[data-cms-feat-title="${idx}"]`);
        const descInp = root.querySelector(`[data-cms-feat-desc="${idx}"]`);
        const pIcon = document.getElementById(`preview-feat-icon-${idx}`);
        const pTitle = document.getElementById(`preview-feat-title-${idx}`);
        const pDesc = document.getElementById(`preview-feat-desc-${idx}`);

        if (pIcon && iconInp instanceof HTMLInputElement) pIcon.textContent = iconInp.value;
        if (pTitle && titleInp instanceof HTMLInputElement) pTitle.textContent = titleInp.value;
        if (pDesc && descInp instanceof HTMLInputElement) pDesc.textContent = descInp.value;
      });
    }

    if (target instanceof HTMLInputElement && target.hasAttribute('data-adm-stock-id')) {
      const prodId = target.getAttribute('data-adm-stock-id');
      const newStock = Math.max(0, Number(target.value || 0));
      const item = adminState.inventory.find((p) => p.id === prodId);
      if (item && prodId) {
        item.stock = newStock;
        adminState.saveAll();
        syncProductToSupabase(item);
        updateProductStockUI(prodId, newStock);
      }
    }

    if (target instanceof HTMLInputElement && target.id === 'adm-inventory-search') {
      adminState.inventorySearch = target.value;
      const q = adminState.inventorySearch.trim().toLowerCase();
      const filtered = adminState.inventory.filter(
        (p) =>
          !q ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.name_fr && p.name_fr.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
      const grid = document.getElementById('adm-inventory-grid');
      if (grid) grid.innerHTML = renderInventoryCards(filtered);
    }

    if (target instanceof HTMLInputElement && target.hasAttribute('data-adm-ship-home')) {
      const idx = Number(target.getAttribute('data-adm-ship-home'));
      if (adminState.shipping.rates[idx]) {
        adminState.shipping.rates[idx].homeFee = Math.max(0, Number(target.value || 0));
        adminState.saveAll();
        syncShippingRateToSupabase(adminState.shipping.rates[idx]);
      }
    }
    if (target instanceof HTMLInputElement && target.hasAttribute('data-adm-ship-desk')) {
      const idx = Number(target.getAttribute('data-adm-ship-desk'));
      if (adminState.shipping.rates[idx]) {
        adminState.shipping.rates[idx].deskFee = Math.max(0, Number(target.value || 0));
        adminState.saveAll();
        syncShippingRateToSupabase(adminState.shipping.rates[idx]);
      }
    }
  });

  // رفع الصور من الجهاز + تغيير حالة الطلبات
  root.addEventListener('change', async (e) => {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === 'file') {
      const files = Array.from(target.files || []);
      if (files.length === 0) return;

      try {
        if (target.id === 'adm-prod-file-input') {
          const dataUrl = await readAndCompressImageFile(files[0]);
          adminState.draftProductImage = dataUrl;
          const previewEl = document.getElementById('adm-prod-img-preview');
          if (previewEl instanceof HTMLImageElement) previewEl.src = dataUrl;
          showToast(t().toasts.photoUploaded);
        } else if (target.id === 'adm-prod-gallery-input') {
          for (const f of files) {
            const dataUrl = await readAndCompressImageFile(f);
            adminState.draftProductGallery.push(dataUrl);
          }
          renderAdminDashboard();
          showToast(t().toasts.galleryAdded(files.length));
        } else if (target.hasAttribute('data-adm-row-img-upload')) {
          const prodId = target.getAttribute('data-adm-row-img-upload');
          const dataUrl = await readAndCompressImageFile(files[0]);
          const prod = adminState.inventory.find((p) => p.id === prodId);
          if (prod) {
            prod.image = dataUrl;
            if (!Array.isArray(prod.gallery) || prod.gallery.length === 0) {
              prod.gallery = [dataUrl];
            } else {
              prod.gallery[0] = dataUrl;
            }
            adminState.saveAll();
            syncProductToSupabase(prod);
            const rowThumb = document.getElementById(`adm-row-thumb-${prodId}`);
            if (rowThumb instanceof HTMLImageElement) rowThumb.src = dataUrl;
            showToast(t().toasts.prodPhotoUpdated(getProdDisplayName(prod)));
          }
        } else if (target.id === 'adm-lp-main-file') {
          const dataUrl = await readAndCompressImageFile(files[0]);
          adminState.draftLandingMainImage = dataUrl;
          const thumb = document.getElementById('lp-main-preview-thumb');
          if (thumb instanceof HTMLImageElement) thumb.src = dataUrl;
          showToast(t().toasts.photoUploaded);
        } else if (target.id === 'adm-lp-gallery-files') {
          for (const f of files) {
            const dataUrl = await readAndCompressImageFile(f);
            adminState.draftLandingGallery.push(dataUrl);
          }
          renderAdminDashboard();
          showToast(t().toasts.galleryAdded(files.length));
        } else if (target.id === 'cms-logo-file-input') {
          const dataUrl = await readAndCompressImageFile(files[0], 400);
          adminState.draftCmsLogo = dataUrl;
          const thumb = document.getElementById('cms-logo-preview-thumb');
          if (thumb instanceof HTMLImageElement) thumb.src = dataUrl;
          const liveLogo = document.getElementById('preview-logo-img');
          if (liveLogo instanceof HTMLImageElement) liveLogo.src = dataUrl;
          showToast(t().toasts.photoUploaded);
        } else if (target.id === 'cms-hero-file-input') {
          const dataUrl = await readAndCompressImageFile(files[0], 1100);
          adminState.draftCmsHeroBg = dataUrl;
          const thumb = document.getElementById('cms-hero-preview-thumb');
          if (thumb instanceof HTMLImageElement) thumb.src = dataUrl;
          const liveHero = document.getElementById('preview-hero-box');
          if (liveHero) liveHero.style.backgroundImage = `url('${dataUrl}')`;
          showToast(t().toasts.photoUploaded);
        }
      } catch {
        showToast(t().toasts.invalidImage);
      }
      return;
    }

    if (target instanceof HTMLSelectElement && target.hasAttribute('data-adm-order-status')) {
      const orderId = target.getAttribute('data-adm-order-status');
      const newStatusKey = target.value;
      const order = adminState.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = newStatusKey;
        adminState.saveAll();
        syncOrderToSupabase(order);
        const badge = document.getElementById(`adm-order-badge-${orderId}`);
        const label = getStatusLabel(newStatusKey);
        if (badge) {
          badge.className = getStatusBadgeClass(newStatusKey);
          badge.textContent = label;
        }
        showToast(t().toasts.orderStatusChanged(orderId, label));
      }
    }
  });

  // حفظ النماذج
  root.addEventListener('submit', (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    e.preventDefault();

    const fd = new FormData(form);

    if (form.id === 'adm-cms-form') {
      adminState.cms = {
        storeName: String(fd.get('storeName') || 'ShoeStyle').trim(),
        logoUrl: adminState.draftCmsLogo || adminState.cms.logoUrl || IMAGES.talons,
        announcementEnabled: fd.get('announcementEnabled') === 'on',
        announcementText: String(fd.get('announcementText') || '').trim(),
        heroTitle: String(fd.get('heroTitle') || '').trim(),
        heroSubtitle: String(fd.get('heroSubtitle') || '').trim(),
        heroBgUrl: adminState.draftCmsHeroBg || adminState.cms.heroBgUrl || IMAGES.hero,
        heroBtnText: String(fd.get('heroBtnText') || 'Découvrir').trim(),
        heroBtnLink: 'Talons',
        features: [0, 1, 2].map((idx) => ({
          icon: String(fd.get(`featIcon_${idx}`) || '✨').trim(),
          title: String(fd.get(`featTitle_${idx}`) || '').trim(),
          desc: String(fd.get(`featDesc_${idx}`) || '').trim(),
        })),
      };
      adminState.saveAll();
      syncCmsToSupabase(adminState.cms, adminState.shipping.freeShippingThreshold);
      showToast(t().toasts.cmsSaved);
      renderAdminDashboard();
    } else if (form.id === 'adm-landing-form') {
      const mainImg = adminState.draftLandingMainImage || IMAGES.talons;
      const gallery =
        adminState.draftLandingGallery && adminState.draftLandingGallery.length > 0
          ? [...adminState.draftLandingGallery]
          : [mainImg];

      const payload = {
        id: adminState.editingLandingId || 'lp-' + Date.now().toString().slice(-4),
        title: String(fd.get('title') || '').trim(),
        slug: String(fd.get('slug') || '/offer/promo').trim(),
        originalPrice: Number(fd.get('originalPrice') || 0),
        discountPrice: Number(fd.get('discountPrice') || 0),
        imageUrl: mainImg,
        gallery,
        description: String(fd.get('description') || '').trim(),
        quickFormEnabled: true,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      if (adminState.editingLandingId) {
        const idx = adminState.landingPages.findIndex((lp) => lp.id === adminState.editingLandingId);
        if (idx !== -1) adminState.landingPages[idx] = payload;
        adminState.editingLandingId = null;
        showToast(t().toasts.lpUpdated);
      } else {
        adminState.landingPages.unshift(payload);
        showToast(t().toasts.lpCreated);
      }
      adminState.saveAll();
      syncLandingPageToSupabase(payload);
      renderAdminDashboard();
    } else if (form.id === 'adm-product-form') {
      const uploadedImage = adminState.draftProductImage || IMAGES.talons;
      const uploadedGallery =
        adminState.draftProductGallery && adminState.draftProductGallery.length > 0
          ? [uploadedImage, ...adminState.draftProductGallery]
          : [uploadedImage];

      const nameAr = String(fd.get('name') || '').trim();
      const nameFr = String(fd.get('name_fr') || nameAr).trim();

      const payload = {
        id: adminState.editingProductId || 'ss-' + Date.now().toString().slice(-3),
        name: nameAr,
        name_fr: nameFr,
        category: String(fd.get('category') || 'Talons'),
        price: Number(fd.get('price') || 0),
        stock: Number(fd.get('stock') || 0),
        image: uploadedImage,
        gallery: uploadedGallery,
      };

      if (adminState.editingProductId) {
        const idx = adminState.inventory.findIndex((p) => p.id === adminState.editingProductId);
        if (idx !== -1) adminState.inventory[idx] = payload;
        adminState.editingProductId = null;
        showToast(t().toasts.prodUpdated);
      } else {
        adminState.inventory.unshift(payload);
        showToast(t().toasts.prodCreated);
      }
      adminState.draftProductGallery = [];
      adminState.saveAll();
      syncProductToSupabase(payload);
      renderAdminDashboard();
    } else if (form.id === 'adm-shipping-threshold-form') {
      const input = document.getElementById('adm-free-shipping-input');
      if (input instanceof HTMLInputElement) {
        adminState.shipping.freeShippingThreshold = Math.max(0, Number(input.value || 0));
        adminState.saveAll();
        syncCmsToSupabase(adminState.cms, adminState.shipping.freeShippingThreshold);
        renderAdminDashboard();
        showToast(t().toasts.thresholdSaved);
      }
    } else if (form.id === 'adm-add-wilaya-form') {
      const code = String(fd.get('code') || '').trim();
      const name = String(fd.get('name') || '').trim();
      const homeFee = Number(fd.get('homeFee') || 500);
      const deskFee = Number(fd.get('deskFee') || 350);
      if (code && name) {
        const newRate = { code, name, name_fr: name, homeFee, deskFee };
        adminState.shipping.rates.push(newRate);
        adminState.saveAll();
        syncShippingRateToSupabase(newRate);
        renderAdminDashboard();
        showToast(t().toasts.wilayaAdded(name));
      }
    } else if (form.id === 'adm-lp-quick-order-form') {
      const lpId = form.getAttribute('data-lp-id');
      const lp = adminState.landingPages.find((item) => item.id === lpId);
      if (!lp) return;

      const newOrder = {
        id: 'LP-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().slice(0, 10),
        fullName: String(fd.get('fullName') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        wilaya: String(fd.get('wilaya') || '16 - Alger'),
        address: String(fd.get('address') || '').trim(),
        itemsSummary: `[Promo] ${lp.title} (${t().orders.sizeWord} ${fd.get('size') || 37})`,
        total: lp.discountPrice,
        status: 'new',
      };
      adminState.orders.unshift(newOrder);
      adminState.previewLandingId = null;
      adminState.activeTab = 'orders';
      adminState.saveAll();
      syncOrderToSupabase(newOrder);
      renderAdminDashboard();
      showToast(t().toasts.newOrderAdded(newOrder.id));
    }
  });
}

export function openAdminDashboard() {
  window.location.href = '/admin.html';
}

export function closeAdminDashboard() {
  window.location.href = '/index.html';
}
