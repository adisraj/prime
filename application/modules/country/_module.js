'use strict';
angular.module('rc.prime.country', ['rc.prime.entity']);

angular.module('rc.prime.country').config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var country_view = {
        name: 'common.prime.country',
        templateUrl: 'application/modules/country/country.html',
        url: '/reference/country',
        data: {
            displayName: 'Countries',
            requireLogin: true
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/country/country.controller.js']);
            }]
        }

    };
    $stateProvider.state(country_view);
});