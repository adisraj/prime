(function() {
    'use strict'
    angular.module('rc.prime.financingchoices').factory('FinancingChoicesService', FinancingChoicesService);
    FinancingChoicesService.$inject = [
        '$http',
        'application_configuration'
    ];

    function FinancingChoicesService($http, application_configuration) {
        let API = {};
        API.GetFinancingChoices = getFinancingChoices;
        API.InsertFinancingChoice = insertFinancingChoice;
        API.UpdateFinancingChoice = updateFinancingChoice;
        API.DeleteFinancingChoice = deleteFinancingChoice;
        API.GetFinancingChoiceTerms = getFinancingChoiceTerms;
        API.GetFinancingChoicePricingFactors = getFinancingChoicePricingFactors;

        return {
            API
        };

        function getFinancingChoices() {
            return $http.get(application_configuration.cloudCartService.url + '/api/financing/choices')
                .then(function(response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertFinancingChoice(data) {
            return $http.post(application_configuration.cloudCartService.url + '/api/financing/choices', data);
        };

        function updateFinancingChoice(data) {
            return $http.put(application_configuration.cloudCartService.url + '/api/financing/choices/' + data.id, data);
        };

        function deleteFinancingChoice(data) {
            return $http.delete(application_configuration.cloudCartService.url + '/api/financing/choices/' + data.id, data);
        };

        function getFinancingChoiceTerms() {
            return $http.get(application_configuration.cloudCartService.url + '/api/financing/choice/terms')
            .then(function(response) {
                let time = response.config.responseTimestamp - response.config.requestTimestamp;
                response.data.data.time_taken = (time / 1000);
                return response;
            });
        };

        function getFinancingChoicePricingFactors() {
            return $http.get(application_configuration.cloudCartService.url + '/api/financing/choice/pricing/factors')
            .then(function(response) {
                let time = response.config.responseTimestamp - response.config.requestTimestamp;
                response.data.data.time_taken = (time / 1000);
                return response;
            });
            
        };
    }
})();