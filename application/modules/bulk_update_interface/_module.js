'use strict';
angular.module('rc.prime.bulkupdateinterface', []);

angular.module('rc.prime.bulkupdateinterface').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var bulkupdateinterface = {
        name: 'common.prime.bulkupdateinterface',
        url: '/configure/bulkupdateinterface',
        templateUrl: 'application/modules/bulk_update_interface/bulk-update-interface.html',
        data: {
            displayName: 'Bulk Update Interface'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/bulk_update_interface/bulk-update-interface.controller.js']);
            }]
        }
    };
    $stateProvider.state(bulkupdateinterface);
});