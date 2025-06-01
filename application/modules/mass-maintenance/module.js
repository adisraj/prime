'use strict';
angular.module('rc.prime.massmaintenance', []);

angular.module('rc.prime.massmaintenance').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    //View all attributes
    var mass_retail_maintenance_view = {
        name: 'common.prime.massmaintenance',
        url: '/retailsetting/mass-maintenance',
        templateUrl: 'application/modules/mass-maintenance/mass-retail-maintenance.html',
        resolve: {
            loadMyFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['application/modules/mass-maintenance/controller.js']);
            }]
        }
    };
    $stateProvider.state(mass_retail_maintenance_view);
});