'use strict';
angular.module('rc.prime.item', ['rc.prime.item.function', 'calculus.application']);

angular.module('rc.prime.item').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var item_maintenance = {
        name: 'common.prime.itemMaintenance',
        url: '/maintenance/items/',
        params: {
            create: null
        },
        templateUrl: 'application/modules/item/maintenance/item.maintenance.html',
        data: {
            displayName: 'Item Maintenance'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/item/maintenance/item.maintenance.controller.js']);
            }]
        }
    };
    $stateProvider.state(item_maintenance);

    var sku_header = {
        name: 'common.prime.skuHeader',
        url: '/skuheader',
        templateUrl: 'application/modules/item/sku.option.header/sku.option.header.html',
        data: {
            displayName: 'SKU HEADER'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/item/sku.option.header/sku.option.header.controller.js']);
            }]
        }
    };
    $stateProvider.state(sku_header);

    var retail_price_type = {
        name: 'common.prime.retailpricetype',
        url: '/retailsetting/retail_price_type',
        templateUrl: 'application/modules/item/retail.price.type/retail.price.type.html',
        data: {
            displayName: 'Rounding Rules'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/item/retail.price.type/retail.price.type.controller.js']);
            }]
        }
    };
    $stateProvider.state(retail_price_type);


    let retailPage = {
        name: 'common.prime.itemMaintenance.retail',
        url: ':item_id/maintenance/retail',
        params: {
            item_id: null,
            item: null
        },
        templateUrl: 'application/modules/item/retail/retail.sku.selection.html',
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/item/retail/rc.retail.controller.js']);
            }]
        }
    }
    $stateProvider.state(retailPage);
});