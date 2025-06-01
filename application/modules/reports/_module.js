'use strict';
angular.module('rc.prime.report', []);

angular.module('rc.prime.report').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var report = {
        name: 'common.prime.report',
        url: '/report',
        templateUrl: 'application/modules/reports/reports.html',
        data: {
            displayName: 'Reports'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/reports/_controller.js']);
            }]
        }
    };
    $stateProvider.state(report);

});