(function() {
  "use strict";
  angular.module("rc.prime.tax").factory("TaxService", TaxService);
  TaxService.$inject = ["$http", "application_configuration"];

  function TaxService($http, application_configuration) {
    let API = {};

    API.GetRegions = getRegions;
    API.GetRegionsWithTaxMethods = getRegionsWithTaxMethods;
    API.GetTaxMethods = getTaxMethods;
    API.GetRegionTaxDetailsByZipcode = getRegionTaxDetailsByZipcode;
    API.GetSellingLocationsWithTax = getSellingLocationsWithTax;
    API.InsertNewTax = insertNewTax;
    API.UpdateTax = updateTax;
    API.DeleteTax = deleteTax;
    API.DeleteTaxForLocation = deleteTaxForLocation;

    return {
      API
    };

    function getRegions(countryId) {
      return $http
        .get(application_configuration.entityService.url + "/api/region/country/"+countryId)
        .then(response => {
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.time_taken = time / 1000;
          return response;
        });
    }

    function getRegionsWithTaxMethods() {
      return $http
        .get(application_configuration.taxService.url + "/api/tax/regions")
        .then(response => {
          return response.data;
        });
    }

    function getTaxMethods() {
      return $http
        .get(application_configuration.taxService.url + "/api/tax/methods", {
          cache: true
        })
        .then(response => {
          return response.data;
        });
    }

    function getRegionTaxDetailsByZipcode(region) {
      return $http
        .get(
          application_configuration.taxService.url +
            "/api/tax/region/" +
            region.id +
            "/zipcode/" +
            region.zipcode
        )
        .then(response => {
          return response.data;
        });
    }

    function getSellingLocationsWithTax(region) {
      return $http
        .get(
          application_configuration.taxService.url +
            "/api/tax/region/" +
            region.id +
            "/sellinglocations"
        )
        .then(response => {
          return response.data;
        });
    }

    function insertNewTax(data) {
      return $http.post(
        application_configuration.taxService.url + "/api/tax/new/",
        data
      );
    }

    function updateTax(data) {
      return $http.put(
        application_configuration.taxService.url + "/api/tax/update/",
        data
      );
    }

    function deleteTax(id, code) {
      return $http.delete(
        application_configuration.taxService.url +
          "/api/tax/delete/" +
          id +
          "?code=" +
          code
      );
    }

    function deleteTaxForLocation(id) {
      return $http.delete(
        application_configuration.taxService.url +
          "/api/tax/location/" +
          id +
          "/delete"
      );
    }
  }
})();
