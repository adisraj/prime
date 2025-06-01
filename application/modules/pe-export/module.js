'use strict';
angular.module('rc.prime.peexport', []);

angular.module('rc.prime.peexport').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    //View all attributes
    var pe_export_view = {
        name: 'common.prime.peexport',
        url: '/reference/pe-export',
        templateUrl: 'application/modules/pe-export/peexcel-import.html',
        resolve: {
            loadMyFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['application/modules/pe-export/controller.js']);
            }]
        }
    };
    $stateProvider.state(pe_export_view);
});