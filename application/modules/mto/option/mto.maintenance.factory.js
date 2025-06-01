(function() {
    'use strict'
    angular.module('rc.prime.mto').factory('MTOService', MTOService);
    MTOService.$inject = [
        '$http',
        'application_configuration'
    ];

    function MTOService($http, application_configuration) {
        let API = {};
        let object = {};
        let apiEndpoint = '/api/mto';

        API.FetchMto = fetchMto;
        API.FetchTotalRecordCount = fetchTotalRecordCount;
        API.GetMTOList = getMTOList;
        API.GetListOfValues = getListOfValues;
        API.SearchMTO = searchMTO;
        API.InsertMTO = insertMTO;
        API.UpdateMTO = updateMTO;
        API.DeleteMTO = deleteMTO;
        API.GroupByColumnName = groupByColumnName;
        API.GetVariable = getVariable;
        API.StoreVariable = storeVariable;
        API.FetchFilteredMTOs = fetchFilteredMTOs;
        API.GetMTOListById = getMTOListById;
        API.GroupByFieldAndValues = groupByFieldAndValues;


        return {
            API
        };

        function getMTOList(paginationObject, filterData, sortObject, groupObject) {
            return $http({
                url: application_configuration.mtoService.url + apiEndpoint,
                method: "GET",
                // Sending objects through query string
                params: {
                    pagination: paginationObject,
                    filters: filterData,
                    sort: sortObject,
                    group: groupObject
                }
            })
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function getMTOListById(id) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/' + id).then(response => {

                return response.data;
            });
        };

        function getListOfValues(field, values, page, limit) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/in?field=' + field + '&values=' + values + '&page=' + page + '&limit=' + limit)
                .then(function(response) {
                    return response.data;
                });
        }

        function searchMTO(search_field, search_value) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/search?field=' + search_field + '&value=' + search_value)
                .then((response) => {
                    return response;
                });
        };

        function fetchTotalRecordCount() {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/count')
                .then(response => {
                    return response.data.total_records;
                });
        };

        function fetchMto(id) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/' + id)
                .then(response => {
                    return response;
                })
        };

        function insertMTO(mtoDetails) {
            return $http.post(application_configuration.mtoService.url + apiEndpoint, mtoDetails);
        };

        function updateMTO(mtoDetails) {
            return $http.put(application_configuration.mtoService.url + apiEndpoint + '/' + mtoDetails.id, mtoDetails);
        };

        function deleteMTO(mtoDetails) {
            return $http.delete(application_configuration.mtoService.url + apiEndpoint + '/' + mtoDetails.id, mtoDetails);
        };

        function groupByColumnName(field) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/groupby/' + field)
                .then(function(response) {
                    return response.data;
                });

        };

        function groupByFieldAndValues(object,page,limit) {
            return $http.post(application_configuration.mtoService.url + apiEndpoint + '/group?page=' + page + "&limit=" + limit, object)
                .then(function(response) {
                    return response.data;
                });
        };

        function getVariable(key) {
            return object[key];
        };

        function storeVariable(key, value) {
            object[key] = value;
        };

        function fetchFilteredMTOs(filterData, page, limit) {
            return $http.post(application_configuration.mtoService.url + apiEndpoint + '/filter?page=' + page + '&limit=' + limit, filterData);
        }
    }
})();