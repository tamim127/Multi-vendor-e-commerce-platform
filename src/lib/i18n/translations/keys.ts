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

  // Cart Domain & UI
  'cart.title': string;
  'cart.emptyTitle': string;
  'cart.emptyDesc': string;
  'cart.continueShopping': string;
  'cart.proceedToCheckout': string;
  'cart.subtotal': string;
  'cart.shippingEstimate': string;
  'cart.freeShipping': string;
  'cart.grandTotal': string;
  'cart.itemsCount': string;
  'cart.itemSingular': string;
  'cart.seller': string;
  'cart.sellerSubtotal': string;
  'cart.sellerShipping': string;
  'cart.quantity': string;
  'cart.remove': string;
  'cart.clearCart': string;
  'cart.cartDrawer': string;
  'cart.closeDrawer': string;
  'cart.viewCart': string;
  'cart.currencyMismatch': string;
  'cart.currencyMismatchDesc': string;
  'cart.itemAdded': string;
  'cart.unitPrice': string;
  'cart.maxStockReached': string;
  'cart.orderSummary': string;

  // Checkout Domain & UI
  'checkout.title': string;
  'checkout.stepContact': string;
  'checkout.stepShipping': string;
  'checkout.stepDelivery': string;
  'checkout.stepReview': string;
  'checkout.fullName': string;
  'checkout.email': string;
  'checkout.phone': string;
  'checkout.address': string;
  'checkout.city': string;
  'checkout.postalCode': string;
  'checkout.country': string;
  'checkout.state': string;
  'checkout.standardDelivery': string;
  'checkout.expressDelivery': string;
  'checkout.orderSummary': string;
  'checkout.placeOrder': string;
  'checkout.submitting': string;
  'checkout.orderSuccessTitle': string;
  'checkout.orderSuccessDesc': string;
  'checkout.orderId': string;
  'checkout.orderDate': string;
  'checkout.demoNotice': string;
  'checkout.backToHome': string;
  'checkout.cartEmpty': string;
  'checkout.splitOrderNotice': string;
  'checkout.vendorPackages': string;
  'checkout.validationError': string;

  // Phase 4: Authentication
  'auth.signIn': string;
  'auth.signUp': string;
  'auth.logout': string;
  'auth.email': string;
  'auth.password': string;
  'auth.confirmPassword': string;
  'auth.firstName': string;
  'auth.lastName': string;
  'auth.phone': string;
  'auth.rememberMe': string;
  'auth.dontHaveAccount': string;
  'auth.alreadyHaveAccount': string;
  'auth.agreeTerms': string;
  'auth.demoAccount': string;
  'auth.fillDemoCredentials': string;
  'auth.loginTitle': string;
  'auth.registerTitle': string;
  'auth.loginSubtitle': string;
  'auth.registerSubtitle': string;

  // Phase 4: Customer Account & Dashboard
  'account.title': string;
  'account.welcome': string;
  'account.dashboard': string;
  'account.profile': string;
  'account.orders': string;
  'account.addresses': string;
  'account.wishlist': string;
  'account.settings': string;
  'account.recentlyViewed': string;
  'account.clearHistory': string;
  'account.verified': string;
  'account.unverified': string;
  'account.memberSince': string;
  'account.totalOrders': string;
  'account.savedAddresses': string;
  'account.wishlistItems': string;
  'account.quickActions': string;
  'account.viewAllOrders': string;
  'account.editProfile': string;
  'account.profileUpdated': string;
  'account.saveChanges': string;
  'account.saving': string;

  // Phase 4: Order History
  'orders.title': string;
  'orders.noOrders': string;
  'orders.noOrdersDesc': string;
  'orders.viewDetails': string;
  'orders.backToOrders': string;
  'orders.orderNumber': string;
  'orders.placedOn': string;
  'orders.status': string;
  'orders.statusPending': string;
  'orders.statusProcessing': string;
  'orders.statusShipped': string;
  'orders.statusDelivered': string;
  'orders.statusCancelled': string;
  'orders.trackingNumber': string;
  'orders.carrier': string;
  'orders.estimatedDelivery': string;
  'orders.trackingHistory': string;
  'orders.packageFrom': string;
  'orders.demoOrderNotice': string;

  // Phase 4: Addresses
  'addresses.title': string;
  'addresses.addNew': string;
  'addresses.edit': string;
  'addresses.delete': string;
  'addresses.defaultShipping': string;
  'addresses.defaultBilling': string;
  'addresses.setDefaultShipping': string;
  'addresses.setDefaultBilling': string;
  'addresses.noAddresses': string;
  'addresses.noAddressesDesc': string;
  'addresses.labelHome': string;
  'addresses.labelWork': string;
  'addresses.labelOther': string;
  'addresses.addressSaved': string;
  'addresses.confirmDelete': string;

  // Phase 4: Wishlist
  'wishlist.title': string;
  'wishlist.empty': string;
  'wishlist.emptyDesc': string;
  'wishlist.exploreProducts': string;
  'wishlist.itemRemoved': string;
  'wishlist.itemAdded': string;

  // Phase 4: Settings
  'settings.title': string;
  'settings.preferences': string;
  'settings.language': string;
  'settings.currency': string;
  'settings.notifications': string;
  'settings.emailUpdates': string;
  'settings.smsUpdates': string;
  'settings.newsletter': string;
  'settings.security': string;
  'settings.changePassword': string;
  'settings.twoFactor': string;
  'settings.dangerZone': string;
  'settings.deactivateAccount': string;
  'settings.saved': string;

  // Phase 5: Seller Platform & Multi-Vendor
  'seller.title': string;
  'seller.dashboard': string;
  'seller.products': string;
  'seller.inventory': string;
  'seller.orders': string;
  'seller.analytics': string;
  'seller.storeSettings': string;
  'seller.storefrontPreview': string;
  'seller.onboardingTitle': string;
  'seller.onboardingSubtitle': string;
  'seller.applyNow': string;
  'seller.applicationStatus': string;
  'seller.pendingApproval': string;
  'seller.approved': string;
  'seller.rejected': string;
  'seller.demoAutoApprove': string;
  'seller.totalRevenue': string;
  'seller.activeListings': string;
  'seller.pendingOrders': string;
  'seller.lowStockAlerts': string;
  'seller.salesTrends': string;
  'seller.topProducts': string;
  'seller.addOffer': string;
  'seller.editOffer': string;
  'seller.updateStock': string;
  'seller.dispatchOrder': string;
  'seller.carrier': string;
  'seller.trackingNumber': string;
  'seller.fulfillmentStatus': string;
  'seller.packageSubtotal': string;
  'seller.ratingsAndReviews': string;
  'seller.notifications': string;
}

export type TranslationKey = keyof TranslationsContract;
