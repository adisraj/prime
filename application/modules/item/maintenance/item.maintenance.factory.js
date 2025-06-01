(function () {
  "use strict";
  angular.module("rc.prime.item").factory("ItemService", ItemService);
  ItemService.$inject = ["$http", "application_configuration"];

  function ItemService($http, application_configuration) {
    let API = {};
    let apiEndpoint = "/api/item";
    let object = {};

    API.GetVariable = getVariable;
    API.GetItems = getItems;
    API.GetItemsCount = getItemsCount;
    API.GetItemById = getItemById;
    API.UpdateallSOA = updateallSOA;
    API.DeleteallSOA = deleteallSOA
    API.GetVendorsForAnItem = getVendorsForAnItem;
    API.UpdateItemVendor = updateItemVendor;
    API.GroupByFieldAndValues = groupByFieldAndValues;
    API.GroupByColumnName = groupByColumnName;
    API.GetListOfValues = getListOfValues;
    API.InsertItem = insertItem;
    API.LinkVendorToItem = linkVendorToItem;
    API.UpdateVendorItemPriority = updateVendorItemPriority;
    API.UnlinkVendorFromItem = unlinkVendorFromItem;
    API.StoreVariable = storeVariable;
    API.SearchItems = searchItems;
    API.UpdateItem = updateItem;
    API.DeleteItem = deleteItem;
    API.FetchFilteredItems = fetchFilteredItems;
    API.SearchItemsBySubType = searchItemsBySubType;
    API.GetItemVendorCollectionAndBuyerById = getItemVendorCollectionAndBuyerById;

    API.DeleteBridgeValuesByMapId = deleteBridgeValuesByMapId;
    API.DeleteBridgeValuesByMapIds = deleteBridgeValuesByMapIds;
    API.DeletePricingFactorForAnEntity = deletePricingFactorForAnEntity;
    API.FetchPricingFactorForAnEntityAndInstance = fetchPricingFactorForAnEntityAndInstance;
    API.UpsertPricingFactorForAnEntity = upsertPricingFactorForAnEntity;

    API.FetchFirstSkuByItem = fetchFirstSkuByItem;
    API.DeleteItemUddBridge = deleteItemUddBridge;

    API.FetchErroredList = fetchErroredList;

    API.FetchItemGraph = fetchItemGraph;

    API.DuplicateItemCheck = duplicateItemCheck;

    API.UpdateItemSkusFieldByItemId = updateItemSkusFieldByItemId;

    API.UpdateItemStatusBasedOnAssociatedSUKsStatus = updateItemStatusBasedOnAssociatedSUKsStatus;

    API.CaptureItemChangeInQueue = captureItemChangeInQueue;
    API.CaptureSKUChangesInVendorProperties = captureSKUChangesInVendorProperties;
    API.CaptureSKUChangesInVendorUDD = captureSKUChangesInVendorUDD;

    API.DeleteItemSetDependency = deleteItemSetDependency;

    return {
      API
    };

    function fetchItemGraph(columns, condition_field, condition_value) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/item/graph",
          {
            params: {
              column: columns,
              condition_field: condition_field,
              condition_value: condition_value
            }
          }
        )
        .then(response => {
          return response.data;
        });
    }

    function duplicateItemCheck(itemType, description, vendor) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/item/duplicate",
          {
            params: {
              item_type: itemType,
              item_description: description,
              vendor_id: vendor
            }
          }
        )
        .then(response => {
          return response.data;
        });
    }

    function getItems(paginationObject, filterData, sortObject, groupObject) {
      return $http({
        url: application_configuration.itemAndRetailService.url + apiEndpoint,
        method: "GET",
        // Sending objects through query string
        params: {
          pagination: paginationObject,
          filters: filterData,
          sort: sortObject,
          group: groupObject
        }
      }).then(function (response) {
        //calculating time taken to fetch records
        let time =
          response.config.responseTimestamp - response.config.requestTimestamp;
        response.time_taken = time / 1000;
        return response;
      });
    }

    function getItemsCount() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/count"
        )
        .then(function (response) {
          return response.data.total_records;
        });
    }

    function getItemById(itemId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/" +
          itemId
        )
        .then(function (response) {
          return response.data.data;
        });
    }

    function updateallSOA(obj) {
      return $http.put(
        application_configuration.itemAndRetailService.url + "/api/sku/orderadvisor/" + obj.old_sku_id,
        obj
      );

    }
    function deleteallSOA(obj) {
      return $http.delete(
        application_configuration.itemAndRetailService.url + "/api/sku/orderadvisor/" + obj.old_sku_id, obj
      );

    }

    function getItemVendorCollectionAndBuyerById(itemId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/" +
          itemId +
          "/vendor/collection/buyer"
        )
        .then(function (response) {
          return response.data;
        });
    }

    function groupByFieldAndValues(object, page, limit) {
      return $http
        .post(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
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

    //Function to capture the changes made to item in message queue to sync with AS400 data
    function captureItemChangeInQueue(uuid, itemId) {
      //Prepare object to sent as body in the post request
      let bodyObject = {
        uuid: uuid,
        id: itemId
      };
      //Make a post request to the desired URL and return the response received
      return $http
        .post(`${application_configuration.itemAndRetailService.url}/api/as400/sync/interface`, bodyObject)
        .then(response => {
          return response;
        });
    }

    // Function to capture the changes made to vendor property for sku interface
    function captureSKUChangesInVendorProperties(vendorId, rms_vendor_number) {
      // Make a post request to the desired URL and return the response received
      return $http
        .put(`${application_configuration.itemAndRetailService.url}/api/item/capture/interface/changes/vendor/properties/${vendorId}/${rms_vendor_number}`)
        .then(response => response);
    }

    // Function to capture the changes made to vendor property for sku interface
    function captureSKUChangesInVendorUDD(vendorId) {
      // Make a post request to the desired URL and return the response received
      return $http
        .put(`${application_configuration.itemAndRetailService.url}/api/item/capture/interface/changes/vendor/udd/${vendorId}`)
        .then(response => response);
    }

    function getVariable(key) {
      return object[key];
    }

    function insertItem(itemDetails) {
      return $http.post(
        application_configuration.itemAndRetailService.url + apiEndpoint,
        itemDetails
      );
    }

    function linkVendorToItem(itemVendorDetails) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        itemVendorDetails.item_id +
        "/vendor/" +
        itemVendorDetails.vendor_id,
        itemVendorDetails
      );
    }

    function unlinkVendorFromItem(itemVendor) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        itemVendor.item_id +
        "/vendor/" +
        itemVendor.vendor_id +
        "?priority=" +
        itemVendor.priority,
        itemVendor
      );
    }

    function updateVendorItemPriority(itemVendor, action) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        itemVendor.item_id +
        "/vendor/" +
        itemVendor.vendor_id +
        "/action/" +
        action,
        itemVendor
      );
    }

    function getVendorsForAnItem(itemId) {
      return $http.get(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        itemId +
        "/vendors"
      );
    }

    function updateItemVendor(itemVendor) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        itemVendor.item_id +
        "/vendor/" +
        itemVendor.vendor_id,
        itemVendor
      );
    }

    function updateItemSkusFieldByItemId(details) {
      return $http.put(
        application_configuration.itemAndRetailService.url + "/api/sku/item/" + details.item_id + "/multipleskus",
        details
      );
    }

    function updateItemStatusBasedOnAssociatedSUKsStatus(id) {
      return $http.put(
        application_configuration.itemAndRetailService.url + "/api/item/" + id + "/statusbyskus", {}
      );
    }

    function storeVariable(key, value) {
      object[key] = value;
    }

    function searchItems(search_field, search_value) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/search/" +
          search_field +
          "-" +
          search_value
        )
        .then(function (response) {
          return response.data;
        });
    }

    function searchItemsBySubType(subType, itemTypeId, vendorId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/subtype/" +
          subType +
          "?item_type_id=" +
          itemTypeId +
          "&vendor_id=" +
          vendorId
        )
        .then(response => {
          return response.data;
        });
    }

    function updateItem(itemDetails) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        itemDetails.id,
        itemDetails
      );
    }

    function deleteItem(itemDetails) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/" +
        itemDetails.id,
        itemDetails
      );
    }

    function deleteItemSetDependency(itemDetails) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        apiEndpoint +
        "/setDependency/" +
        itemDetails.id,
        itemDetails
      );
    }

    function groupByColumnName(field) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/groupby/" +
          field
        )
        .then(function (response) {
          return response.data;
        });
    }

    function getListOfValues(field, values, page, limit) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          apiEndpoint +
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

    function fetchFilteredItems(filterData, page, limit) {
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

    function addPricingFactorForAnEntity(pricingFactor) {
      return $http.post(
        application_configuration.itemAndRetailService.url +
        "/api/pricing/factor?type=" +
        pricingFactor.type +
        "&link_id=" +
        pricingFactor.link_id,
        { factor: pricingFactor.factor }
      );
    }

    function upsertPricingFactorForAnEntity(pricingFactor) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        "/api/pricing/factor/type/" +
        pricingFactor.type +
        "/link/" +
        pricingFactor.link_id,
        { factor: pricingFactor.factor }
      );
    }

    function deletePricingFactorForAnEntity(type, linkId) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        "/api/pricing/factor/type/" +
        type +
        "/link/" +
        linkId
      );
    }

    function deleteBridgeValuesByMapId(id, entry_type) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        "/api/item/uddbridge/remove/map/" +
        id +
        "?entry_type=" +
        entry_type
      );
    }

    function deleteBridgeValuesByMapIds(query) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        "/api/item/uddbridge/remove/maps", { params: query }
      );
    }

    function fetchPricingFactorForAnEntityAndInstance(type, linkId) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/pricing/factor/type/" +
          type +
          "/link/" +
          linkId
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchFirstSkuByItem(itemId) {
      return $http({
        url:
          application_configuration.itemAndRetailService.url +
          "/api/sku/item/" +
          itemId,
        method: "GET",
        // Sending objects through query string for the first SKU
        params: {
          sort: { field: "id", order: "asc" }
        }
      }).then(response => {
        return response.data;
      });
    }

    function fetchErroredList(uuid, limit, page) {
      return $http({
        url:
          application_configuration.itemAndRetailService.url +
          "/api/item/sku/error/details/" +
          uuid,
        method: "GET",
        params: {
          limit: limit,
          page: page
        }
      }).then(response => {
        return response;
      });
    }

    function deleteItemUddBridge(id) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        "/api/item/uddbridge/remove/item/" +
        id
      );
    }
  }
})();
