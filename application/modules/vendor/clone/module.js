'use strict';
angular.module('rc.prime.vendor.clone', ['calculus.application']);
angular.module('rc.prime.vendor.clone').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    let VendorClone = {
        name: 'common.prime.vendor.clone',
        url: '/:id/clone',
        views: {
            'clone': {
                templateUrl: 'application/modules/vendor/clone/panel.clone.vendor.html'
            }
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/vendor/clone/controller.js']);
            }]
        },
    }
    $stateProvider.state(VendorClone);
});