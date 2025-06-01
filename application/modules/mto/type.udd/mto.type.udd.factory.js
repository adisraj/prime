(function() {
    'use strict'
    angular.module('rc.prime.mto.type.udd').factory('MTOUDDService', MTOUDDService);
    MTOUDDService.$inject = [
        '$http',
        'application_configuration'
    ]

    function MTOUDDService($http, application_configuration) {
        let API = {};
        let object = {};

        API.DeleteMTOUDD = deleteMTOUDD;
        API.DeleteMtoUDDAndDependencies = deleteMtoUDDAndDependencies;
        API.DeleteMtoUDDAndBridgeValuesByAttribute = deleteMtoUDDAndBridgeValuesByAttribute;
        API.DeleteMtoUDDAndBridgeValuesByHierarchy = deleteMtoUDDAndBridgeValuesByHierarchy;
        API.GetMTOUDDByLOV = getMTOUDDByLOV;
        API.GetMTOUDD = getMTOUDD;
        API.GetMTOUDDById = getMTOUDDById;
        API.GetVariable = getVariable;
        API.InsertMTOUDD = insertMTOUDD;
        API.BulkInsertMTOUDD = bulkInsertMTOUDD;
        API.SearchMTOUDD = searchMTOUDD;
        API.StoreVariable = storeVariable;
        API.UpdateMTOUDD = updateMTOUDD;
        API.BulkUpdateMTOUDD = bulkUpdateMTOUDD;
        API.GetMTOUDDList = getMTOUDDList;
        API.DeleteUDDValuesByValue = deleteMTOUDDValuesByValue;

        return {
            API
        };

        function deleteMTOUDDValuesByValue(valueId) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/uddbridge/remove/value/' + valueId);
        };

        function deleteMTOUDD(mtoTypeDetails) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/udd/' + mtoTypeDetails.id, mtoTypeDetails);
        };


        function deleteMtoUDDAndDependencies(mtoTypeDetails) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/udd/' + mtoTypeDetails.id + '/delete', mtoTypeDetails);
        };

        function deleteMtoUDDAndBridgeValuesByAttribute(attributeId) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/udd/delete/attribute/' + attributeId, {});
        };


        function deleteMtoUDDAndBridgeValuesByHierarchy(hierarchyId) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/udd/delete/hierarchy/' + hierarchyId, {});
        };

        function getMTOUDD() {
            return $http.get(application_configuration.mtoService.url + '/api/mto/udd/')
                .then((response) => {
                    return response.data;
                });
        };

        function getMTOUDDById(id) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/udd/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function getMTOUDDByLOV(field, values) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/udd/in?field=' + field + '&values=' + values)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };


        function getVariable(key) {
            return object[key];
        };

        function insertMTOUDD(mtoTypeDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/udd/', mtoTypeDetails);
        };

        function bulkInsertMTOUDD(mtoTypeDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/udd/bulkinsert', mtoTypeDetails);
        };

        function searchMTOUDD(search_field, search_value) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/udd/search?field=' + search_field + '&value=' + search_value);
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function updateMTOUDD(mtoTypeDetails) {
            return $http.put(application_configuration.mtoService.url + '/api/mto/udd/' + mtoTypeDetails.id, mtoTypeDetails);
        };

        function bulkUpdateMTOUDD(mtoTypeDetails) {
            return $http.put(application_configuration.mtoService.url + '/api/mto/udd/bulkupdate', mtoTypeDetails);
        };

        function getMTOUDDList(option_type_id, option_id, collection_id, family_id) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/udd/uddvalues/' + option_type_id + '/' + option_id + '/' + collection_id + '/' + family_id)
                .then((response) => {
                    return response.data;
                });
        };
    };
})();