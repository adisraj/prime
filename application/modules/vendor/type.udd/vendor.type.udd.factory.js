(function() {
    'use strict'
    angular.module('rc.prime.vendor.type.udd').factory('VendorUDDService', VendorUDDService);
    VendorUDDService.$inject = [
        '$http',
        'application_configuration'
    ]

    function VendorUDDService($http, application_configuration) {
        let API = {};
        let object = {};

        API.DeleteVendorUDD = deleteVendorUDD;
        API.DeleteVendorUDDAndDependencies = deleteVendorUDDAndDependencies;
        API.DeleteVendorUDDAndBridgeValuesByAttribute = deleteVendorUDDAndBridgeValuesByAttribute;
        API.DeleteVendorUDDAndBridgeValuesByHierarchy = deleteVendorUDDAndBridgeValuesByHierarchy;
        API.GetVendorUDDByLOV = getVendorUDDByLOV;
        API.GetVendorUDD = getVendorUDD;
        API.GetVendorUDDById = getVendorUDDById;
        API.GetVendorUDDList = getVendorUDDList;
        API.GetVariable = getVariable;
        API.FetchStatus = fetchStatus;
        API.InsertVendorUDD = insertVendorUDD;
        API.BulkInsertVendorUDD = bulkInsertVendorUDD;
        API.SearchVendorUDD = searchVendorUDD;
        API.StoreVariable = storeVariable;
        API.UpdateVendorUDD = updateVendorUDD;
        API.BulkUpdateVendorUDD = bulkUpdateVendorUDD;
        API.DeleteUDDValuesByValue = deleteVendorUDDValuesByValue;
        return {
            API
        };

        function deleteVendorUDDValuesByValue(valueId) {
            return $http.delete(application_configuration.vendorService.url + '/api/vendor/uddbridge/remove/value/' + valueId);
        };

        function deleteVendorUDD(vendorTypeDetails) {
            return $http.delete(application_configuration.vendorService.url + '/api/vendor/udd/' + vendorTypeDetails.id, vendorTypeDetails);
        };

        function deleteVendorUDDAndDependencies(vendorTypeDetails) {
            return $http.delete(application_configuration.vendorService.url + '/api/vendor/udd/' + vendorTypeDetails.id + '/delete', vendorTypeDetails);
        };

        function deleteVendorUDDAndBridgeValuesByAttribute(attributeId) {
            return $http.delete(application_configuration.vendorService.url + '/api/vendor/udd/delete/attribute/' + attributeId, {});
        };

        function deleteVendorUDDAndBridgeValuesByHierarchy(hierarchyId) {
            return $http.delete(application_configuration.vendorService.url + '/api/vendor/udd/delete/hierachy/' + hierarchyId, {});
        };

        function getVendorUDD() {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/udd/')
                .then((response) => {
                    return response.data;
                });
        };

        function getVendorUDDById(id) {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/udd/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function getVendorUDDByLOV(field, values) {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/udd/in?field=' + field + '&values=' + values)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function getVendorUDDList(vendor_type_id) {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/udd/uddlist/' + vendor_type_id)
                .then((response) => {
                    return response.data;
                });
        };

        function getVariable(key) {
            return object[key];
        };

        function insertVendorUDD(vendorTypeDetails) {
            return $http.post(application_configuration.vendorService.url + '/api/vendor/udd/', vendorTypeDetails);
        };

        function bulkInsertVendorUDD(vendorTypeDetails) {
            return $http.post(application_configuration.vendorService.url + '/api/vendor/udd/bulkinsert/', vendorTypeDetails);
        };

        function searchVendorUDD(search_field, search_value) {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/udd/search?field=' + search_field + '&value=' + search_value);
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function updateVendorUDD(vendorTypeDetails) {
            return $http.put(application_configuration.vendorService.url + '/api/vendor/udd/' + vendorTypeDetails.id, vendorTypeDetails);
        };

        function bulkUpdateVendorUDD(vendorTypeDetails) {
            return $http.put(application_configuration.vendorService.url + '/api/vendor/udd/bulkupdate/', vendorTypeDetails);
        };

        function fetchStatus() {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/status')
                .then(response => {
                    return response.data;
                })
        };
    };
})();