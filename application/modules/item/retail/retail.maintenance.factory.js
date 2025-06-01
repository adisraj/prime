(function() {
  "use strict";
  angular.module("rc.prime.item").factory("RetailService", RetailService);
  RetailService.$inject = ["$http", "application_configuration"];

  function RetailService($http, application_configuration) {
    let API = {};
    let apiEndpoint = "/api/retail";
    let object = {};

    API.GetVariable = getVariable;

    API.GetSKURetailMap = getSKURetailMap;
    API.GetSKUMTORetailMap = getSKUMTORetailMap;

    API.GetMTORetailByOptionHeaders = getMTORetailByOptionHeaders;
    API.GetRetailPriceTypes = getRetailPriceTypes;
    API.GetRetailReasons = getRetailReasons;
    API.ValidateRetails = validateRetails;

    API.FetchRetailRuleGroups = fetchRetailRuleGroups;
    API.FetchRetailRulesByGroup = fetchRetailRulesByGroup;

    API.StoreVariable = storeVariable;
    API.UpdateSKURetail = updateSKURetail;
    API.UpdateMTOSKURetail = updateMTOSKURetail;

    API.DeleteOptionsRetailsByOptionTypeId = deleteOptionsRetailsByOptionTypeId;

    return {
      API
    };

    function getSKURetailMap(skuIds) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/sku?skuIds=" +
            skuIds
        )
        .then(function(response) {
          return response.data;
        });
    }

    function getSKUMTORetailMap(skuIds, item_type_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/mtoskus?skuIds=" +
            skuIds +
            "&item_type_id=" +
            item_type_id
        )
        .then(function(response) {
          return response.data;
        });
    }

    function getMTORetailByOptionHeaders(item_id, referredIds, isOptionHeader) {
      let tempStr = "";
      if (isOptionHeader) {
        tempStr = "/optionheader/";
      } else {
        tempStr = "/sku/";
      }
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/mtosku/addonprice/" +
            item_id +
            tempStr +
            referredIds
        )
        .then(function(response) {
          return response.data;
        });
    }

    function getRetailPriceTypes() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/pricetype"
        )
        .then(function(response) {
          return response.data;
        });
    }

    function getRetailReasons() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/reasons"
        )
        .then(function(response) {
          return response.data;
        });
    }

    function fetchRetailRuleGroups() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/rule/groups"
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchRetailRulesByGroup(groupId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/rule/applyretail/" +
            groupId
        )
        .then(response => {
          return response.data;
        });
    }

    function validateRetails(payload) {
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/validate",
          payload
        )
        .then(function(response) {
          return response.data;
        });
    }

    function getVariable(key) {
      return object[key];
    }

    function storeVariable(key, value) {
      object[key] = value;
    }

    function updateSKURetail(retailDetails) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/upsert/",
        retailDetails
      );
    }

    function updateMTOSKURetail(retailDetails) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/mtosku/upsert/",
        retailDetails
      );
    }

    function deleteOptionsRetailsByOptionTypeId(optionTypeId) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/mtosku/optiontype/" +
          optionTypeId
      );
    }
  }
})();
