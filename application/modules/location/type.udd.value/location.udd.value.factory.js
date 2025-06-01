(function() {
    'use strict'
    angular.module('rc.prime.location').factory('LocationUDDValueService', LocationUDDValueService);
    LocationUDDValueService.$inject = [
        '$http',
        'application_configuration'
    ];

    function LocationUDDValueService($http, application_configuration) {
        let API = {};
        let apiEndpoint = '/api/location/uddbridge';
        API.SearchLocationUDDValues = searchLocationUDDValues;
        API.InsertLocationUDDValue = insertLocationUDDValue;
        API.UpdateLocationUDDValue = updateLocationUDDValue;
        API.DeleteLocationUDDValueById = deleteLocationUDDValueById;

        return {
            API
        };

        function searchLocationUDDValues(search_field, search_value) {
            return $http.get(application_configuration.locationService.url + apiEndpoint + '/search/' + search_field + '-' + search_value)
                .then((response) => {
                    return response.data;
                });
        };

        function insertLocationUDDValue(uddValueDetails) {
            return $http.post(application_configuration.locationService.url + apiEndpoint, uddValueDetails);
        };

        function updateLocationUDDValue(uddValueDetails) {
            return $http.put(application_configuration.locationService.url + apiEndpoint + '/' + uddValueDetails.id, uddValueDetails);
        };

        function deleteLocationUDDValueById(id) {
            return $http.delete(application_configuration.locationService.url + apiEndpoint + '/' + id);
        };
    }
})();