'use strict';
angular.module('rc.prime.item.clone', ['calculus.application']);
angular.module('rc.prime.item.clone').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    let SKUClone = {
        name: 'common.prime.itemMaintenance.sku.clone',
        url: '/:id/clone',
        params: {
            id: null
        },
        views: {
            'clone': {
                templateUrl: 'application/modules/item/sku/clone/panel.clone.sku.html'
            }
        },

        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/item/sku/clone/controller.js']);
            }]
        },
    }
    $stateProvider.state(SKUClone);

    

    let ItemClone = {
        name: 'common.prime.itemMaintenance.clone',
        url: ':id/clone',
        params: {
            id: null
        },
        views: {
            'clone': {
                templateUrl: 'application/modules/item/sku/clone/panel.clone.item.html'
            }
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/item/sku/clone/controller.js']);
            }]
        }
    }
    $stateProvider.state(ItemClone);

});