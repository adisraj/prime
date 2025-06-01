'use strict';
angular.module('rc.prime.sku.retail', ['calculus.application']);
angular.module('rc.prime.sku.retail').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    let SKURetails = {
        name: 'common.prime.itemMaintenance.sku.retail',
        url: '/:id/retail/?:date/?:returnUrl',
        params: {
            id: null
        },
        views: {
            abstract: true,
            '': { templateUrl: 'application/modules/item/sku/retails/sku.mto.retails.html' }
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['application/modules/item/sku/retails/controller.js']);
            }]
        }
    }
    $stateProvider.state(SKURetails);
});