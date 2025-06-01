'use strict';
angular.module('rc.prime.vendor.term', ['calculus.application']);

angular.module('rc.prime.vendor.term').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var vendor_purchase = {
        name: 'common.prime.vendorpurchase',
        url: '/reference/vendorpurchase',
        templateUrl: 'application/modules/vendor/term/vendor.terms.html',
        data: {
            displayName: 'Vendor Purchase Terms'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/vendor/term/vendor.terms.controller.js']);
            }]
        }
    };
    $stateProvider.state(vendor_purchase);

});