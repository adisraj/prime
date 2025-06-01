(function() {
    'use strict'
    angular.module('rc.prime.hierarchy.value').factory('HierarchyValueService', HierarchyValueService);
    HierarchyValueService.$inject = [
        '$http',
        'application_configuration'
    ]

    function HierarchyValueService($http, application_configuration) {
        let API = {};

        API.GetHierarchyValues = getHierarchyValues;
        API.DeleteHierarchyValue = deleteHierarchyValue;
        API.GetDivisions = getDivisions;
        API.GetHierarchyValueByEntityId = getHierarchyValueByEntityId;
        API.GetHierarchyValueByHierarchyId = getHierarchyValueByHierarchyId;
        API.GetHierarchyValueById = getHierarchyValueById;
        API.GetHierarchyValueCount = getHierarchyValueCount;
        API.GetHierarchyValueCountById = getHierarchyValueCountById;
        API.GetListOfChilds = getListOfChilds;
        API.GetParentHierarchyValue = getParentHierarchyValue;
        API.GetProductExplorerValues = getProductExplorerValues;
        API.GetDepartmentsAndClasses = getDepartmentsAndClasses;
        API.GetDivisionsForNode = getDivisionsForNode;
        API.GetDepartmentsForNode = getDepartmentsForNode;
        API.GetDepartmentForClass = getDepartmentForClass;
        API.GetVariable = getVariable;
        API.InsertHierarchyValue = insertHierarchyValue;
        API.SearchHierarchyValue = searchHierarchyValue;
        API.UpdateHierarchyValue = updateHierarchyValue;

        return {
            API
        };

        function getHierarchyValues() {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties')
                .then(response => { return response.data });
        }

        function deleteHierarchyValue(hierarchyDetails) {
            return $http.delete(application_configuration.uddService.url + '/api/hierarchy/property/' + hierarchyDetails.id, hierarchyDetails);
        };

        function getDivisions() {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/divisions')
                .then(response => { return response.data });
        };

        function getHierarchyValueByHierarchyId(hierarchy_id) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/' + hierarchy_id + '/properties')
                .then((response) => {
                    return response.data;
                });
        };

        function getHierarchyValueByEntityId(entity_id) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/entity/' + entity_id);
        };

        function getHierarchyValueById(id) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/property/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function getHierarchyValueCount() {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/count');
        };

        function getHierarchyValueCountById(hierarchyId) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/' + hierarchyId + '/properties/count');
        };

        function getListOfChilds(ids) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/in?field=parent_id&values=' + ids)
                .then((response) => {
                    return response.data;
                });
        };

        function getParentHierarchyValue() {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/parent')
                .then(response => { return response.data });
        };


        function getProductExplorerValues() {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/explorer')
                .then(response => { return response.data.data });
        };

        function getDepartmentsAndClasses() {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/departments/classes/')
                .then((response) => {
                    return response.data;
                });
        }

        function getDivisionsForNode(id) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/'+ id + '/properties/divisions')
                .then((response) => {
                    return response.data;
                });
        }

        function getDepartmentsForNode(id) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/'+ id + '/properties/departments')
                .then((response) => {
                    return response.data;
                });
        }

        function getDepartmentForClass(classId) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/' + classId +'/departments')
                .then((response) => {
                    return response.data;
                });
        }

        function getVariable(key) {
            return object[key];
        };

        function insertHierarchyValue(hierarchyDetails) {
            return $http.post(application_configuration.uddService.url + '/api/hierarchy/properties', hierarchyDetails);
        };

        function searchHierarchyValue(search_field, search_value) {
            return $http.get(application_configuration.uddService.url + '/api/hierarchy/properties/search?field=' + search_field + '&value=' + search_value)
                .then((response) => {
                    return response.data;
                });
        };

        function updateHierarchyValue(hierarchyDetails) {
            return $http.put(application_configuration.uddService.url + '/api/hierarchy/property/' + hierarchyDetails.id, hierarchyDetails);
        };

    };
})();