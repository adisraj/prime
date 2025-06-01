(function () {
    'use strict'
    angular.module('rc.prime.item').factory('ItemUDDValueService', ItemUDDValueService);
    ItemUDDValueService.$inject = [
        '$http',
        'application_configuration'
    ]


    function ItemUDDValueService($http, application_configuration) {
        let API = {};
        let object = {};


        API.GetItemUDDValues = getItemUDDValues;
        API.GetUddValueOptionChoices = getUddValueOptionChoices;
        API.InsertItemUDDValue = insertItemUDDValue;
        API.SearchItemUDDValue = searchItemUDDValue;
        API.MultiSearchItemUDDValue = multiSearchItemUDDValue;
        API.UpdateItemUDDValue = updateItemUDDValue;
        API.DeleteItemUDDValueById = deleteItemUDDValueById;
        API.DeleteUDDValuesByValue = deleteItemUDDValuesByValue;
        API.UpdateCollectionLevelUDDValues = updateCollectionLevelUDDValues;
        API.GetCollectionLevelUddValuesForItemType = getCollectionLevelUddValuesForItemType;

        let apiEndpoint = '/api/item/uddbridge';

        return {
            API
        };


        function getItemUDDValues() {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint)
                .then((response) => {
                    return response.data;
                });
        };

        function getUddValueOptionChoices(entry_id) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/optionchoices/' + entry_id)
                .then((response) => {
                    return response.data;
                });
        };

        function insertItemUDDValue(uddValueDetails) {
            return $http.post(application_configuration.itemAndRetailService.url + apiEndpoint, uddValueDetails);
        };

        function searchItemUDDValue(search_field, search_value) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/search/' + search_field + '-' + search_value);
        };

        function multiSearchItemUDDValue(params) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/multisearch/', { params: params })
                .then((response) => {
                    return response.data;
                });
        };

        function updateItemUDDValue(uddValueDetails) {
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + uddValueDetails.id, uddValueDetails);
        };

        function updateCollectionLevelUDDValues(uddValueDetails) {
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + '/update/udd/values', uddValueDetails);
        };

        function deleteItemUDDValueById(id) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + id);
        };

        function deleteItemUDDValuesByValue(valueId, format) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/remove/value/' + valueId + "?format=" + format);
        };

        function getCollectionLevelUddValuesForItemType(query) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/collection/udd/values', { params: query });
        }
    };
})();
