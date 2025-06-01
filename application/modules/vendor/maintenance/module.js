'use strict';
angular.module('rc.prime.vendor', ['calculus.application', 'rc.prime.vendor.clone']);

angular.module('rc.prime.vendor').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var vendor_maintenance = {
        name: 'common.prime.vendor',
        url: '/maintenance/vendor',
        params: {
            create: null
        },
        templateUrl: 'application/modules/vendor/maintenance/vendors.html',
        data: {
            displayName: 'Vendor Maintenance'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    'application/modules/vendor/maintenance/controller.js',
                    './application/templates/address.contacts.controller.js',
                    './application/templates/address.controller.js',
                    './application/templates/contacts.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(vendor_maintenance);


    var vendor_filter = {
        name: 'common.prime.vendor.filter',
        url: '/filter',
        views: {
            'filter': {
                templateUrl: 'application/modules/vendor/maintenance/panel.vendor.maintenance.filter.html'
            }
        },
    };
    $stateProvider.state(vendor_filter);

    let new_vendor = {
        name: 'common.prime.vendor.new',
        url: '/new',
        views: {
            '': {
                templateUrl: 'application/modules/vendor/maintenance/new.vendor.html'
            }
        }
    };
    $stateProvider.state(new_vendor);

    let update_vendor = {
        name: 'common.prime.vendor.update',
        url: '/:id/update',
        views: {
            '': {
                templateUrl: 'application/modules/vendor/maintenance/update.vendor.html'
            }
        }
    };
    $stateProvider.state(update_vendor);

    let update_vendor_rms= {
        name: 'common.prime.vendor.update.rmsnumber',
        url: '/rmsnumber',
        views: {
            'rmsnumber': {
                templateUrl: 'application/modules/vendor/maintenance/panel.edit.vendor.html'
            }
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/vendor/maintenance/controller.js']);
            }]
        },
    };
    $stateProvider.state(update_vendor_rms);
});