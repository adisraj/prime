(function() {
    'use strict'
    angular.module('rc.prime.mto.choice').factory('MTOChoiceService', MTOChoiceService);
    MTOChoiceService.$inject = [
        '$http',
        'application_configuration'
    ];

    function MTOChoiceService($http, application_configuration) {
        let API = {};
        let apiEndpoint = '/api/mto/choice';

        API.GetChoices = getChoices;
        API.GetChoiceCount = getChoiceCount;
        API.GetChoicesByOptionId = getChoicesByOptionId;
        API.GetListOfValues = getListOfValues;
        API.FetchChoicesByOptionId=fetchChoicesByOptionId;
        API.InsertChoice = insertChoice;
        API.UpdateChoice = updateChoice;
        API.DeleteChoice = deleteChoice;
        API.GroupByColumnName = groupByColumnName;
        API.GroupByFieldAndValues = groupByFieldAndValues;
        API.FetchFilteredChoices = fetchFilteredChoices;
        API.GetChoiceById = getChoiceById;
        API.SearchMto = searchMto;

        return {
            API
        };

        function getChoices() {
            return $http.get(application_configuration.mtoService.url + apiEndpoint)
                .then((response) => {
                    return response.data;
                });
        };

        function getChoicesByOptionId(option_id, paginationObject, filterData, sortObject, groupObject) {
            return $http({
                url: application_configuration.mtoService.url + apiEndpoint + '/option/' + option_id,
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

        function getChoiceById(id) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/' + id)
                .then((response) => {
                    return response.data;
                });
        };

        function fetchChoicesByOptionId(optionId) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/' + optionId + '/choices')
                .then((response) => {
                    return response.data;
                });
        };

         function searchMto(search_field, search_value) {
        return $http.get(application_configuration.mtoService.url +
            apiEndpoint +
            "/search/" +
            search_field +
            "-" +
            search_value
        )
        .then(function(response) {
          return response.data;
        });
    };
        
        function getChoiceCount(option_id) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/' + option_id + '/choice/count')
                .then((response) => {
                    return response.data.total_records;
                });
        };

        function getListOfValues(option_id, field, values, page, limit) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/option/' + option_id + '/in?field=' + field + '&values=' + values + '&page=' + page + '&limit=' + limit)
                .then(function(response) {
                    return response.data;
                });
        }

        function insertChoice(choiceDetails) {
            return $http.post(application_configuration.mtoService.url + apiEndpoint, choiceDetails);
        };

        function updateChoice(choiceDetails) {
            return $http.put(application_configuration.mtoService.url + apiEndpoint + '/' + choiceDetails.id, choiceDetails);
        };

        function deleteChoice(option_id, choice_id) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/choice/option/' + option_id + '/choice/' +
                choice_id);
        };

        function groupByColumnName(field, option_id) {
            return $http.get(application_configuration.mtoService.url + apiEndpoint + '/groupby/' + field + '/option/' + option_id)
                .then((response) => {
                    return response.data;
                });
        };

        function groupByFieldAndValues(option_id,object,page,limit) {
            return $http.post(application_configuration.mtoService.url + apiEndpoint + '/option/' + option_id + '/group?page='+ page + '&limit=' + limit, object)
                .then(function(response) {
                    return response.data;
                });
        };

        function fetchFilteredChoices(filterData, page, limit) {
            return $http.post(application_configuration.mtoService.url + apiEndpoint + "/filter?page=" + page + "&limit=" + limit, filterData);
        };
    }
})();