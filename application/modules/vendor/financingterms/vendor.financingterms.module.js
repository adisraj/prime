'use strict';
angular.module('rc.prime.vendor.financingterms', ['calculus.application']);

angular.module('rc.prime.vendor.financingterms').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var vendor_purchase = {
        name: 'common.prime.financeterms',
        url: '/reference/financeterms',
        templateUrl: 'application/modules/vendor/financingterms/vendor.financingterms.html',
        data: {
            displayName: 'Financing Terms'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/vendor/financingterms/vendor.financingterms.controller.js']);
            }]
        }
    };
    $stateProvider.state(vendor_purchase);

});