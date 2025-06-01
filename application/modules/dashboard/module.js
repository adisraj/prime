(function() {
    'use strict';
    angular.module('rc.prime.dashboard', ['calculus.application']);

    angular.module('rc.prime.dashboard')
        .config(function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/login");

            var dashboard = {
                name: 'common.dashboard',
                url: '/dashboard',
                views: {
                    '': {
                        templateUrl: 'application/modules/dashboard/dashboard-main.html',
                    }
                },
                data: {
                    displayName: false,
                    requireLogin: true
                },
                resolve: {
                    loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                        return $ocLazyLoad.load(['./application/modules/dashboard/controller.js']);
                    }]
                }
            };
            $stateProvider.state(dashboard);
        });
})();