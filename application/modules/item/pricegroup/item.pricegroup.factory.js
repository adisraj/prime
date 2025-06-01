(function() {
  "use strict";
  angular
    .module("rc.prime.item.pricegroup")
    .factory("ItemPriceGroupService", ItemPriceGroupService);
  ItemPriceGroupService.$inject = ["$http", "application_configuration"];

  function ItemPriceGroupService($http, application_configuration) {
    let API = {};
    let object = {};
    let selectedItemType = {};

    API.DeleteItemPriceGroup = deleteItemPriceGroup;
    API.GetItemPriceGroup = getItemPriceGroup;
    API.GetItemPriceGroupById = getItemPriceGroupById;
    API.GetPricingClassificationsByItemTypeAndPricingClass = getPricingClassificationsByItemTypeAndPricingClass;
    API.GetSelectedItemType = getSelectedItemType;
    API.GetVariable = getVariable;
    API.GetSelectedItemPriceGroupIds = getSelectedItemPriceGroupIds;
    API.SetSelectedItemPriceGroupIds = setSelectedItemPriceGroupIds;
    API.InsertItemPriceGroup = insertItemPriceGroup;
    API.MultiSearchItemPriceGroup = multiSearchItemPriceGroup;
    API.SearchItemPriceGroup = searchItemPriceGroup;
    API.StoreVariable = storeVariable;
    API.StoreSelectedItemType = storeSelectedItemType;
    API.UpdateItemPriceGroup = updateItemPriceGroup;

    return {
      API
    };

    function deleteItemPriceGroup(itemPriceGroupDetails) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
          "/api/item/pricegroup/" +
          itemPriceGroupDetails.id,
        itemPriceGroupDetails
      );
    }

    function getItemPriceGroup() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            "/api/item/pricegroup/"
        )
        .then(response => {
          return response.data;
        });
    }

    function getItemPriceGroupById(id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            "/api/item/pricegroup/" +
            id
        )
        .then(response => {
          return response.data.data;
        });
    }

    function getSelectedItemPriceGroupIds(typeIds) {
      return selectedItemPriceGroupIds;
    }

    function getSelectedItemType() {
      return selectedItemType;
    }

    function getVariable(key) {
      return object[key];
    }

    function insertItemPriceGroup(itemPriceGroupDetails) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
          "/api/item/pricegroup/",
        itemPriceGroupDetails
      );
    }

    function multiSearchItemPriceGroup(params) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            "/api/item/pricegroup/multisearch",
          {
            params: params
          }
        )
        .then(response => {
          return response.data;
        });
    }

    function getPricingClassificationsByItemTypeAndPricingClass(
      itemTypeId,
      pricingClassId
    ) {
      return $http.get(
        application_configuration.itemAndRetailService.url +
          "/api/item/type/" +
          itemTypeId +
          "/pricingclass/" +
          pricingClassId +
          "/pricegroups"
      );
    }

    function searchItemPriceGroup(search_field, search_value) {
      return $http.get(
        application_configuration.itemAndRetailService.url +
          "/api/item/pricegroup/search/" +
          search_field +
          "-" +
          search_value
      );
    }

    function setSelectedItemPriceGroupIds(typeIds) {
      selectedItemPriceGroupIds = typeIds;
    }

    function storeVariable(key, value) {
      object[key] = value;
    }

    function storeSelectedItemType(data) {
      selectedItemType = data;
    }

    function updateItemPriceGroup(itemPriceGroupDetails) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          "/api/item/pricegroup/" +
          itemPriceGroupDetails.id,
        itemPriceGroupDetails
      );
    }
  }
})();
