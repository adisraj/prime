(function() {
    'use strict'
    angular.module('rc.prime.mto').factory('MTOUDDValueService', MTOUDDValueService);
    MTOUDDValueService.$inject = [
        '$http',
        'application_configuration'
    ];

    function MTOUDDValueService($http, application_configuration) {
        let API = {};
        let apiEndpoint = '/api/mto/uddbridge';

        API.GetMTOUDDValues = getMTOUDDValues;
        API.InsertMTOUDDValue = insertMTOUDDValue;
        API.SearchMTOUDDValue = searchMTOUDDValue;
        API.UpdateMTOUDDValue = updateMTOUDDValue;
        API.DeleteMTOUDDValueById = deleteMTOUDDValueById;


        return {
            API
        };

        function getMTOUDDValues() {
            return $http.get(application_configuration.mtoService.url + apiEndpoint)
                .then((response) => {
                    return response.data;
                });
        };

        function insertMTOUDDValue(uddValueDetails) {
            return $http.post(application_configuration.mtoService.url + apiEndpoint, uddValueDetails);
        };

        function searchMTOUDDValue(search_field, search_value) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/search?field=' + search_field + '&value=' + search_value)
                .then(response => {
                    return response;
                });
        };

        function updateMTOUDDValue(uddValueDetails) {
            return $http.put(application_configuration.mtoService.url + apiEndpoint + '/' + uddValueDetails.id, uddValueDetails);
        };

        function deleteMTOUDDValueById(id) {
            return $http.delete(application_configuration.mtoService.url + apiEndpoint + '/' + id);
        };
    }
})();