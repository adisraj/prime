(function() {
    'use strict'
    angular.module('rc.prime.location.type').factory('LocationTypeService', LocationTypeService);
    LocationTypeService.$inject = [
        '$http',
        'application_configuration'
    ]

    function LocationTypeService($http, application_configuration) {
        let API = {};
        let object = {};
        let selectedLocationTypeIds = [];

        API.DeleteLocationType = deleteLocationType;
        API.GetLocationTypes = getLocationTypes;
        API.GetLocationTypeById = getLocationTypeById;
        API.GetVariable = getVariable;
        API.GetSelectedLocationTypeIds = getSelectedLocationTypeIds;
        API.SetSelectedLocationTypeIds = setSelectedLocationTypeIds;
        API.InsertLocationType = insertLocationType;
        API.SearchLocationType = searchLocationType;
        API.StoreVariable = storeVariable;
        API.UpdateLocationType = updateLocationType;
        API.CloneLocationType = cloneLocationType;

        return {
            API
        };



        function deleteLocationType(locationTypeDetails) {
            return $http.delete(application_configuration.locationService.url + '/api/location/type/' + locationTypeDetails.id, locationTypeDetails);
        };


        function getLocationTypes() {
            return $http.get(application_configuration.locationService.url + '/api/location/type/')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function getSelectedLocationTypeIds(typeIds) {
            return selectedLocationTypeIds;
        };

        function getVariable(key) {
            return object[key];
        };

        function insertLocationType(locationTypeDetails) {
            return $http.post(application_configuration.locationService.url + '/api/location/type/', locationTypeDetails);
        };

        function searchLocationType(search_field, search_value) {
            return $http.get(application_configuration.locationService.url + '/api/location/type/search/' + search_field + '-' + search_value);
        };

        function setSelectedLocationTypeIds(typeIds) {
            selectedLocationTypeIds = typeIds;
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function updateLocationType(locationTypeDetails) {
            return $http.put(application_configuration.locationService.url + '/api/location/type/' + locationTypeDetails.id, locationTypeDetails);
        };

        function getLocationTypeById(id) {
            return $http.get(application_configuration.locationService.url + '/api/location/type/' + id)
                .then((response) => {
                    return response.data;
                });
        }

        function cloneLocationType(typeDetails) {
            return $http.post(application_configuration.locationService.url + '/api/location/type/' + typeDetails.id + "/clone", typeDetails);
        };
    };
})();