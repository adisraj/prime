(function() {
  "use strict";
  angular
    .module("rc.prime.country.states.cities")
    .factory("CountryCityService", CountryCityService);
  CountryCityService.$inject = ["$http", "application_configuration"];

  function CountryCityService($http, application_configuration) {
    let API = {};
    API.GetCountryCitiesByStateId = getCountryCitiesByStateId;
    API.InsertCountryCity = insertCountryCity;
    API.UpdateCountryCity = updateCountryCity;
    API.DeleteCountryCity = deleteCountryCity;
    return {
      API
    };

    function getCountryCitiesByStateId(regionId) {
      return $http
        .get(
          application_configuration.entityService.url +
            "/api/region/" +
            regionId +
            "/cities/"
        )
        .then(response => {
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.data.time_taken = time / 1000;
          return response.data;
        });
    }

    function insertCountryCity(CityDetails) {
      return $http.post(
        application_configuration.entityService.url +
          "/api/region/" +
          CityDetails.region_id +
          "/cities/",
        CityDetails
      );
    }

    function updateCountryCity(CityDetails) {
      return $http.put(
        application_configuration.entityService.url +
          "/api/region/city/" +
          CityDetails.id +
          "/",
        CityDetails
      );
    }

    function deleteCountryCity(CityDetails) {
      return $http.delete(
        application_configuration.entityService.url +
          "/api/region/city/" +
          CityDetails.id +
          "/",
        CityDetails
      );
    }
  }
})();
