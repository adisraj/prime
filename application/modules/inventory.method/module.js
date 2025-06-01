'use strict';
angular.module('rc.prime.inventorymethods', []);

angular.module('rc.prime.inventorymethods').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var inventory_method = {
        name: 'common.prime.inventorymethods',
        url: '/reference/inventorymethods',
        templateUrl: 'application/modules/inventory.method/inventory.methods.html',
        data: {
            displayName: 'Inventory Method'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/inventory.method/controller.js']);
            }]
        }
    };
    $stateProvider.state(inventory_method);
});