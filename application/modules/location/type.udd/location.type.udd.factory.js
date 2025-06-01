(function() {
    'use strict'
    angular.module('rc.prime.location.type.udd').factory('LocationUDDService', LocationUDDService);
    LocationUDDService.$inject = [
        '$http',
        'application_configuration'
    ]

    function LocationUDDService($http, application_configuration) {
        let API = {};
        let object = {};

        API.DeleteLocationUDD = deleteLocationUDD;
        API.DeleteLocationUDDAndDependencies = deleteLocationUDDAndDependencies;
        API.DeleteLocationUDDAndBridgeValuesByAttribute = deleteLocationUDDAndBridgeValuesByAttribute;
        API.DeleteLocationUDDAndBridgeValuesByHierarchy = deleteLocationUDDAndBridgeValuesByHieararchy;
        API.GetLocationUDDByLOV = getLocationUDDByLOV;
        API.GetLocationUDD = getLocationUDD;
        API.GetLocationUDDById = getLocationUDDById;
        API.GetVariable = getVariable;
        API.InsertLocationUDD = insertLocationUDD;
        API.BulkInsertLocationUDD = bulkInsertLocationUDD;
        API.SearchLocationUDD = searchLocationUDD;
        API.StoreVariable = storeVariable;
        API.UpdateLocationUDD = updateLocationUDD;
        API.BulkUpdateLocationUDD = bulkUpdateLocationUDD;
        API.GetLocationUDDList = getLocationUDDList;
        API.DeleteUDDValuesByValue = deleteLocationUDDValuesByValue;

        return {
            API
        };

        function deleteLocationUDDValuesByValue(valueId) {
            return $http.delete(application_configuration.locationService.url + '/api/location/uddbridge/remove/value/' + valueId);
        };

        function deleteLocationUDD(locationTypeDetails) {
            return $http.delete(application_configuration.locationService.url + '/api/location/udd/' + locationTypeDetails.id, locationTypeDetails);
        };

        function deleteLocationUDDAndDependencies(locationTypeDetails) {
            return $http.delete(application_configuration.locationService.url + '/api/location/udd/' + locationTypeDetails.id + '/delete', locationTypeDetails);
        };

        function deleteLocationUDDAndBridgeValuesByAttribute(attributeId) {
            return $http.delete(application_configuration.locationService.url + '/api/location/udd/delete/attribute/' + attributeId, {});
        };

        function deleteLocationUDDAndBridgeValuesByHieararchy(hierarchyId) {
            return $http.delete(application_configuration.locationService.url + '/api/location/udd/delete/hierarchy/' + hierarchyId, {});
        };

        function getLocationUDD() {
            return $http.get(application_configuration.locationService.url + '/api/location/udd/')
                .then((response) => {
                    return response.data;
                });
        };

        function getLocationUDDById(id) {
            return $http.get(application_configuration.locationService.url + '/api/location/udd/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function getLocationUDDList(location_type_id) {
            return $http.get(application_configuration.locationService.url + '/api/location/udd/uddlist/' + location_type_id)
                .then((response) => {
                    return response.data;
                });
        };

        function getLocationUDDByLOV(field, values) {
            return $http.get(application_configuration.locationService.url + '/api/location/udd/lov/' + field + '-' + values)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function getVariable(key) {
            return object[key];
        };

        function insertLocationUDD(locationTypeDetails) {
            return $http.post(application_configuration.locationService.url + '/api/location/udd/', locationTypeDetails);
        };

        function bulkInsertLocationUDD(locationTypeDetails) {
            return $http.post(application_configuration.locationService.url + '/api/location/udd/bulkinsert', locationTypeDetails);
        };

        function searchLocationUDD(search_field, search_value) {
            return $http.get(application_configuration.locationService.url + '/api/location/udd/search/' + search_field + '-' + search_value);
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function updateLocationUDD(locationTypeDetails) {
            return $http.put(application_configuration.locationService.url + '/api/location/udd/' + locationTypeDetails.id, locationTypeDetails);
        };

        function bulkUpdateLocationUDD(locationTypeDetails) {
            return $http.put(application_configuration.locationService.url + '/api/location/udd/bulkupdate', locationTypeDetails);
        };
    };
})();