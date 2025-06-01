(function() {
  "use strict";
  angular
    .module("rc.prime.sku.retail")
    .factory("SkuRetailService", SkuRetailService);
  SkuRetailService.$inject = ["$http", "application_configuration"];

  function SkuRetailService($http, application_configuration) {
    let API = {};
    let apiEndpoint = "/api/retail";
    let object = {};

    API.GetVariable = getVariable;

    API.GetSKURetail = getSKURetail;
    API.GetMtoSKURetail = getMtoSKURetail;
    API.GetMTORetailPriceGroupsAndChoices = getMTORetailPriceGroupsAndChoices;

    API.GetSkuRetailDates = getSkuRetailDates;
    API.GetSkuRetails = getSkuRetails;
    API.GetMTOSkuRetailDates = getMTOSkuRetailDates;

    API.GetRetailPriceTypes = getRetailPriceTypes;
    API.GetRetailReasonTypes = getRetailReasonTypes;
    API.GetRetailReasons = getRetailReasons;
    API.ValidateRetails = validateRetails;
    API.ValidateRetailsByDate = validateRetailsByDate;

    API.FetchRetailRuleGroups = fetchRetailRuleGroups;
    API.FetchRetailRulesByGroup = fetchRetailRulesByGroup;

    API.StoreVariable = storeVariable;
    API.UpdateSKURetail = updateSKURetail;
    API.UpdateMTOSKURetail = updateMTOSKURetail;

    API.DuplicateSKURetail = duplicateSKURetail;
    API.DuplicateMTOSKURetail = duplicateMTOSKURetail;

    API.DeleteSKURetailByDate = deleteSKURetailByDate;
    API.DeleteMtoSKURetailByDate = deleteMtoSKURetailByDate;

    API.SaveBasePackageSKURetail = saveBasePackageSKURetail;
    API.FetchPackages = fetchPackages;
    API.GetSkuPackageRetailDates = getSkuPackageRetailDates;
    API.ValidatePackageRetailsExistance = validatePackageRetailsExistance;
    API.GetBasePackageRetail = getBasePackageRetail;
    API.GetBasePackageRetails = getBasePackageRetails;
    API.UpdateBasePackageSKURetail = updateBasePackageSKURetail;
    API.DeleteBasePackageSKURetail = deleteBasePackageSKURetail;
    API.GetSkuPriceTypesByDate = getSkuPriceTypesByDate;
    API.GetSkuPriceTypesForPackageRetail = getSkuPriceTypesForPackageRetail;
    API.GetMtoSkuPriceTypesByDate = getMtoSkuPriceTypesByDate;
    API.DuplicateSKUPackageRetail = duplicateSKUPackageRetail;

    return {
      API
    };

    function getSKURetail(
      skuId,
      date,
      price_type_id,
      price_class_udd_line_id,
      statusId
    ) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/sku/" +
            skuId,
          {
            params: {
              effective_date: date,
              price_type_id: price_type_id,
              price_class_udd_line_id: price_class_udd_line_id,
              status_id: statusId
            }
          }
        )
        .then(function(response) {
          return response.data;
        });
    }

    function getMtoSKURetail(
      skuId,
      date,
      price_type_id,
      price_class_udd_line_id,
      statusId
    ) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/mtosku/" +
            skuId,
          {
            params: {
              effective_date: date,
              price_type_id: price_type_id,
              price_class_udd_line_id: price_class_udd_line_id,
              status_id: statusId
            }
          }
        )
        .then(function(response) {
          return response.data;
        });
    }

    function getMTORetailPriceGroupsAndChoices(item_id, referredId, isOptionHeader) {
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
            referredId
        )
        .then(function(response) {
          return response.data;
        });
    }

    function getSkuPriceTypesByDate(skuId, date) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/pricetypes/sku/" +
            skuId +
            "/date/" +
            date
        )
        .then(response => {
          return response.data;
        });
    }

    function getMtoSkuPriceTypesByDate(skuId, date) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/pricetypes/mtosku/" +
            skuId +
            "/date/" +
            date
        )
        .then(response => {
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

    function getRetailReasonTypes() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/reason/types"
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

    function getSkuRetailDates(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/sku/dates/" +
            skuId
        )
        .then(response => {
          return response.data;
        });
    }

    function getSkuRetails(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/sku/retails/" +
            skuId
        )
        .then(response => {
          return response.data;
        });
    }

    function getMTOSkuRetailDates(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/mtosku/dates/" +
            skuId
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

    function validateRetailsByDate(payload) {
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/validate/by/date",
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

    function duplicateSKURetail(retailDetails) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/duplicate/",
        retailDetails
      );
    }

    function duplicateMTOSKURetail(retailDetails) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/mtosku/duplicate/",
        retailDetails
      );
    }

    function deleteSKURetailByDate(skuId, date) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/sku/" +
          skuId +
          "/date/" +
          date
      );
    }

    function deleteMtoSKURetailByDate(skuId, date) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/mtosku/" +
          skuId +
          "/date/" +
          date
      );
    }

    function saveBasePackageSKURetail(retailDetails) {
      return $http.post(
        application_configuration.orderadvisorService.url +
          "/api/order-adviser/package/retail",
        retailDetails
      );
    }

    function getSkuPackageRetailDates(skuId) {
      return $http
        .get(
          application_configuration.orderadvisorService.url +
            `/api/order-adviser/package/retail/dates/sku/${skuId}` 
        )
        .then(response => {
          return response.data;
        });
    }

    function getSkuPriceTypesForPackageRetail(skuId, date) {
      return $http
        .get(
          application_configuration.orderadvisorService.url +
            `/api/order-adviser/pricetypes/sku/${skuId}/date/${date}`
        )
        .then(response => {
          return response.data;
        });
    }

    function duplicateSKUPackageRetail(retailDetails) {
      return $http.put(
        application_configuration.orderadvisorService.url +
          "/api/order-adviser/package/retail/duplicate",
        retailDetails
      );
    }
    
    function updateBasePackageSKURetail(retailDetails) {
      return $http.put(
        application_configuration.orderadvisorService.url +
          "/api/order-adviser/package/retail/" +
          retailDetails.retail_id,
        retailDetails
      );
    }

    function deleteBasePackageSKURetail(id) {
      return $http.delete(
        application_configuration.orderadvisorService.url +
          "/api/order-adviser/package/retail/" +
          id,
      );
    }

    function fetchPackages() {
      return $http.get(
        application_configuration.orderadvisorService.url +
          "/api/order-adviser/packages"
      );
    }

    function getBasePackageRetail(sku_id, date) {
      return $http.get(
        application_configuration.itemAndRetailService.url +
          `/api/retail/order-adviser/sku/${sku_id}/retails?effective_date=${date}`
      );
    }

    function getBasePackageRetails(sku_id, date) {
      return $http.get(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
          `/order-adviser/sku/${sku_id}/retails?effective_date=${date}`
      );
    }

    function validatePackageRetailsExistance(payload) {
      return $http.post(
        `${application_configuration.itemAndRetailService.url}/api/retail/package/retails/validate`, payload
      );
    }
  }
})();
