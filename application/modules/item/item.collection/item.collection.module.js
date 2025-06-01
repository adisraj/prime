(function () {
    'use strict';

    angular.module('rc.prime.item.collection', ['common']);
    // Angular modules
    angular.module('rc.prime.item.collection').config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/login");

        var item_collection = {
            name: 'common.prime.itemcollections',
            url: '/reference/itemcollections',
            templateUrl: 'application/modules/item/item.collection/item.collection.html',
            data: {
                displayName: 'Item Collections'
            },
            resolve: {
                loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                    return $ocLazyLoad.load(['./application/modules/item/item.collection/item.collection.controller.js']);
                }]
            }
        };
        $stateProvider.state(item_collection);

        //Add new item collection
        var new_item_collection = {
            name: 'common.prime.itemcollections.new',
            url: '/new',
            templateUrl: 'application/modules/item/item.collection/item.collection.new.html'

        };
        $stateProvider.state(new_item_collection);

        //Update item collection
        var update_item_collection = {
            name: 'common.prime.itemcollections.update',
            url: '/:item_collection_id/update',
            templateUrl: 'application/modules/item/item.collection/item.collection.update.html'

        };
        $stateProvider.state(update_item_collection);

        //delete item Collection
        var delete_item_collection = {
            name: 'common.prime.itemcollections.delete',
            url: '/:item_collection_id/delete',
            templateUrl: 'application/modules/item/item.collection/item.collection.delete.html'
        };
        $stateProvider.state(delete_item_collection);

        // link vendor for item collection
        var link_item_collection = {
            name: 'common.prime.itemcollections.linkitemcollection',
            url: '/:id/link',
            templateUrl: 'application/modules/item/item.collection/panel.item.collection.link.html'
        };
        $stateProvider.state(link_item_collection);

    })

    // Custom modules

    // 3rd Party Modules

})();