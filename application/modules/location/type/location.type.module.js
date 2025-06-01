'use strict';
angular.module('rc.prime.location.type', ['rc.prime.entity', 'common']);

angular.module('rc.prime.location.type').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    // Location types list UI
    var location = {
        name: 'common.prime.locationtype',
        url: '/configure/location/type',
        templateUrl: 'application/modules/location/type/location.type.html',
        data: {
            displayName: 'Location Type'
        },
        resolve: {
            // Load related files only by lazy load 
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load([
                    './application/modules/location/type/location.type.controller.js',
                    './application/modules/location/parameter/location.parameter.controller.js'
                ]);
            }]
        }
    };
    $stateProvider.state(location);

    // Create new Location type UI
    var new_location_type = {
        name: 'common.prime.locationtype.new',
        url: '/new',
        templateUrl: 'application/modules/location/type/location.type.new.html',
    };
    $stateProvider.state(new_location_type);

    // Create new Location type UI
    var update_location_type = {
        name: 'common.prime.locationtype.update',
        url: '/:location_type_id/update',
        templateUrl: 'application/modules/location/type/location.type.update.html',
    };
    $stateProvider.state(update_location_type);

});