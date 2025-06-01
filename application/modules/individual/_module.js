'use strict';
angular.module('rc.prime.individual', ['rc.prime.entity']);

angular.module('rc.prime.individual').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var individual_instance = {
        name: 'common.prime.individual',
        url: '/reference/individual',
        templateUrl: 'application/modules/individual/individual.html',
        data: {
            displayName: 'Individuals'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function ($ocLazyLoad) {
                return $ocLazyLoad.load(['./application/modules/individual/individual.controller.js']);
            }]
        }
    };
    $stateProvider.state(individual_instance);
});