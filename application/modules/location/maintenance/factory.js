(() => {
  "use strict";
  angular
    .module("rc.prime.location")
    .factory("LocationFactory", LocationFactory);
  LocationFactory.$inject = ["$http", "application_configuration"];

  function LocationFactory($http, application_configuration) {
    let API = {};
    let object = {};
    let apiEndpoint = "/api/location";
    API.FetchLocation = fetchLocation;
    API.FetchTotalRecordCount = fetchTotalRecordCount;
    API.GetLocations = getLocations;
    API.FetchLocationsGraph = fetchLocationsGraph;
    API.InsertLocation = insertLocation;
    API.UpdateLocation = updateLocation;
    API.DeleteLocation = deleteLocation;
    API.GroupByColumnName = groupByColumnName;
    API.GetListOfValues = getListOfValues;
    API.GroupByFieldAndValues = groupByFieldAndValues;
    API.FetchFilteredLocations = fetchFilteredLocations;
    API.FetchDeliveryDatesForFulfillmentLocation = fetchDeliveryDatesForFulfillmentLocation;
    API.SetVariable = setVariable;
    API.GetVariable = getVariable;
    API.SearchLocations = searchLocations;

    return {
      API
    };

    function getLocations(
      paginationObject,
      filterData,
      sortObject,
      groupObject
    ) {
      return $http({
        url: application_configuration.locationService.url + apiEndpoint,
        method: "GET",
        // Sending objects through query string
        params: {
          pagination: paginationObject,
          filters: filterData,
          sort: sortObject,
          group: groupObject
        }
      }).then(response => {
     
        let time =
          response.config.responseTimestamp - response.config.requestTimestamp;
        response.time_taken = time / 1000;
        return response;
      });
    }

    function fetchLocation(id) {
      return $http
        .get(
          application_configuration.locationService.url + apiEndpoint + "/" + id
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchTotalRecordCount() {
      return $http
        .get(
          application_configuration.locationService.url + apiEndpoint + "/count"
        )
        .then(response => {
          return response.data.total_records;
        });
    }

    function insertLocation(locationDetails) {
      return $http.post(
        application_configuration.locationService.url + apiEndpoint,
        locationDetails
      );
    }

    function updateLocation(locationDetails) {
      return $http.put(
        application_configuration.locationService.url +
          apiEndpoint +
          "/" +
          locationDetails.id,
        locationDetails
      );
    }

    function deleteLocation(locationDetails) {
      return $http.delete(
        application_configuration.locationService.url +
          apiEndpoint +
          "/" +
          locationDetails.id + "?is_proceed="+locationDetails.is_proceed,
        locationDetails
      );
    }

    function groupByColumnName(groupByColumn) {
      return $http
        .get(
          application_configuration.locationService.url +
            apiEndpoint +
            "/groupby/" +
            groupByColumn
        )
        .then(response => {
          return response.data;
        });
    }

    function getListOfValues(field, values) {
      return $http
        .get(
          application_configuration.locationService.url +
            apiEndpoint +
            "/lov/" +
            field +
            "-" +
            values
        )
        .then(function(response) {
          return response.data;
        });
    }

     function searchLocations(search_field, search_value) {
      return $http
        .get(
          application_configuration.locationService.url +
            apiEndpoint +
            "/search/" +
            search_field +
            "-" +
            search_value
        )
        .then(function(response) {
          return response.data;
        });
    }

    function groupByFieldAndValues(object, page, limit) {
      return $http
        .post(
          application_configuration.locationService.url +
            apiEndpoint +
            "/group?page=" +
            page +
            "&limit=" +
            limit,
          object
        )
        .then(function(response) {
          return response.data;
        });
    }

    function fetchFilteredLocations(filterData, page, limit) {
      return $http.post(
        application_configuration.locationService.url +
          apiEndpoint +
          "/filter?page=" +
          page +
          "&limit=" +
          limit,
        filterData
      );
    }

    function fetchLocationsGraph(columns, conditionField, conditionValue) {
      return $http
        .get(
          application_configuration.locationService.url + "/api/location/graph",
          {
            params: {
              column: columns,
              condition_field: conditionField,
              condition_value: conditionValue

            }
          }
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchDeliveryDatesForFulfillmentLocation(deliverySlot) {
      return $http
        .get(application_configuration.deliveryBookingService.url + '/api/delivery/booking/slots/q',{ params: deliverySlot })
        .then(response => {
          return response.data;
        });
    }

    function setVariable(key, value) {
      object[key] = value;
    }

    function getVariable(key) {
      return object[key];
    }
  }
})();
