(function() {
    'use strict'
    angular.module('rc.prime.vendor').factory('VendorParameterService', VendorParameterService);
    VendorParameterService.$inject = [
        '$http',
        'application_configuration'
    ]

    function VendorParameterService($http, application_configuration) {
        let API = {};

        API.GetVendorParameter = getVendorParameter;
        API.InsertVendorParameter = insertVendorParameter;

        return {
            API
        };

        function getVendorParameter() {
            return $http.get(application_configuration.vendorService.url + '/api/vendor/parameter/')
                .then((response) => {
                    return response;
                });
        };

        function insertVendorParameter(VendorParameterDetails) {
            return $http.post(application_configuration.vendorService.url + '/api/vendor/parameter/', VendorParameterDetails);
        };
    };
})();