'use strict';
angular.module('rc.prime.item.pricegroup', ['rc.prime.entity', 'common']);

angular.module('rc.prime.item.pricegroup').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var itempricegroup = {
        name: 'common.prime.itemtypepricegroup',
        url: '/configure/item/type/:item_type_id/pricegroups',
        templateUrl: 'application/modules/item/pricegroup/item.pricegroup.html',
        data: {
            displayName: 'Item Price Classification'
        },
        params: {
            item_type_id: null,
            item_type_description: null
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/item/pricegroup/item.pricegroup.controller.js']);
            }]
        }
    };
    $stateProvider.state(itempricegroup);

    // Create new item type UI
    var update_pricegroup = {
        name: 'common.prime.itemtypepricegroup.update',
        url: '/:price_class_value/update',
        templateUrl: 'application/modules/item/pricegroup/item.pricegroup.update.html',
    };
    $stateProvider.state(update_pricegroup);

});