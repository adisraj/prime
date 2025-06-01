(function () {
    'use strict'
    angular.module('rc.prime.upcconfigurations')
        .factory('UpcConfigurationService', UpcConfigurationService);
    UpcConfigurationService.$inject = [
        '$http',
        'application_configuration'
    ];

    function UpcConfigurationService($http, application_configuration) {
        let API = {};
        let object = {};
        let selectedItemTypeIds = [];

        API.DeleteItemType = deleteItemType;
        API.GetItemTypes = getItemTypes;
        API.getItemTypesById = getItemTypesById;
        API.GetVariable = getVariable;
        API.GetSelectedItemTypeIds = getSelectedItemTypeIds;
        API.SetSelectedItemTypeIds = setSelectedItemTypeIds;
        API.InsertItemType = insertItemType;
        API.SearchItemType = searchItemType;
        API.StoreVariable = storeVariable;
        API.UpdateItemType = updateItemType;
        API.CloneItemType = cloneItemType;
        API.GetInsightsByTypeId = getInsightsByTypeId;

        return {
            API
        };

        function deleteItemType(itemTypeDetails) {
            return $http.delete(
                application_configuration.itemAndRetailService.url +
                "/api/item/type/" +
                itemTypeDetails.id,
                itemTypeDetails
            );
        }

        function getItemTypes() {
            return $http
                .get(
                    application_configuration.itemAndRetailService.url + "/api/item/type/"
                )
                .then(response => {
                    let time =
                        response.config.responseTimestamp -
                        response.config.requestTimestamp;
                    response.data.time_taken = time / 1000;
                    return response.data;
                });
        }

        function getItemTypesById(id) {
            return $http
                .get(
                    application_configuration.itemAndRetailService.url +
                    "/api/item/type/" +
                    id
                )
                .then(response => {
                    return response.data.data;
                });
        }

        function getSelectedItemTypeIds(typeIds) {
            return selectedItemTypeIds;
        }

        function getVariable(key) {
            return object[key];
        }

        function insertItemType(itemTypeDetails) {
            return $http.post(
                application_configuration.itemAndRetailService.url + "/api/item/type/",
                itemTypeDetails
            );
        }

        function cloneItemType(itemTypeDetails) {
            return $http.post(
                application_configuration.itemAndRetailService.url +
                "/api/item/type/" +
                itemTypeDetails.id +
                "/clone",
                itemTypeDetails
            );
        }

        function searchItemType(search_field, search_value) {
            return $http.get(
                application_configuration.itemAndRetailService.url +
                "/api/item/type/search/" +
                search_field +
                "-" +
                search_value
            );
        }

        function setSelectedItemTypeIds(typeIds) {
            selectedItemTypeIds = typeIds;
        }

        function storeVariable(key, value) {
            object[key] = value;
        }

        function updateItemType(itemTypeDetails) {
            return $http.put(
                application_configuration.itemAndRetailService.url +
                "/api/item/type/" +
                itemTypeDetails.id,
                itemTypeDetails
            );
        }

        function getInsightsByTypeId(typeId) {
            return $http.get(
                application_configuration.itemAndRetailService.url +
                "/api/item/type/insights/" +
                typeId
            );
        }
    }
})();