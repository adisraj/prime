(function () {
    'use strict'
    angular.module('rc.prime.item').factory('ItemSetService', ItemSetService);
    ItemSetService.$inject = [
        '$http',
        'application_configuration'
    ];

    function ItemSetService($http, application_configuration) {
        let API = {};
        let object = {};
        let apiEndpoint = '/api/item/set';

        API.GetItemSets = getItemSets;
        API.GetItemSetsByParentItemId = getItemSetsByParentItemId;
        API.GetItemSetsByChildItemId = getItemSetsByChildItemId;
        API.SearchItemSet = searchItemSet;
        API.InsertItemSet = insertItemSet;
        API.UpdateItemSet = updateItemSet;
        API.DeleteItemSet = deleteItemSet;


        return {
            API
        };

        function getItemSets() {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint)
                .then(function (response) {
                    return response.data;
                });
        };

        function getItemSetsByParentItemId(parent_item_id) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/parent/' + parent_item_id)
                .then(function (response) {
                    return response.data;
                });
        };

        function getItemSetsByChildItemId(child_item_id) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/child/' + child_item_id)
                .then(function (response) {
                    return response.data;
                });
        };

        function insertItemSet(itemDetails) {
            return $http.post(application_configuration.itemAndRetailService.url + apiEndpoint, itemDetails);
        };

        function searchItemSet(search_field, search_value) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/search/' + search_field + '-' + search_value)
                .then((response) => {
                    return response.data;
                });
        };

        function updateItemSet(itemDetails) {
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + itemDetails.id, itemDetails);
        };

        function deleteItemSet(itemDetails) {
            return $http.delete(application_configuration.itemAndRetailService.url + apiEndpoint + '/' + itemDetails.id + '/parent/' + itemDetails.parent_item_id, itemDetails);
        };

    }
})();
