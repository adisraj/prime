(function() {
    'use strict'
    angular.module('rc.prime.financingpriceadjustments')
        .factory('FinancingPriceAdjustmentsService', FinancingPriceAdjustmentsService);
    FinancingPriceAdjustmentsService.$inject = [
        '$http',
        'application_configuration'
    ];

    function FinancingPriceAdjustmentsService($http, application_configuration) {
        let API = {};
        API.GetFinancingPriceAdjustments = getFinancingPriceAdjustments;
        API.InsertFinancingPriceAdjustment = insertFinancingPriceAdjustment;
        API.UpdateFinancingPriceAdjustment = updateFinancingPriceAdjustment;
        API.DeleteFinancingPriceAdjustment = deleteFinancingPriceAdjustment;

        return {
            API
        };

        function getFinancingPriceAdjustments() {
            return $http.get(application_configuration.cloudCartService.url + '/api/financing/price/adjustment')
                .then(function(response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertFinancingPriceAdjustment(data) {
            return $http.post(application_configuration.cloudCartService.url + '/api/financing/price/adjustment', data);
        };

        function updateFinancingPriceAdjustment(data) {
            return $http.put(application_configuration.cloudCartService.url + '/api/financing/price/adjustment/' + data.id, data);
        };

        function deleteFinancingPriceAdjustment(data) {
            return $http.delete(application_configuration.cloudCartService.url + '/api/financing/price/adjustment/' + data.id, data);
        };
    }
})();