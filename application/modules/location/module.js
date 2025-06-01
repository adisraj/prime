'use strict';
angular.module('rc.prime.location', [
    'rc.prime.entity',
    'rc.prime.location.clone',
    'rc.prime.location.function',
    'common'
]);

angular.module('rc.prime.location').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");
    let location_maintenance = {
        name: 'common.prime.location',
        url: '/maintenance/location',
        templateUrl: 'application/modules/location/maintenance/locations.html',
        data: {
            displayName: 'Location Maintenance'
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    'application/modules/location/maintenance/controller.js',
                    './application/templates/address.contacts.controller.js',
                    './application/templates/address.controller.js',
                    './application/templates/contacts.controller.js'
                ])
            }]
        }
    };
    $stateProvider.state(location_maintenance);
});