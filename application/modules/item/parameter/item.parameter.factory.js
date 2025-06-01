(function() {
    'use strict'
    angular.module('rc.prime.item').factory('ItemParameterService', ItemParameterService);
    ItemParameterService.$inject = [
        '$http',
        'application_configuration'
    ]

    function ItemParameterService($http, application_configuration) {
        let API = {};

        API.GetItemParameter = getItemParameter;
        API.InsertItemParameter = insertItemParameter;
        API.UpdateItemParameter = updateItemParameter;
        API.GetSKUFormat = getSKUFormat;
        API.InsertSKUFormat = insertSKUFormat;



        return {
            API
        };

        function getItemParameter() {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/item/parameter/')
                .then((response) => {
                    return response.data;
                });
        };

        function insertItemParameter(ItemParameterDetails) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/item/parameter/', ItemParameterDetails);
        };

        function updateItemParameter(ItemParameterDetails) {
            return $http.put(application_configuration.itemAndRetailService.url + '/api/item/parameter/' + ItemParameterDetails.id, ItemParameterDetails);
        };



        function getSKUFormat() {
            return $http.get(application_configuration.itemAndRetailService.url + '/api/sku/format/')
                .then((response) => {
                    return response.data;
                });
        };

        function insertSKUFormat(ItemParameterDetails) {
            return $http.post(application_configuration.itemAndRetailService.url + '/api/sku/format/', ItemParameterDetails);
        };


    };
})();