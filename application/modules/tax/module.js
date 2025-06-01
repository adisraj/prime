'use strict';
angular.module('rc.prime.tax', []);

angular.module('rc.prime.tax').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    var tax = {
        name: 'common.prime.tax',
        url: '/tax/regions',
        templateUrl: 'application/modules/tax/tax.regions.html',
        data: {
            displayName: 'Tax'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/tax/controller.js']);
            }]
        }
    };
    $stateProvider.state(tax);

});