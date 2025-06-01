'use strict';
angular.module('rc.prime.country.states.cities', []);

angular.module('rc.prime.country.states.cities').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var country_cities = {
        name: 'common.prime.country.states.cities',
        templateUrl: 'application/modules/country/cities/country.cities.html',
        url: '/:region_id/cities',
        data: {
            displayName: 'country',
            requireLogin: true
        },
        params: {
            country_id: null,
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', function($ocLazyLoad) {
                return $ocLazyLoad.load([
                    './application/modules/country/cities/country.cities.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(country_cities);

});