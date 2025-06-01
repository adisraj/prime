(function() {
    'use strict';

    angular
        .module('rc.prime.item')
        .factory('RetailPriceTypeService', RetailPriceTypeService)

    RetailPriceTypeService.$inject = [
        '$http',
        'application_configuration'
    ];

    function RetailPriceTypeService(
        $http,
        application_configuration
    ) {
        let API = {};
        API.GetRetailPriceTypes = getRetailPriceTypes;
        API.InsertRetailPriceType = insertRetailPriceType;
        API.UpdateRetailPriceType = updateRetailPriceType;
        API.DeleteRetailPriceType = deleteRetailPriceType;

        return {
            API
        };

        function getRetailPriceTypes() {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/retail/price/type')
                .then(response => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        }

        function insertRetailPriceType(details) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/retail/price/type', details);
        };

        function updateRetailPriceType(details) {
            return $http.put(application_configuration.itemAndRetailService.url + '/api/retail/price/type/' + details.id, details);
        };

        function deleteRetailPriceType(details) {
            return $http.delete(application_configuration.itemAndRetailService.url + '/api/retail/price/type/' + details.id, details);
        };
    }
})();