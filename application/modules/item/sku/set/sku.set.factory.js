(function() {
  "use strict";

  angular.module("rc.prime.sku").factory("SKUSetService", SKUSetService);

  SKUSetService.$inject = ["$http", "application_configuration"];

  function SKUSetService($http, application_configuration) {
    let API = {};
    let object = {};
    let apiEndpoint = "/api/sku/set";

    API.FetchSkuSetsByParentSkuId = fetchSkuSetsByParentSkuId;
    API.InsertSKUSet = insertSKUSet;
    API.UpdateSKUSet = updateSKUSet;
    API.DeleteSKUSet = deleteSKUSet;
    API.UpdateSKUparentStatus = updateSKUparentStatus;
    API.CaptureSkuSetChangeInQueue = captureSkuSetChangeInQueue;
    API.UpdateChildsetstatus = updateChildsetstatus;

    return {
      API
    };

    function fetchSkuSetsByParentSkuId(parent_sku_id) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
            apiEndpoint +
            "/parent/" +
            parent_sku_id
        )
        .then(function(response) {
          return response.data;
        });
    }

    //Function to capture the changes made to item in message queue to sync with AS400 data
    function captureSkuSetChangeInQueue(parentSkuID, action) {
      //Prepare object to sent as body in the post request
      let bodyObject = {
        id: parentSkuID,
        action: action
      };
      //Make a post request to the desired URL and return the response received
      return $http
        .post(`${application_configuration.itemAndRetailService.url}/api/as400/sync/set/interface`, bodyObject)
        .then(response => {
          return response;
        });
    }

    function insertSKUSet(data) {
      return $http.post(
        application_configuration.itemAndRetailService.url + apiEndpoint,
        data
      );
    }

    function updateSKUSet(data) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/" +
          data.id,
        data
      );
    }

    function updateSKUparentStatus(data) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/parentsku/" +
          data.id,
        data
      );
    }

    function updateChildsetstatus(data) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/childsku/" +
          data.id,
        data
      );
    }

    function deleteSKUSet(data) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
          apiEndpoint +
          "/" +
          data.id +
          "?parent_sku_id=" +
          data.parent_sku_id +
          "&parent_sku_number=" +
          data.parent_sku_number +
          "&child_sku_number=" +
          data.child_sku_number,
        data
      );
    }
  }
})();
