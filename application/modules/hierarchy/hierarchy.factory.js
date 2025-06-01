(function() {
    'use strict';
    angular.module('rc.prime.hierarchy').factory('HierarchyService', HierarchyService);
    HierarchyService.$inject = [
        '$http',
        'application_configuration'
    ]

    function HierarchyService($http, application_configuration) {
        let API = {};
        let object = {};

        API.FetchStatus = fetchStatus;
        API.DeleteHierarchy = deleteHierarchy;
        API.DeleteHierarchyAndDependencies = deleteHierarchyAndDependencies;
        API.GetHierarchy = getHierarchy;
        API.GetHierarchyByEntityId = getHierarchyByEntityId;
        API.GetHierarchyById = getHierarchyById;
        API.GetHierarchyCount = getHierarchyCount;
        API.GetVariable = getVariable;
        API.InsertHierarchy = insertHierarchy;
        API.SearchHierarchy = searchHierarchy;
        API.MultiSearchHierarchy = multiSearchHierarchy;
        API.StoreVariable = storeVariable;
        API.UpdateHierarchy = updateHierarchy;

        return {
            API
        };

        function fetchStatus() {
            return $http.get(application_configuration.uddService.url + '/api/udd/status');
        }

        function deleteHierarchy(hierarchyDetails) {
            return $http.delete(application_configuration.uddService.url + '/api/hierarchy/' + hierarchyDetails.id, hierarchyDetails);
        };

        function deleteHierarchyAndDependencies(id) {
            return $http.delete(
              application_configuration.uddService.url +
              '/api/hierarchy/' + 
                id + "/delete/dependencies"
            );  
          }

        function getHierarchy() {
            return $http.get(application_configuration.uddService.url + '/api/hierarchies')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response;
                })
        };

        function getHierarchyByEntityId(entity_id) {
            return $http.get(application_configuration.uddService.url + '/api/entity/' + entity_id + '/hierarchies')
                .then((response) => {
                    return response.data;
                });
        };

        function getHierarchyById(id) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function getHierarchyCount() {
            return $http.get(application_configuration.uddService.url + '/api/hierarchies/count');
        };

        function getVariable(key) {
            return object[key];
        };

        function insertHierarchy(hierarchyDetails) {
            return $http.post(application_configuration.uddService.url + '/api/hierarchies', hierarchyDetails);
        };

        function searchHierarchy(search_field, search_value) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchies/search?field=' + search_field + '&value=' + search_value)
                .then(response => {
                    return response.data;
                });
        };

        function multiSearchHierarchy(params) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchies/multisearch', { params: params })
                .then(response => {
                    return response.data;
                });
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function updateHierarchy(hierarchyDetails) {
            return $http.put(application_configuration.uddService.url + '/api/hierarchy/' + hierarchyDetails.id, hierarchyDetails);
        };
    };
})();