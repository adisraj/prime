(() => {
  "use strict";
  angular.module("rc.prime.inventorytypes").factory("InventoryTypeService", InventoryTypeService);
  InventoryTypeService.$inject = ["$http", "application_configuration"];

  function InventoryTypeService($http, application_configuration) {
    const baseUrl = `${application_configuration.itemAndRetailService.url}/api/item/inventory/type`
    let API = {};
    let isCache = false;

    API.GetInventoryTypes = getInventoryTypes;
    API.InsertInventoryType = insertInventoryType;
    API.UpdateInventoryType = updateInventoryType;
    API.DeleteInventoryType = deleteInventoryType;

    return { API };

    function getInventoryTypes() {
      return $http.get(baseUrl)
        .then(response => {
          let time = response.config.responseTimestamp - response.config.requestTimestamp;
          response.data.time_taken = (time / 1000);
          return response.data;
        });
    }

    function insertInventoryType(inventoryTypeDetails) {
      return $http.post(baseUrl, inventoryTypeDetails)
        .then(response => {
          return response.data;
        });
    }

    function updateInventoryType(inventoryTypeDetails) {
      return $http.put(`${baseUrl}/${inventoryTypeDetails.id}`, inventoryTypeDetails)
        .then(response => {
          return response.data;
        });
    }

    function deleteInventoryType(inventoryTypeDetails) {
      return $http.delete(`${baseUrl}/${inventoryTypeDetails.id}`)
        .then(response => {
          return response.data;
        });
    }
  }
})();
