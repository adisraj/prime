(function() {
    'use strict'
    angular.module('rc.prime.mto.type').factory('MTOTypeService', MTOTypeService);
    MTOTypeService.$inject = [
        '$http',
        'application_configuration'
    ]

    function MTOTypeService($http, application_configuration) {
        let API = {};
        let object = {};
        let selectedMTOTypeIds = [];

        API.DeleteMTOType = deleteMTOType;
        API.GetMTOTypes = getMTOTypes;
        API.GetMTOTypeById = getMTOTypeById;
        API.GetVariable = getVariable;
        API.GetSelectedMTOTypeIds = getSelectedMTOTypeIds;
        API.SetSelectedMTOTypeIds = setSelectedMTOTypeIds;
        API.InsertMTOType = insertMTOType;
        API.SearchMTOType = searchMTOType;
        API.StoreVariable = storeVariable;
        API.UpdateMTOType = updateMTOType;
        API.FetchStatus = fetchStatus;
        API.CloneMTOType = cloneMTOType;
        
        return {
            API
        };



        function deleteMTOType(mtoTypeDetails) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/type/' + mtoTypeDetails.id, mtoTypeDetails);
        };


        function getMTOTypes() {
            return $http.get(application_configuration.mtoService.url + '/api/mto/type/')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function getMTOTypeById(id) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/type/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function getSelectedMTOTypeIds(typeIds) {
            return selectedMTOTypeIds;
        };

        function getVariable(key) {
            return object[key];
        };

        function insertMTOType(mtoTypeDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/type/', mtoTypeDetails);
        };

        function searchMTOType(search_field, search_value) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/type/search?field=' + search_field + '&value=' + search_value);
        };

        function setSelectedMTOTypeIds(typeIds) {
            selectedMTOTypeIds = typeIds;
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function updateMTOType(mtoTypeDetails) {
            return $http.put(application_configuration.mtoService.url + '/api/mto/type/' + mtoTypeDetails.id, mtoTypeDetails);
        };


        function fetchStatus() {
            return $http.get(application_configuration.mtoService.url + '/api/mto/status')
                .then(response => {
                    return response.data;
                })
        };

        function cloneMTOType(typeDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/type/' + typeDetails.id + "/clone", typeDetails);
        };
    };
})();