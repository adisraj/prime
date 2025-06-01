'use strict';
angular.module('rc.prime.retailreport', []);

angular.module('rc.prime.retailreport').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    //View all attributes
    var retail_report_view = {
        name: 'common.prime.retailreport',
        url: '/retailsetting/retail-report',
        templateUrl: 'application/modules/retail-report/retail-report.html',
        resolve: {
            loadMyFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['application/modules/retail-report/controller.js']);
            }]
        }
    };
    $stateProvider.state(retail_report_view);
});