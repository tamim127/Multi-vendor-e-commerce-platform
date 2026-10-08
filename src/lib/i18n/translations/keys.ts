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

  // PLP & Product Discovery
  'plp.products': string;
  'plp.title': string;
  'plp.subtitle': string;
  'plp.resultsCount': string;
  'plp.showingResults': string;
  'plp.sortBy': string;
  'plp.sortNewest': string;
  'plp.sortPriceAsc': string;
  'plp.sortPriceDesc': string;
  'plp.sortRatingDesc': string;
  'plp.sortRelevance': string;
  'plp.filters': string;
  'plp.clearAll': string;
  'plp.applyFilters': string;
  'plp.category': string;
  'plp.brand': string;
  'plp.price': string;
  'plp.rating': string;
  'plp.availability': string;
  'plp.inStockOnly': string;
  'plp.minPrice': string;
  'plp.maxPrice': string;
  'plp.starsAndAbove': string;
  'plp.fromPrice': string;
  'plp.inStock': string;
  'plp.outOfStock': string;
  'plp.backorder': string;
  'plp.noResultsTitle': string;
  'plp.noResultsDesc': string;
  'plp.resetFilters': string;
  'plp.errorTitle': string;
  'plp.errorDesc': string;
  'plp.retry': string;
  'plp.pagePrevious': string;
  'plp.pageNext': string;

  // Product Card System
  'productCard.fromPrice': string;
  'productCard.offersCount': string;
  'productCard.addToWishlist': string;
  'productCard.removeFromWishlist': string;
  'productCard.quickView': string;
  'productCard.inStock': string;
  'productCard.outOfStock': string;
  'productCard.sponsored': string;
  'productCard.flashSale': string;
  'productCard.claimed': string;
  'productCard.viewDetails': string;
  'productCard.unavailable': string;
}

export type TranslationKey = keyof TranslationsContract;
