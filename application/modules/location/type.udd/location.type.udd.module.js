'use strict';
angular.module('rc.prime.location.type.udd', ['rc.prime.entity', 'common']);

angular.module('rc.prime.location.type.udd').config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/login");

    // Location type udds list UI
    var locationudd = {
        name: 'common.prime.locationtypeudd',
        url: '/configure/location/type/:location_type_id/udd',
        templateUrl: 'application/modules/location/type.udd/location.type.udd.html',
        data: {
            displayName: 'Location Type User Defined Data'
        },
        params: {
            location_type_id: null
        },
        resolve: {
            loadFiles: ['$ocLazyLoad', ($ocLazyLoad) => {
                return $ocLazyLoad.load(['./application/modules/location/type.udd/location.type.udd.controller.js']);
            }]
        }
    };
    $stateProvider.state(locationudd);


    // Create new Location type udd UI
    var new_location_type_udd = {
        name: 'common.prime.locationtypeudd.new',
        url: '/new',
        templateUrl: 'application/modules/location/type.udd/location.type.udd.new.html',
    };
    $stateProvider.state(new_location_type_udd);

    // Create new Location type udd UI
    var update_location_type_udd = {
        name: 'common.prime.locationtypeudd.update',
        url: '/:location_type_udd_id/update',
        templateUrl: 'application/modules/location/type.udd/location.type.udd.update.html',
    };
    $stateProvider.state(update_location_type_udd);



});