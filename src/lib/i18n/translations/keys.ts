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
  'plp.sortBestselling': string;
  'plp.sortDiscountDesc': string;
  'plp.searchResultsFor': string;
  'plp.searchQueryLabel': string;
  'plp.noSearchResultsDesc': string;
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

  // PDP (Product Detail Page)
  'pdp.backToCatalog': string;
  'pdp.selectOptions': string;
  'pdp.partialSelection': string;
  'pdp.nonexistentCombination': string;
  'pdp.inactiveVariant': string;
  'pdp.variantNoOffers': string;
  'pdp.inStock': string;
  'pdp.outOfStock': string;
  'pdp.lowStock': string;
  'pdp.leadTime': string;
  'pdp.soldBy': string;
  'pdp.shipsFrom': string;
  'pdp.allOffers': string;
  'pdp.offersCount': string;
  'pdp.condition': string;
  'pdp.delivery': string;
  'pdp.freeDelivery': string;
  'pdp.fastDelivery': string;
  'pdp.warranty': string;
  'pdp.returnPolicy': string;
  'pdp.sellerRating': string;
  'pdp.buyBoxWinner': string;
  'pdp.selectOffer': string;
  'pdp.selectedOfferLabel': string;
  'pdp.sellerDisclaimer': string;
  'pdp.verifiedDemo': string;
  'pdp.officialStoreDemo': string;
  'pdp.authorizedDealerDemo': string;
  'pdp.topRatedDemo': string;
  'pdp.fastShipperDemo': string;
  'pdp.quantity': string;
  'pdp.quantityDemoBound': string;
  'pdp.addToCart': string;
  'pdp.buyNow': string;
  'pdp.intentModalTitle': string;
  'pdp.intentModalDesc': string;
  'pdp.intentModalClose': string;
  'pdp.tabOverview': string;
  'pdp.tabSpecs': string;
  'pdp.tabReviews': string;
  'pdp.tabQa': string;
  'pdp.sku': string;
  'pdp.brand': string;
  'pdp.category': string;
  'pdp.relatedProducts': string;
  'pdp.ratingAverage': string;
  'pdp.ratingCount': string;
  'pdp.noReviews': string;
  'pdp.noQa': string;
  'pdp.demoFeedbackNote': string;
  'pdp.askQuestion': string;
  'pdp.writeReview': string;
  'pdp.notFoundTitle': string;
  'pdp.notFoundDesc': string;
  'pdp.backToHome': string;
  'pdp.fulfilledBy': string;
  'pdp.backorder': string;
  'pdp.backorderRestock': string;
  'pdp.backorderProhibited': string;
  'pdp.backorderDemoLimit': string;
  'pdp.shippingCost': string;
  'pdp.shippingCalculatedAtCheckout': string;
  'pdp.priceUnavailable': string;
}

export type TranslationKey = keyof TranslationsContract;
