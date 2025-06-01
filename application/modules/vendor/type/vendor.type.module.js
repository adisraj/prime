'use strict';
angular.module('rc.prime.vendor.type', ['rc.prime.entity', 'common']);

angular.module('rc.prime.vendor.type').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var vendortype = {
        name: 'common.prime.vendortype',
        url: '/configure/vendor/type',
        templateUrl: 'application/modules/vendor/type/vendor.type.html',
        data: {
            displayName: 'Vendor Type'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    './application/modules/vendor/type/vendor.type.controller.js',
                    './application/modules/vendor/parameter/vendor.parameter.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(vendortype);

    //Create new vendor type UI
    var new_vendortype = {
        name: 'common.prime.vendortype.new',
        url: '/new',
        templateUrl: 'application/modules/vendor/type/vendor.type.new.html',
    };
    $stateProvider.state(new_vendortype);

    //Update vendor type by id UI
    var update_vendortype = {
        name: 'common.prime.vendortype.update',
        url: '/:vendor_type_id/update',
        templateUrl: 'application/modules/vendor/type/vendor.type.update.html',
    };
    $stateProvider.state(update_vendortype);
});