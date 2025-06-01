(function() {
    'use strict'
    angular.module('rc.prime.vendor').factory('VendorUDDValueService', VendorUDDValueService);
    VendorUDDValueService.$inject = [
        '$http',
        'application_configuration'
    ]

    function VendorUDDValueService($http, application_configuration) {
        let API = {};
        let object = {};

        API.GetVendorUDDList = getVendorUDDList;
        API.GetUddValueOptionChoices = getUddValueOptionChoices;
        API.InsertVendorUDDValue = insertVendorUDDValue;
        API.SearchVendorUDDValue = searchVendorUDDValue;
        API.MultiSearchVendorUDDValue = multiSearchVendorUDDValue;
        API.UpdateVendorUDDValue = updateVendorUDDValue;
        API.DeleteVendorUDDValueById = deleteVendorUDDValueById;

        let apiEndpoint = '/api/vendor/uddbridge';

        return {
            API
        };


        function getVendorUDDList() {
            return $http.get(application_configuration.vendorService.url + apiEndpoint)
                .then((response) => {
                    return response.data;
                });
        };

        function getUddValueOptionChoices(entry_id) {
            return $http.get(application_configuration.vendorService.url + apiEndpoint + '/optionchoices/' + entry_id)
                .then((response) => {
                    return response.data;
                });
        };

        function insertVendorUDDValue(uddValueDetails) {
            return $http.post(application_configuration.vendorService.url + apiEndpoint, uddValueDetails);
        };

        function searchVendorUDDValue(search_field, search_value) {
            return $http.get(application_configuration.vendorService.url + apiEndpoint + '/search?field=' + search_field + '&value=' + search_value)
                .then((response) => {
                    return response.data;
                });
        };

        function multiSearchVendorUDDValue(params) {
            return $http.get(application_configuration.vendorService.url + apiEndpoint + '/multisearch/', { params: params })
                .then((response) => {
                    return response.data;
                });
        };

        function updateVendorUDDValue(uddValueDetails) {
            return $http.put(application_configuration.vendorService.url + apiEndpoint + '/' + uddValueDetails.id, uddValueDetails);
        };

        function deleteVendorUDDValueById(id) {
            return $http.delete(application_configuration.vendorService.url + apiEndpoint + '/' + id);
        }
    };
})();