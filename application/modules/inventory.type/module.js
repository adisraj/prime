'use strict';
angular.module('rc.prime.inventorytypes', []);

angular.module('rc.prime.inventorytypes').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var inventory_type = {
        name: 'common.prime.inventorytypes',
        url: '/reference/inventorytypes',
        templateUrl: 'application/modules/inventory.type/inventory.type.html',
        data: {
            displayName: 'Inventory Type'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/inventory.type/controller.js']);
            }]
        }
    };
    $stateProvider.state(inventory_type);
});