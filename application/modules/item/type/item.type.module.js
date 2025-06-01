'use strict';
angular.module('rc.prime.item.type', ['rc.prime.entity', 'common']);

angular.module('rc.prime.item.type').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var itemtype = {
        name: 'common.prime.itemtype',
        url: '/configure/item/type',
        templateUrl: 'application/modules/item/type/item.type.html',
        data: {
            displayName: 'Item Type'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    './application/modules/item/type/item.type.controller.js',
                    './application/modules/item/parameter/item.parameter.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(itemtype);

    // Create new item type UI
    var new_item_type = {
        name: 'common.prime.itemtype.new',
        url: '/new',
        templateUrl: 'application/modules/item/type/item.type.new.html',
    };
    $stateProvider.state(new_item_type);

    // update item type UI
    var update_item_type = {
        name: 'common.prime.itemtype.update',
        url: '/:item_type_id/update',
        templateUrl: 'application/modules/item/type/item.type.update.html',
    };
    $stateProvider.state(update_item_type);

});