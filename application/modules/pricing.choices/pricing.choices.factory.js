(function () {
    'use strict'
    angular.module('rc.prime.pricingchoices').factory('PricingChoicesService', PricingChoicesService);
    PricingChoicesService.$inject = [
        '$http',
        'application_configuration'
    ];

    function PricingChoicesService($http, application_configuration) {
        let API = {};
        let isCache = false;
        API.GetPricingChoices = getPricingChoices;
        API.InsertPricingChoice = insertPricingChoice;
        API.UpdatePricingChoice = updatePricingChoice;
        API.DeletePricingChoice = deletePricingChoice;

        return {
            API
        };

        function getPricingChoices(cacheValue) {
            if (cacheValue !== undefined && cacheValue !== null) {
                isCache = cacheValue;
            }

            return $http.get(application_configuration.cloudCartService.url + '/api/cloud/cart/pricingchoice/', {
                    cache: isCache
                })
                .then(function (response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function insertPricingChoice(pricingchoiceDetails) {
            isCache = false;
            return $http.post(application_configuration.cloudCartService.url + '/api/cloud/cart/pricingchoice/', pricingchoiceDetails);
        };

        function updatePricingChoice(pricingchoiceDetails) {
            isCache = false;
            return $http.put(application_configuration.cloudCartService.url + '/api/cloud/cart/pricingchoice/' + pricingchoiceDetails.id, pricingchoiceDetails);
        };

        function deletePricingChoice(pricingchoiceDetails) {
            isCache = false;
            return $http.delete(application_configuration.cloudCartService.url + '/api/cloud/cart/pricingchoice/' + pricingchoiceDetails.id, pricingchoiceDetails);
        };



    }
})();