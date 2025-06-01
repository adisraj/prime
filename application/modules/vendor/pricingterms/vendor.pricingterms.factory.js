(function() {
    'use strict'
    angular.module('rc.prime.vendor.pricingterms').factory('VendorpricingtermsService', VendorpricingtermsService);
    VendorpricingtermsService.$inject = [
        '$http',
        'application_configuration'
    ];

    function VendorpricingtermsService($http, application_configuration) {
        let API = {};
        API.GetVendorTerms = getVendorTerms;
        API.Insertpricingfactor = insertpricingfactor;
        API.Updatepricingfactor = updatepricingfactor;
        API.Deletepricingfactor = deletepricingfactor;

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

        function insertpricingfactor(vendorTermDetails) {
            return $http.post(application_configuration.cloudCartService.url + '/api/financing/choice/pricing/factors/updatepricingfactor', vendorTermDetails);
        };

        function updatepricingfactor(vendorTermDetails) {
            return $http.put(application_configuration.cloudCartService.url + '/api/financing/choice/pricing/factors/updatepricingfactor', vendorTermDetails);
        };

        function deletepricingfactor(vendorTermDetails) {
            return $http.delete(application_configuration.cloudCartService.url + '/api/financing/choice/pricing/factors/' + vendorTermDetails.id);
        };
    }
})();