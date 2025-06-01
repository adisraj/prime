'use strict';
angular.module('rc.prime.mto.family', ['rc.prime.entity', 'rc.prime.codes', 'rc.prime.vendor', 'calculus.application']);

angular.module('rc.prime.mto.family').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var made_to_order_familiy = {
        name: 'common.prime.mtofamilies',
        url: '/reference/mto/families',
        templateUrl: 'application/modules/mto/family/mto.family.html',
        data: {
            displayName: 'MTO Families',
            requireLogin: true
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/mto/family/mto.family.controller.js']);
            }]
        }
    };
    $stateProvider.state(made_to_order_familiy);

});