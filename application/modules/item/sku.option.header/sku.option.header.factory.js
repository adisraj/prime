(function () {
  angular
    .module("rc.prime.item")
    .factory("SkuOptionHeaderService", SkuOptionHeaderService);
  SkuOptionHeaderService.$inject = ["$http", "application_configuration"];

  function SkuOptionHeaderService($http, application_configuration) {
    let API = {};

    API.GetSkuHeaders = getSkuHeaders;
    API.InsertSkuHeader = insertSkuHeader;
    API.UpdateSkuHeader = updateSkuHeader;
    API.DeleteSkuHeader = deleteSkuHeader;
    API.SearchSkuHeaders = searchSkuHeaders;

    return {
      API
    };

    function getSkuHeaders() {
      return $http
        .get(
          application_configuration.itemAndRetailService.url + "/api/sku/header"
        )
        .then(response => {
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.data.time_taken = time / 1000;
          return response.data;
        });
    }

    function searchSkuHeaders(search_field, search_value) {
      return $http
        .get(
          application_configuration.itemAndRetailService.url +
          "/api/sku/header/search/" +
          search_field +
          "-" +
          search_value
        )
        .then(response => {
          return response;
        });
    }

    function insertSkuHeader(valueDetails) {
      return $http.post(
        application_configuration.itemAndRetailService.url + "/api/sku/header",
        valueDetails
      );
    }

    function updateSkuHeader(valueDetails) {
      return $http.put(
        application_configuration.itemAndRetailService.url +
        "/api/sku/header/" +
        valueDetails.id,
        valueDetails
      );
    }

    function deleteSkuHeader(valueDetails) {
      return $http.delete(
        application_configuration.itemAndRetailService.url +
        "/api/sku/header/" +
        valueDetails.id,
        valueDetails
      );
    }
  }
})();