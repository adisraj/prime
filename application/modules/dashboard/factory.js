(function () {
  "use strict";
  angular
    .module("rc.prime.dashboard")
    .factory("DashboardService", DashboardService);
  DashboardService.$inject = ["$http", "application_configuration"];

  function DashboardService($http, application_configuration) {
    let API = {};
    let object = {};

    API.GetVariable = getVariable;
    API.StoreVariable = storeVariable;

    API.FetchMostViewedSkusBySkus = fetchMostViewedSkusBySkus;
    API.FetchMostViewedSkusByLocations = fetchMostViewedSkusByLocations;

    API.FetchPopularSkusSavedInCarts = fetchPopularSkusSavedInCarts;

    
    return {
      API
    };

    function getVariable(key) {
      return object[key];
    }

    function storeVariable(key, value) {
      object[key] = value;
    }

    function fetchMostViewedSkusBySkus() {
      return $http
        .get(
          application_configuration.cloudCartService.url +
          "/api/sku/view/group/skus"
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchMostViewedSkusByLocations() {
      return $http
        .get(
          application_configuration.cloudCartService.url +
          "/api/sku/view/group/locations"
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchPopularSkusSavedInCarts() {
      return $http
        .get(
          application_configuration.cloudCartService.url +
          "/api/cloud/cart/popular/items/in/cart"
        )
        .then(response => {
          return response.data;
        });
    }


   

  }
})();
