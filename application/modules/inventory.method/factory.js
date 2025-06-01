(() => {
  "use strict";
  angular
    .module("rc.prime.inventorymethods")
    .factory("InventoryMethodService", InventoryMethodService);
  InventoryMethodService.$inject = ["$http", "application_configuration"];

  function InventoryMethodService($http, application_configuration) {
    const baseUrl = `${
      application_configuration.itemAndRetailService.url
    }/api/inventory/methods`;
    let API = {};
    let isCache = false;

    API.GetInventoryMethods = getInventoryMethods;
    API.InsertInventoryMethod = insertInventoryMethod;
    API.UpdateInventoryMethod = updateInventoryMethod;
    API.DeleteInventoryMethod = deleteInventoryMethod;

    return { API };

    function getInventoryMethods() {
      return $http.get(`${baseUrl}`).then(response => {
        let time =
          response.config.responseTimestamp - response.config.requestTimestamp;
        response.data.time_taken = time / 1000;
        return response.data;
      });
    }

    function insertInventoryMethod(data) {
      return $http.post(`${baseUrl}`, data);
    }

    function updateInventoryMethod(data) {
      return $http.put(`${baseUrl}/${data.id}`, data);
    }

    function deleteInventoryMethod(data) {
      return $http.delete(`${baseUrl}/${data.id}`, data);
    }
  }
})();
