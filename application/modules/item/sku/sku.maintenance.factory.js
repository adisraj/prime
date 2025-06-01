(function () {
  "use strict";
  angular.module("rc.prime.sku").factory("SKUService", SKUService);
  SKUService.$inject = ["$http", "application_configuration"];

  function SKUService($http, application_configuration) {
    let API = {};
    let object = {};

    API.GetVariable = getVariable;
    API.GetSKUs = getSKUs;
    API.GetSKU = getSKU;
    API.GetSKUIds = getSKUIds;
    API.GetSKUCountByItem = getSKUCountByItem;
    API.GetSKUByItem = getSKUByItem;
    API.CheckSKUExists = checkSKUExists;
    API.GetallskusUPC = getallskusupc;
    API.GetSKUIdAndDescriptionByItem = getSKUIdAndDescriptionByItem;
    API.GetSkuAvailability = getSkuAvailability;
    API.GetLocationSet = getLocationSet;
    API.GetSKULocations = getSKULocations;
    API.GetSkuAvailabilityForLocation = getSkuAvailabilityForLocation;
    API.GetSkuAvailabilityForLocationodbc = getSkuAvailabilityForLocationodbc;
    API.GetVendorPOForLocationodbc = getVendorPOForLocationodbc;
    API.GroupByColumnName = groupByColumnName;
    API.GetListOfValues = getListOfValues;
    API.GroupByFieldAndValues = groupByFieldAndValues;
    API.GetvendorDetails = getvendorDetails;
    API.GetSKUInventory = getSKUInventory;
    // API.GetSkuInventoryBySku = getSkuInventoryBySku;
    API.GetUpcBySku = getUpcBySku;
    API.InsertSKUInventory = insertSKUInventory;
    API.UpdateSKUInventory = updateSKUInventory;
    API.UpdateSKUInventoryAvailability = updateSKUInventoryAvailability;
    API.RemoveSKUInventory = removeSKUInventory;
    API.GetInventories = getInventories;
    API.GetInventoriesForSKU = getInventoriesForSKU;
    API.FetchSkuSetAndItsComponentAvailability = fetchSkuSetAndItsComponentAvailability;
    API.FetchSkuSetAndItsAvailability = fetchSkuSetAndItsAvailability
    API.GetSKUById = getSKUById;
    API.GetHuntPathTypes = getHuntPathTypes;
    API.GetRuleTypes = getRuleTypes;
    API.InsertSKU = insertSKU;
    API.SearchSKU = searchSKU;
    API.GetSKUIDs=getSKUIDs;
    API.UpdateSKU = updateSKU;
    API.GetHuntPathTypeBySku = getHuntPathTypeBySku;
    API.UpdateSKUHuntPathType = updateSKUHuntPathType;
    API.RemoveHuntPathFromSKU = removeHuntPathFromSKU;
    API.DeleteSKU = deleteSKU;
    API.UpsertUpc = upsertUpc;
    API.GetUpcConfiguration = getUpcConfiguration;
    API.PromoteTag = promoteTag;
    API.LoadTag = loadTag;
    API.RemoveTag = removeTag;
    API.FetchFilteredSKUs = fetchFilteredSKUs;
    API.FetchSkusByItemIdsAndSubType = fetchSkusByItemIdsAnSubType;
    API.FetchParentSetsForComponent = fetchParentSetsForComponent;
    API.GetMultipleDescription = getMultipleDescription;
    API.InsertMultipleDescription = insertMultipleDescription;
    API.UpdateMultipleDescription = updateMultipleDescription;
    API.DeleteMultipleDescription = deleteMultipleDescription;
    API.GetLinkedVendorList = getLinkedVendorList;
    API.GetLinkedVendorBySkuAndVendorId = getLinkedVendorBySkuAndVendorId;
    API.UpdateLinkedVendor = updateLinkedVendor;
    API.DeleteLinkedVendor = deleteLinkedVendor;
    API.LinkNewVendor = linkNewVendor;

    API.GetAssortmentLabels = getAssortmentLabels;
    API.GetAssortmentValuesForSku = getAssortmentValuesForSku;
    API.AddAssortmentValueForSku = addAssortmentValueForSku;
    API.GetAssortmentStatusForSku = getAssortmentStatusForSku;
    API.CreateTopic = createTopic;
    API.RemoveAssortmentValueForSku = removeAssortmentValueForSku;

    API.GetInventoryQualityList = getInventoryQualityList;
    API.GetInventoryTypes = getInventoryTypes;
    API.UpsertInventoryAvailability = upsertInventoryAvailability;

    API.GetSkuFormat = getSkuFormat;
    API.IsShowSkuAvailability = isShowSkuAvailability;
    API.FetchAvailabilityForSku = fetchAvailabilityForSku;
    API.StoreVariable = storeVariable;
    API.GetVariable = getVariable;
    API.GetSkusByFilter = getSkusByFilter;

    API.GetOrderAdvisorHeaders = getOrderAdvisorHeaders;
    API.CreateOrderAdvisorHeaders = createOrderAdvisorHeaders;
    API.FetchOrderAdvisorsForSku = fetchOrderAdvisorsForSku;
    API.FetchOrderAdvisorForSkuData=fetchOrderAdvisorForSkuData
    API.CreateOrderAdvisorForSku = createOrderAdvisorForSku;
    API.InsertSOAtoType = insertSOAtoType;
    API.UpdateOrderAdvisorSku = updateOrderAdvisorSku;
    API.UpdateDiscountOrderAdvisorSku = updateDiscountOrderAdvisorSku;
    API.DeleteaddedDiscountsSOA = deleteaddedDiscountsSOA;
    API.DeleteaddedDiscountsUDD = deleteaddedDiscountsUDD;
    API.FetchValueForOrderAdvisorAndUDD = fetchValueForOrderAdvisorAndUDD;
    API.FeatchAllOptionsChoices=featchAllOptionsChoices
    API.UpdateOrderAdvisorPE = updateOrderAdvisorPE
    API.UpdateOrderAdvisorPackageDefault=updateOrderAdvisorPackageDefault
    API.UnselectOrderAdvisorPackageDefault=unselectOrderAdvisorPackageDefault
    API.DeleteOrderAdvisorForSku = deleteOrderAdvisorForSku;
    API.BulkUpdateSkuPackageIds = bulkUpdateSkuPackageIds;
    API.FindSkuWithPackageIdandOrderAdvisorTypeId= findSkuWithPackageIdandOrderAdvisorTypeId;
    API.DeleteOrderAdvisorPackageRetail=deleteOrderAdvisorPackageRetail;
    API.DeleteRetailsOrderAdvisorForSku=deleteRetailsOrderAdvisorForSku;
    API.FetchSkuOrderAdvisorTypeIdAndUddId=fetchSkuOrderAdvisorTypeIdAndUddId
    API.GetSkusByIds = getSkusByIds;
    API.ExportSKUData = exportSKUData;
    API.GetSKUCountToBeExported = getSKUCountToBeExported;

    let apiEndpoint = "/api/sku";

    return {
      API
    };

    function storeVariable(key, value) {
      object[key] = value;
    }

    function getVariable(key) {
      return object[key];
    }

    function getSKUs() {
      return $http
        .get(application_configuration.itemAndRetailService.url + apiEndpoint
          + "/getallskus")
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getSKU(id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/" +
          id
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function checkSKUExists(sku) {
      return $http
        .get(application_configuration.itemAndRetailService.url + apiEndpoint +
          "/checksku?sku=" +
          sku
        )
        .then(response => {
          return response.data;
        });
    }

    function getallskusupc() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/explorer/products/getskusupc"
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getSKUByItem(
      item_id,
      paginationObject,
      filterData,
      sortObject,
      groupObject,
      isDeletedObject
    ) {
      return $http({
        url:
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/item/" +
          item_id,
        method: "GET",
        // Sending objects through query string
        params: {
          pagination: paginationObject,
          filters: filterData,
          sort: sortObject,
          group: groupObject,
          is_deleted: isDeletedObject
        }
      })
        .then(response => {
          //calculating time taken to fetch records
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.time_taken = time / 1000;
          return response;
        })
        .catch(error => {
          return error;
        });
    }

    function getSkusByFilter(description, limit, page) {
      return $http({
        url: application_configuration.itemAndRetailService.url + apiEndpoint,
        method: "GET",
        // Sending objects through query string
        params: {
          page: page,
          limit: limit,
          description: description
        }
      })
        .then(function (response) {
          //calculating time taken to fetch records
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.time_taken = time / 1000;
          return response;
        })
        .catch(error => {
          return error;
        });
    }

    function getSKUCountByItem(item_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/count/item/" +
          item_id
        )
        .then(response => {
          return response.data[0].total_records;
        })
        .catch(error => {
          return error;
        });
    }

    function getSKUIds() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/ids"
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getSkuAvailability(sku_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/item/availability/sku/" +
          sku_id
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    //Get Multiple Description
    function getMultipleDescription(sku_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          sku_id +
          "/description"
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    //Insert Multiple Description
    function insertMultipleDescription(description) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
        "/api/sku/" +
        description.sku_id +
        "/description",
        description
      );
    }

    //Update Multiple Description
    function updateMultipleDescription(description) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        "/api/sku/" +
        description.sku_id +
        "/description",
        description
      );
    }

    //Delete Multiple Description
    function deleteMultipleDescription(description) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        "/api/sku/" +
        description.sku_id +
        "/description",
        description
      );
    }

    function getLinkedVendorList(sku_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          sku_id +
          "/vendors"
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getLinkedVendorBySkuAndVendorId(skuId, vendorId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          skuId +
          "/vendor/" +
          vendorId
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function updateLinkedVendor(vendor) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        "/api/sku/" +
        vendor.sku_id +
        "/vendor/" +
        vendor.vendor_id,
        vendor
      );
    }

    function deleteLinkedVendor(vendor) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        "/api/sku/" +
        vendor.sku_id +
        "/vendor/" +
        vendor.vendor_id,
        vendor
      );
    }

    function linkNewVendor(vendor) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
        "/api/sku/" +
        vendor.sku_id +
        "/vendor/" +
        vendor.vendor_id,
        vendor
      );
    }

    function getLocationSet(columns) {
      return $http
        .get(
          application_configuration.locationService.url + "/api/location/graph",
          {
            params: {
              column: columns
            }
          }
        )
        .then(function (response) {
          return response.data;
        });
    }

    function getSKULocations(location_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/skuavailabilitylocation/" +
          location_id
        )
        .then(response => {
          return response.data;
        });
    }

    function getSkuAvailabilityForLocation(location_id, sku_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/item/availability/sku?sku_id=" +
          sku_id +
          "&location_id=" +
          location_id
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getSkuAvailabilityForLocationodbc(sku_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/as400/odbc/getSkuavail/" +
          sku_id
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getVendorPOForLocationodbc(sku_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/as400/odbc/getvendorPo/" +
          sku_id
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getVariable(key) {
      return object[key];
    }

    function insertSKU(skuDetails) {
      return $http.post(
        application_configuration.itemAndRetailService.url + apiEndpoint,
        skuDetails
      );
    }

    function getUpcBySku(skuid) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/" +
          skuid +
          "/upc"
        )
        .then(response => {
          return response.data.data;
        });
    }

    function upsertUpc(skuid, upc_payload) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        skuid +
        "/upc",
        upc_payload
      );
    }

    function getUpcConfiguration() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/upc/configuration"
        )
        .then(response => {
          return response.data;
        });
    }

    /* function insertSKUInventory(sku_inventory) {
            return $http.post(application_configuration.itemAndRetailService.url + apiEndpoint + '/inventory/method', sku_inventory);
        }; */

    function insertSKUInventory(sku_id, sku_inventory) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        sku_id +
        "/inventory/availabiltity",
        sku_inventory
      );
    }

    /* function getSkuInventoryBySku(sku_id) {
            return $http.get(application_configuration.itemAndRetailService.url + apiEndpoint + '/inventory/method/sku/' + sku_id)
                .then(response => {
                    return response.data;
                });
        }; */

    /* function updateSKUInventory(sku_inventory) {
            return $http.put(application_configuration.itemAndRetailService.url + apiEndpoint + '/inventory/method/sku/' + sku_inventory.sku_id, sku_inventory);
        }; */

    function updateSKUInventory(sku_id, sku_inventory) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        sku_id +
        "/inventory/availability",
        sku_inventory
      );
    }

    function updateSKUInventoryAvailability(object) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/inventoryavailbility/" +
        object.id + "/",
        object
      );
    }

    function removeSKUInventory(sku_id) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        sku_id +
        "/inventory/availability"
      );
    }

    function updateSKUHuntPathType(hunt_path_type) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/huntpath/type/sku/" +
        hunt_path_type.sku_id,
        hunt_path_type
      );
    }

    function removeHuntPathFromSKU(skuId) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/huntpath/type/sku/" +
        skuId
      );
    }

    function getInventories() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/inventory/methods"
        )
        .then(response => {
          return response.data;
        });
    }

    function getInventoriesForSKU(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/" +
          skuId +
          "/inventory/availability"
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchSkuSetAndItsComponentAvailability(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/set/" +
          skuId +
          "/components/availability"
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchSkuSetAndItsAvailability(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/set/" +
          skuId +
          "/components/sku"
        )
        .then(response => {
          return response.data;
        });
    }

    function getSKUById(id) {

      return $http
        .get(application_configuration.itemAndRetailService.url + "/api/sku/" + id)
        .then(response => {
          return response.data;
        });
    }

    function fetchParentSetsForComponent(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/component/" +
          skuId +
          "/parents"
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchAvailabilityForSku(skuId, locationId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/" +
          skuId +
          "/location/" +
          locationId +
          "/availability/status"
        )
        .then(response => {
          return response.data;
        });
    }

    function getRuleTypes() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/availability/rules"
        )
        .then(response => {
          return response.data;
        });
    }

    function getHuntPathTypes() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/huntpath/type"
        )
        .then(response => {
          return response.data;
        });
    }

    function getHuntPathTypeBySku(sku_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/huntpath/type/sku/" +
          sku_id
        )
        .then(response => {
          return response.data;
        });
    }

    function searchSKU(search_field, search_value, is_deleted) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/search/" +
          search_field +
          "-" +
          search_value + "?is_deleted=" + is_deleted
        )
        .then(response => {
          return response.data;
        });
    }
    function getSKUIDs(payload) {;
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          `/search/getSKUIds`,
          payload
        )
        .then(response => {
          return response.data;
        });
    }
    function storeVariable(key, value) {
      object[key] = value;
    }
    function updateSKU(skuDetails) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        "/api/sku/" +
        skuDetails.id,
        skuDetails
      );
    }

    function deleteSKU(skuDetails) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        "/api/sku/" +
        skuDetails.id,
        skuDetails
      );
    }

    function groupByColumnName(itemId, field) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/itemId/" +
          itemId +
          "/groupby/" +
          field
        )
        .then(function (response) {
          return response.data;
        });
    }

    function getListOfValues(itemId, field, values, page, limit) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/itemId/" +
          itemId +
          "/lov/" +
          field +
          "-" +
          values +
          "?page=" +
          page +
          "&limit=" +
          limit
        )
        .then(function (response) {
          return response.data;
        });
    }

    function getvendorDetails(id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url + "/api/item/skuId/" + id
        )
        .then(response => {
          return response.data;
        });
    }

    function getSKUInventory(skuId) {
      return $http.get(
        application_configuration.itemAndRetailService.url + "/api/sku/" + skuId + "/inventory/setavailability"
      );
    }

    function groupByFieldAndValues(itemId, object, page, limit) {
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/itemId/" +
          itemId +
          "/group?page=" +
          page +
          "&limit=" +
          limit,
          object
        )
        .then(function (response) {
          return response.data;
        });
    }

    function promoteTag(uuid, instance_id, tag_properties) {
      return $http
        .post(
          application_configuration.tagService.url +
          "/api/tags/" +
          uuid +
          "/" +
          instance_id,
          tag_properties
        )
        .then(response => {
          return response;
        });
    }

    function loadTag(uuid, instance_id) {
      return $http
        .get(
          application_configuration.tagService.url +
          "/api/tags/" +
          uuid +
          "/" +
          instance_id
        )
        .then(response => {
          return response;
        });
    }

    function removeTag(uuid, instance_id, tagId, confidence) {
      return $http.delete(
        application_configuration.tagService.url +
        "/api/tags/" +
        uuid +
        "/" +
        instance_id +
        "/unlink/" +
        tagId +
        "/" +
        confidence
      );
    }

    function fetchFilteredSKUs(filterData, page, limit) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/filter?page=" +
        page +
        "&limit=" +
        limit,
        filterData
      );
    }

    function fetchSkusByItemIdsAnSubType(itemIds, sku_sub_type, getAll) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url + "/api/sku/items",
          {
            params: {
              itemIds: itemIds,
              sku_sub_type: sku_sub_type,
              getAll: getAll ? getAll: null
            }
          }
        )
        .then(response => {
          return response;
        });
    }

    function getSKUIdAndDescriptionByItem(item_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/item/" +
          item_id +
          "/sku"
        )
        .then(response => {
          return response.data;
        });
    }

    function getAssortmentLabels() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/assortment/labels"
        )
        .then(response => {
          return response.data;
        });
    }

    function getAssortmentValuesForSku(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          skuId +
          "/assortment/values"
        )
        .then(response => {
          return response.data;
        });
    }

    function addAssortmentValueForSku(assortmentValue) {
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          assortmentValue.id +
          "/assortment",
          assortmentValue
        )
        .then(response => {
          return response.data;
        });
    }

    function getAssortmentStatusForSku(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          skuId +
          "/assortment/status"
        )
        .then(response => {
          return response.data;
        });
    }

    function createTopic(queue_name, data, id) {
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
          "/api/message/queue/topic",
          { queue_name, data, id }
        )
        .then(response => {
          return response.data;
        });
    }

    function removeAssortmentValueForSku(assortmentValue) {
      return $http
        .delete(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          assortmentValue.id +
          "/assortment/label/" +
          assortmentValue.label_id +
          "/value"
        )
        .then(response => {
          return response.data;
        });
    }

    function getSkuFormat() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/default/format"
        )
        .then(response => {
          return response.data[0];
        });
    }

    function isShowSkuAvailability(feature_code) {
      return $http
        .get(
          application_configuration.apiServer +
          "/api/feature/user/access/feature/" +
          feature_code
        )
        .then(response => {
          return response.data;
        });
    }

    function getInventoryQualityList() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/item/inventory/quality"
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getInventoryTypes() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/item/inventory/type"
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function upsertInventoryAvailability(availability) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
        "/api/item/inventory/availability/",
        availability
      );
    }

    function getOrderAdvisorHeaders() {
      return $http
        .get(
          application_configuration.orderadvisorService.url +
          "/api/order-adviser/help-text/headers"
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function createOrderAdvisorHeaders(object) {
      return $http
        .post(
          application_configuration.orderadvisorService.url +
          "/api/order-adviser/help-text/headers",
          object
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchOrderAdvisorsForSku(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          skuId +
          "/orderadvisor"
        )
        .then(response => {
          return response;
        })
        .catch(error => {
          return error;
        });
    }

    function createOrderAdvisorForSku(object) {
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          object.sku_id +
          "/orderadvisor",
          object
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function insertSOAtoType(object) {
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          object.sku_id +
          "/orderadvisor/insertallskus",
          object
        )
        .then(response => {
          return response;
        })
        .catch(error => {
          return error;
        });
    }

    function updateOrderAdvisorPE(object, type_id) {
      return $http
        .put(
          application_configuration.itemAndRetailService.url +
          "/api/sku/typeId/" +
          type_id + "/orderadvisorPE",
          object
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function updateOrderAdvisorPackageDefault(object,type_id){
      return $http
        .put(
          application_configuration.itemAndRetailService.url +
          "/api/sku/typeId/" +
          type_id + "/orderadvisorPackageDefault",
          object
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function unselectOrderAdvisorPackageDefault(typeId,packageId){
      return $http
              .put(application_configuration.itemAndRetailService.url+"/api/sku/type/"+typeId+"/removeOrderadvisorPackageDefault/"+packageId)
              .then(response => {
                //Return response data
                return response;
              });
    }

    function fetchOrderAdvisorForSkuData(skuId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          skuId +
          "/skuOrderadvisor"
        )
        .then(response => {
          return response;
        })
        .catch(error => {
          return error;
        });
    }

    function updateOrderAdvisorSku(object) {
      return $http
        .put(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          object.sku_id +
          "/skuOrderadvisor",
          object
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function updateDiscountOrderAdvisorSku(object) {
      return $http
        .put(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          object.sku_id +
          "/skuOrderadvisor/updatesku",
          object
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function deleteaddedDiscountsUDD(object) {
      return $http
        .delete(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" + object.order_advisor_udd_id +
          "/deleteaddedDiscountsUDD"
        )
        .then(response => {
          return response.data;
        }).catch(error => {
          return error;
        });
    }

    function bulkUpdateSkuPackageIds(type_id,package_id) {
      return $http
        .delete(
          application_configuration.itemAndRetailService.url +
          "/api/sku/typeId/" + type_id +
          "/orderadvisorPE" +
          "/" +
          package_id
        )
        .then(response => {
          return response.data;
        }).catch(error => {
          return error;
        });
    }

    function findSkuWithPackageIdandOrderAdvisorTypeId(typeId,id){
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/order-advisor/type/"+typeId+"/packages/"+id
        )
        .then(response => {
          return response;
        })
        .catch(error => {
          return error;
        });
    }

    function deleteOrderAdvisorPackageRetail(sku_id,order_advisor_id,package_id){
      return $http
        .delete(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          sku_id + "/skuOrderadvisor/"+ order_advisor_id + "/" +"packages/"+package_id
        )
        .then(response => {
          return response.data;
        }).catch(error => {
          return error;
        });
    }

    function deleteaddedDiscountsSOA(object) {
      return $http
        .delete(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          object.sku_id + "/" + object.order_advisor_id + "/" + object.order_advisor_udd_id +
          "/skuOrderadvisor/" + object.baselocationid + "/" + object.created_by + "/" + "getaddedDiscountsSOA"
        )
        .then(response => {
          return response.data;
        }).catch(error => {
          return error;
        });
    }

    function fetchValueForOrderAdvisorAndUDD(orderAdvisorId, uddId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/udd/" +
          orderAdvisorId +
          "/header/" + uddId + "/" + 0
        )
        .then(response => {
          return response;
        })
        .catch(error => {
          return error;
        });
    }

    function deleteRetailsOrderAdvisorForSku(obj){
      return $http
        .delete(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          obj.sku_id + "/skuOrderadvisor/"+ obj.order_advisor_id 
        )
        .then(response => {
          return response.data;
        }).catch(error => {
          return error;
        });
    }

    function fetchSkuOrderAdvisorTypeIdAndUddId(typeId,udd_id){
      return $http
      .get(
        application_configuration.itemAndRetailService.url +
          "/api/sku/order-advisor/type/"+typeId+"/orderAdvisorUddId/"+udd_id
      )
      .then(response => {
        return response;
      })
      .catch(error => {
        return error;
      });

    }

    function featchAllOptionsChoices(orderAdvisorId){
      return $http
      .get(
        application_configuration.itemAndRetailService.url +
        "/api/sku/allOptionsChoices/" +
        orderAdvisorId
      )
      .then(response => {
        return response;
      })
      .catch(error => {
        return error;
      });

    }
    function deleteOrderAdvisorForSku(object) {
      return $http
        .delete(
          application_configuration.itemAndRetailService.url +
          "/api/sku/" +
          object.sku_id +
          "/orderadvisor/" +
          object.order_advisor_id,
          object
        )
        .then(response => {
          return response.data;
        })
        .catch(error => {
          return error;
        });
    }

    function getSkusByIds(ids) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/fetch/ids/" + ids
        )
        .then(response => {
          return response;
        })
        .catch(error => {
          return error;
        });
    }

    function exportSKUData(payload) {
      return $http
        .post(
          `${application_configuration.itemAndRetailService.url}/api/sku/export`, payload)
        .then(response => {
          return response.data;
        });
    }

    function getSKUCountToBeExported(query) {
      return $http.get(`${application_configuration.itemAndRetailService.url}/api/sku/export/count`, { params: query })
        .then(response => {
          return response.data;
        });
    }
  }
})();
