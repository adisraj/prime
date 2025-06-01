(function () {
    'use strict'
    angular.module('rc.prime.invoicetermsandconditions').factory('invoicetermsandconditionsService', invoicetermsandconditionsService);
    invoicetermsandconditionsService.$inject = [
        '$http',
        'application_configuration'
    ]

    function invoicetermsandconditionsService($http, application_configuration) {
        let API = {};

           API.GetInvoiceTypes = getInvoiceTypes;
           API.GetTermsConditionList = getTermsConditionList;
           API.InsertTermsCondition = insertTermsCondition;
           API.UpdateTermsCondition = updateTermsCondition;
           API.DeleteTermsCondition = deleteTermsCondition;

        return {
            API
        };

        function getTermsConditionList() {
            return $http.get(application_configuration.marketingService.url + '/api/terms-condition/')
                .then(function (response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        }

        function insertTermsCondition(termsConditionDetails) {
            return $http.post(application_configuration.marketingService.url + '/api/terms-condition/', termsConditionDetails);
        }

        function updateTermsCondition(termsConditionDetails) {
            return $http.put(application_configuration.marketingService.url + '/api/terms-condition/' + termsConditionDetails.id, termsConditionDetails);
        }

        function deleteTermsCondition(termsConditionDetails) {
            return $http.delete(application_configuration.marketingService.url + '/api/terms-condition/' + termsConditionDetails.id, termsConditionDetails);
        }

        function getInvoiceTypes() {
            return $http.get(application_configuration.marketingService.url + '/api/terms-condition/invoice-types/')
                .then(function (response) {
                    return response.data;  // Return the invoice types
                });
        }
    }
})();