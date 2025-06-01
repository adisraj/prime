'use strict';
angular.module('rc.prime.country.states', []);

angular.module('rc.prime.country.states').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    var country_states = {
        name: 'common.prime.country.states',
        templateUrl: 'application/modules/country/states/country.states.html',
        url: '/:country_id/states',
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
                    './application/modules/country/states/country.states.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(country_states);

});