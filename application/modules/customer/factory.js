(function() {
  "use strict";
  angular
    .module("rc.prime.customer")
    .factory("CustomerService", CustomerService);
  CustomerService.$inject = ["$http", "application_configuration"];

  function CustomerService($http, application_configuration) {
    let API = {};
    API.GetCustomerIds = getCustomerIds;
    API.GetCustomerDetailsById = getCustomerDetailsById;
    API.SearchCartsByFieldAndValue = searchCartsByFieldAndValue;
    API.GetCustomersCount = getCustomersCount;
    API.GetDicountType = getDicountType;
    API.SaveDiscountType = saveDiscountType;
    API.UpdateDiscountType = updateDiscountType;
    API.DeleteDiscountType = deleteDiscountType;

    return {
      API
    };

    function getCustomerIds(paginationObject, sortObject) {
      return $http
        .get(
          `${
            application_configuration.cloudCartService.url
          }/api/cloud/cart/customer`,
          {
            params: {
              pagination: paginationObject,
              sort: sortObject
            }
          }
        )
        .then(response => {
          return response.data;
        });
    }

    function getCustomerDetailsById(customerId) {
      return $http
        .get(
          `${
            application_configuration.entityService.url
          }/api/customer/${customerId}`
        )
        .then(response => {
          return response.data;
        });
    }

    function searchCartsByFieldAndValue(query) {
      return $http
        .get(
          application_configuration.cloudCartService.url +
            "/api/cloud/cart/carts/customer",
          { params: query }
        )
        .then(response => {
          return response.data;
        });
    }

    function getCustomersCount() {
      return $http
        .get(
          `${
            application_configuration.cloudCartService.url
          }/api/cloud/cart/customer/count`
        )
        .then(response => {
          return response.data;
        });
    }

    function getDicountType(customerId) {
      return $http
        .get(
          `${
            application_configuration.cloudCartService.url
          }/api/cloud/cart/customer/discount/${customerId}`
        )
        .then(response => {
          return response.data;
        });
    }

    function saveDiscountType(data) {
      return $http.post(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/customer/discount/`,
        data
      );
    }

    function updateDiscountType(data) {
      return $http.put(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/customer/discount/${data.customer_id}`,
        data
      );
    }

    function deleteDiscountType(data) {
      return $http.delete(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/customer/discount/${data.customer_id}`
      );
    }
  }
})();
