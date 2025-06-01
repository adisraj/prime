'use strict';
angular.module('rc.prime.financingpriceadjustments', []);

angular.module('rc.prime.financingpriceadjustments').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var financing_price_adjustments_instance = {
        name: 'common.prime.financingpriceadjustments',
        url: '/reference/financingpriceadjustments',
        templateUrl: 'application/modules/financingpriceadjustments/financingpriceadjustments.html',
        data: {
            displayName: 'Financing Price Adjustments'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/financingpriceadjustments/financingpriceadjustments.controller.js']);
            }]
        }
    };
    $stateProvider.state(financing_price_adjustments_instance);
});