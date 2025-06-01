'use strict';
angular.module('rc.prime.upcconfigurations', []);

angular.module('rc.prime.upcconfigurations').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var upc_duplicate_confguration = {
        name: 'common.prime.upcconfiguration',
        url: '/reference/upcconfiguration',
        templateUrl: 'application/modules/upcconfiguration/upc-configuration.html',
        data: {
            displayName: 'UPC Duplicate Configuration'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/upcconfiguration/upc-configuration.controller.js']);
            }]
        }
    };
    $stateProvider.state(upc_duplicate_confguration);
});