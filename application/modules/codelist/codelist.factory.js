(function() {
    'use strict'
    angular.module('rc.prime.codes').factory('CodeService', CodeService);
    CodeService.$inject = [
        '$http',
        'application_configuration'
    ]

    function CodeService($http, application_configuration) {
        let API = {};
        let isCache = false;
        API.GetCodesList = getCodesList;
        API.GetStatuses = getStatuses;
        API.MultiSearchCodeList = multiSearchCodeList;
        API.InsertCode = insertCode;
        API.UpdateCode = updateCode;
        API.DeleteCode = deleteCode;
        API.SearchCodes = searchCodes;

        return {
            API
        };

        function getCodesList(cacheValue) {
            if (cacheValue !== undefined && cacheValue !== null) {
                isCache = cacheValue;
            }
            return $http.get(application_configuration.entityService.url + '/api/code', { cache: isCache })
                .then(function(response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        }

        function searchCodes(field_name, field_value) {
            return $http.get(application_configuration.entityService.url + '/api/code/search/' + field_name + '-' + field_value)
                .then(function(response) {
                    return response.data;
                });
        }

        function insertCode(codeDetails) {
            isCache = false;
            return $http.post(application_configuration.entityService.url + '/api/code', codeDetails);
        }

        function multiSearchCodeList(params) {
            return $http.get(application_configuration.entityService.url + '/api/code/multisearch/', { params: params })
                .then(function(response) {
                    return response.data;
                });
        }

        function updateCode(codeDetails) {
            isCache = false;
            return $http.put(application_configuration.entityService.url + '/api/code/' + codeDetails.id, codeDetails);
        }

        function deleteCode(codeDetails) {
            isCache = false;
            return $http.delete(application_configuration.entityService.url + '/api/code/' + codeDetails.id, codeDetails);
        }

        function getStatuses(service, base_url) {
            if (service === 'uddService') {
                return $http.get(application_configuration[service].url + "/api/udd/status")
                    .then(response => {
                        return response.data;
                    });
            } else {
                return $http.get(application_configuration[service].url + "/" + base_url + '/nextstatus')
                    .then(response => {
                        return response.data;
                    });
            }

        }
    }

})();