(function() {
  "use strict";
  angular
    .module("rc.prime.discount")
    .factory("DiscountService", DiscountService);
  DiscountService.$inject = ["$http", "application_configuration"];

  function DiscountService($http, application_configuration) {
    let API = {};
    let isCache = false;
    API.GetDiscountTypes = getDiscountTypes;
    API.InsertDiscountType = insertDiscountType;
    API.UpdateDiscountType = updateDiscountType;
    API.DeleteDiscountType = deleteDiscountType;
    
    API.GetDiscountTypeValues  = getDiscountTypeValues;
    API.GetDiscountTypeValuesByTypeIdAndParentId = getDiscountTypeValuesByTypeIdAndParentId;
    API.InsertDiscountTypeValue = insertDiscountTypeValue;
    API.UpdateDiscountTypeValue = updateDiscountTypeValue;
    API.DeleteDiscountTypeValue = deleteDiscountTypeValue;
    API.DeleteDiscountTypeValuesByDisountTypeId = deleteDiscountTypeValuesByDisountTypeId;

    return {
      API
    };

    function getDiscountTypes() {
      return $http
        .get(
          `${
            application_configuration.cloudCartService.url
          }/api/cloud/cart/discounttype`
        )
        .then(response => {
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.data.time_taken = time / 1000;
          return response.data;
        });
    }

    function insertDiscountType(discountType) {
      return $http.post(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/discounttype`,
        discountType
      );
    }

    function updateDiscountType(discountType) {
        return $http.put(`${application_configuration.cloudCartService.url}/api/cloud/cart/discounttype/${discountType.id}`, discountType);
    };

    function deleteDiscountType(discountTypeId) {
        return $http.delete(`${application_configuration.cloudCartService.url}/api/cloud/cart/discounttype/${discountTypeId}`);
    };

    function getDiscountTypeValues(discountTypeId){
        return $http
        .get(
          `${
            application_configuration.cloudCartService.url
          }/api/cloud/cart/discounttype/value/by/type/${discountTypeId}`,
        )
        .then(response => {
          return response.data;
        });
    }

    function getDiscountTypeValuesByTypeIdAndParentId(query) {
      return $http
      .get(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/discounttype/value/nodes`, {params:query}
      )
      .then(response => {
        return response.data;
      });
    }

    function insertDiscountTypeValue(discountTypeValue){
      return $http.post(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/discounttype/value`,
        discountTypeValue
      );
    }

    function updateDiscountTypeValue(discountTypeValue){
      return $http.put(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/discounttype/value/${discountTypeValue.id}`,
        discountTypeValue
      );
    }

    function deleteDiscountTypeValue(discountTypeValueId){
      return $http.delete(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/discounttype/value/${discountTypeValueId}`
      );
    }

    function deleteDiscountTypeValuesByDisountTypeId(discountTypeId){
      return $http.delete(
        `${
          application_configuration.cloudCartService.url
        }/api/cloud/cart/discounttype/value/by/type/${discountTypeId}`
      );
    }
  }
})();
