'use strict';
angular.module('rc.prime.location.clone', ['calculus.application']);
angular.module('rc.prime.location.clone').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    let LocationClone = {
        name: 'common.prime.location.clone',
        url: '/:id/clone',
        views: {
            'clone': {
                templateUrl: 'application/modules/location/clone/panel.clone.location.html'
            }
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/location/clone/controller.js']);
            }]
        },
    }
    $stateProvider.state(LocationClone);
});