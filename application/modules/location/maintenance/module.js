'use strict';
angular.module('rc.prime.location.function', ['calculus.application']);
angular.module('rc.prime.location.function').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    let new_location = {
        name: 'common.prime.location.new',
        url: '/new',
        views: {
            '': {
                templateUrl: 'application/modules/location/maintenance/new.location.html'
            }
        }
    }
    $stateProvider.state(new_location);

    let update_location = {
        name: 'common.prime.location.update',
        url: '/:id/update',
        views: {
            '': {
                templateUrl: 'application/modules/location/maintenance/update.location.html'
            }
        }
    }
    $stateProvider.state(update_location);

});