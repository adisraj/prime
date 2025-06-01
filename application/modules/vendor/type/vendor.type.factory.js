(function() {
    'use strict'
    angular.module('rc.prime.vendor.type').factory('VendorTypeService', VendorTypeService);
    VendorTypeService.$inject = [
        '$http',
        'application_configuration'
    ]

    function VendorTypeService($http, application_configuration) {
        let API = {};
        let object = {};
        let selectedVendorTypeIds = [];

        API.DeleteVendorType = deleteVendorType;
        API.GetVendorTypes = getVendorTypess;
        API.GetVendorTypeById = getVendorTypeById;
        API.GetVariable = getVariable;
        API.GetSelectedVendorTypeIds = getSelectedVendorTypeIds;
        API.SetSelectedVendorTypeIds = setSelectedVendorTypeIds;
        API.FetchStatus = fetchStatus;
        API.InsertVendorType = insertVendorType;
        API.SearchVendorType = searchVendorType;
        API.StoreVariable = storeVariable;
        API.UpdateVendorType = updateVendorType;
        API.CloneVendorType = cloneVendorType;

        return {
            API
        };



        function deleteVendorType(vendorTypeDetails) {
            return $http.delete(application_configuration.vendorService.url + '/api/vendor/type/' + vendorTypeDetails.id, vendorTypeDetails);
        };


        function getVendorTypess() {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/type/')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function getVendorTypeById(id) {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/type/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function getSelectedVendorTypeIds(typeIds) {
            return selectedVendorTypeIds;
        };

        function getVariable(key) {
            return object[key];
        };

        function insertVendorType(vendorTypeDetails) {
            return $http.post(application_configuration.vendorService.url + '/api/vendor/type/', vendorTypeDetails);
        };

        function searchVendorType(search_field, search_value) {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/type/search?field=' + search_field + '&value=' + search_value);
        };

        function setSelectedVendorTypeIds(typeIds) {
            selectedVendorTypeIds = typeIds;
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function updateVendorType(vendorTypeDetails) {
            return $http.put(application_configuration.vendorService.url + '/api/vendor/type/' + vendorTypeDetails.id, vendorTypeDetails);
        };

        function fetchStatus() {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/status')
                .then(response => {
                    return response.data;
                })
        };


        function cloneVendorType(typeDetails) {
            return $http.post(application_configuration.vendorService.url + '/api/vendor/type/' + typeDetails.id + "/clone", typeDetails);
        };
    };
})();