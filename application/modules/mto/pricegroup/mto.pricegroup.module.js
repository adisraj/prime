'use strict';
angular.module('rc.prime.mto.pricegroup', ['rc.prime.entity', 'rc.prime.codes', 'rc.prime.vendor', 'calculus.application']);

angular.module('rc.prime.mto.pricegroup').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var made_to_order_price_groups = {
        name: 'common.prime.mtopricegroups',
        url: '/reference/mto/pricegroups',
        templateUrl: 'application/modules/mto/pricegroup/mto.pricegroup.html',
        data: {
            displayName: 'MTO Price Groups',
            requireLogin: true
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/mto/pricegroup/mto.pricegroup.controller.js']);
            }]
        }
    };
    $stateProvider.state(made_to_order_price_groups);

});