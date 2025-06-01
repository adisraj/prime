'use strict';
angular.module('rc.prime.sku.settings', ['calculus.application']);

angular.module('rc.prime.sku.settings').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");


    let skuSetting = {
        name: 'common.prime.skuformat',
        url: '/skuformat',
        templateUrl: 'application/modules/sku.setting/sku.setting.html',
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/sku.setting/controller.js']);
            }]
        }
    }
    $stateProvider.state(skuSetting);

    let skuSettingsEdit = {
        name: 'common.prime.skuformat.edit',
        url: '/edit',
        templateUrl: 'application/modules/sku.setting/sku.setting.edit.html'
    }
    $stateProvider.state(skuSettingsEdit);
});