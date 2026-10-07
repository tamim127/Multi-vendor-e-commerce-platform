/**
 * Foundational shell translation keys contract.
 */
export interface TranslationsContract {
  // Common Navigation & Actions
  'common.home': string;
  'common.categories': string;
  'common.search': string;
  'common.wishlist': string;
  'common.cart': string;
  'common.account': string;
  'common.seller': string;
  'common.help': string;
  'common.menu': string;
  'common.close': string;
  'common.language': string;
  'common.theme': string;
  'common.light': string;
  'common.dark': string;
  'common.system': string;

  // Header & Search
  'header.searchPlaceholder': string;
  'header.allCategories': string;
  'header.signIn': string;
  'header.accountAndLists': string;
  'header.sellerCentral': string;
  'header.trackOrder': string;
  'header.deals': string;
  'header.trending': string;
  'header.newArrivals': string;
  'header.brands': string;
  'header.stores': string;

  // Announcement
  'announcement.defaultMessage': string;
  'announcement.offerBadge': string;
  'announcement.actionText': string;

  // Footer & Trust
  'footer.logistics': string;
  'footer.logisticsDesc': string;
  'footer.escrow': string;
  'footer.escrowDesc': string;
  'footer.returns': string;
  'footer.returnsDesc': string;
  'footer.support': string;
  'footer.supportDesc': string;
  'footer.newsletterTitle': string;
  'footer.newsletterPlaceholder': string;
  'footer.newsletterJoin': string;
  'footer.copyright': string;
}

export type TranslationKey = keyof TranslationsContract;
