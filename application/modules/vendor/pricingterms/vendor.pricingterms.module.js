'use strict';
angular.module('rc.prime.vendor.pricingterms', ['calculus.application']);

angular.module('rc.prime.vendor.pricingterms').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var vendor_purchase = {
        name: 'common.prime.financepricefactor',
        url: '/reference/pricingfactor',
        templateUrl: 'application/modules/vendor/pricingterms/vendor.pricingterms.html',
        data: {
            displayName: 'Financing Princing Factor'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/vendor/pricingterms/vendor.pricingterms.controller.js']);
            }]
        }
    };
    $stateProvider.state(vendor_purchase);

});