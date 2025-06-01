(function () {
    'use strict'
    angular.module('calculus').factory('CloudCartService', CloudCartService);
    CloudCartService.$inject = [
        '$http',
        'application_configuration'
    ];

    function CloudCartService($http, application_configuration) {
        let API = {};
        API.DeleteCartOptionsByOptionTypeId = deleteCartOptionsByOptionTypeId;
        API.GetSKUPricingChoices = getSKUPricingChoices;

        return {
            API
        };

        function deleteCartOptionsByOptionTypeId(optionTypeId) {
            return $http.delete(application_configuration.cloudCartService.url + '/api/cloud/cart/item/options/remove/optiontype/' + optionTypeId);
        };

        function getSKUPricingChoices() {
            return $http.get(`${application_configuration.cloudCartService.url}/api/cloud/cart/pricingchoice`)
                .then(response => {
                    return response.data;
                });
        }



    }
})();
