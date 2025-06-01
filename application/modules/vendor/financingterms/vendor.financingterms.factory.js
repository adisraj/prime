(function() {
    'use strict'
    angular.module('rc.prime.vendor.financingterms').factory('VendorfinancingTermsService', VendorfinancingTermsService);
    VendorfinancingTermsService.$inject = [
        '$http',
        'application_configuration'
    ];

    function VendorfinancingTermsService($http, application_configuration) {
        let API = {};
        API.GetVendorTerms = getVendorTerms;
        API.InsertfinancingTerm = insertfinancingTerm;
        API.UpdateFinancingterm = updateFinancingterm;
        API.DeleteFinancingTerm = deleteFinancingTerm;

        return {
            API
        };

        function getVendorTerms() {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/purchaseterms')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function insertfinancingTerm(vendorTermDetails) {
            return $http.post(application_configuration.cloudCartService.url + '/api/financing/choice/terms/updatefinancingterm', vendorTermDetails);
        };

        function updateFinancingterm(vendorTermDetails) {
            return $http.put(application_configuration.cloudCartService.url + '/api/financing/choice/terms/updatefinancingterm', vendorTermDetails);
        };

        function deleteFinancingTerm(vendorTermDetails) {
            return $http.delete(application_configuration.cloudCartService.url + '/api/financing/choice/terms/' + vendorTermDetails.id);
        };
    }
})();