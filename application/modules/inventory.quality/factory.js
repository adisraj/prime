(() => {
  "use strict";
  angular
    .module("rc.prime.inventoryquality")
    .factory("InventoryQualityService", InventoryQualityService);
  InventoryQualityService.$inject = ["$http", "application_configuration"];

  function InventoryQualityService($http, application_configuration) {
    const baseUrl = `${
      application_configuration.itemAndRetailService.url
    }/api/item/inventory/quality`;
    let API = {};
    let isCache = false;

    API.GetInventoryQualities = getInventoryQualities;
    API.InsertInventoryQuality = insertInventoryQuality;
    API.UpdateInventoryQuality = updateInventoryQuality;
    API.DeleteInventoryQuality = deleteInventoryQuality;

    return { API };

    function getInventoryQualities() {
      return $http.get(`${baseUrl}`).then(response => {
        let time =
          response.config.responseTimestamp - response.config.requestTimestamp;
        response.data.time_taken = time / 1000;
        return response.data;
      });
    }

    function insertInventoryQuality(data) {
      return $http.post(`${baseUrl}`, data);
    }

    function updateInventoryQuality(data) {
      return $http.put(`${baseUrl}/${data.id}`, data);
    }

    function deleteInventoryQuality(data) {
      return $http.delete(`${baseUrl}/${data.id}`, data);
    }
  }
})();
