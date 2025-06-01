(function() {
    'use strict'
    angular.module('rc.prime.vendor.term').factory('VendorTermsService', VendorTermsService);
    VendorTermsService.$inject = [
        '$http',
        'application_configuration'
    ];

    function VendorTermsService($http, application_configuration) {
        let API = {};
        API.GetVendorTerms = getVendorTerms;
        API.InsertVendorTerm = insertVendorTerm;
        API.UpdateVendorTerm = updateVendorTerm;
        API.DeleteVendorTerm = deleteVendorTerm;

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

        function insertVendorTerm(vendorTermDetails) {
            return $http.post(application_configuration.vendorService.url + '/api/vendor/purchaseterms', vendorTermDetails);
        };

        function updateVendorTerm(vendorTermDetails) {
            return $http.put(application_configuration.vendorService.url + '/api/vendor/purchaseterms/' + vendorTermDetails.id, vendorTermDetails);
        };

        function deleteVendorTerm(vendorTermDetails) {
            return $http.delete(application_configuration.vendorService.url + '/api/vendor/purchaseterms/' + vendorTermDetails.id, vendorTermDetails);
        };
    }
})();