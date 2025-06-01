'use strict';
angular.module('rc.prime.inventoryquality', []);

angular.module('rc.prime.inventoryquality').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var inventory_quality = {
        name: 'common.prime.inventoryquality',
        url: '/reference/inventoryqualities',
        templateUrl: 'application/modules/inventory.quality/inventory.quality.html',
        data: {
            displayName: 'Inventory Method'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/inventory.quality/controller.js']);
            }]
        }
    };
    $stateProvider.state(inventory_quality);
});