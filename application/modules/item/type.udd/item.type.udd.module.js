'use strict';
angular.module('rc.prime.item.type.udd', ['rc.prime.entity', 'common']);

angular.module('rc.prime.item.type.udd').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var itemtypeudd = {
        name: 'common.prime.itemtypeudd',
        url: '/configure/item/type/:item_type_id/udd',
        templateUrl: 'application/modules/item/type.udd/item.type.udd.html',
        data: {
            displayName: 'Item Type'
        },
        params: {
            item_type_id: null
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/item/type.udd/item.type.udd.controller.js']);
            }]
        }
    };
    $stateProvider.state(itemtypeudd);

    // Create new item type udd UI
    var new_itemtypeudd = {
        name: 'common.prime.itemtypeudd.new',
        url: '/new',
        reload: true,
        inherit: false,
        notify: true,
        templateUrl: 'application/modules/item/type.udd/item.type.udd.new.html',
    };
    $stateProvider.state(new_itemtypeudd);

    // update item type udd UI
    var update_itemtypeudd = {
        name: 'common.prime.itemtypeudd.update',
        url: '/:item_type_udd_id/update',
        reload: true,
        inherit: false,
        notify: true,
        templateUrl: 'application/modules/item/type.udd/item.type.udd.update.html',
    };
    $stateProvider.state(update_itemtypeudd);
});