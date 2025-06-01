(function() {
  "use strict";

  angular
    .module("rc.prime.contactsubtypes")
    .factory("ContactsubtypesService", ContactsubtypesService);
  ContactsubtypesService.$inject = ["$http", "application_configuration"];

  function ContactsubtypesService($http, application_configuration) {
    let API = {};

    API.getContactsTypes = getContactsTypes;
    API.GetContactSubTypes = getContactSubTypes;
    API.InsertContactSubType = insertContactSubType;
    API.DeleteContactSubType = deleteContactSubType;
    API.UpdateContactSubType = updateContactSubType;
    return {
      API
    };
    // To get all contact types
    function getContactsTypes() {
      return $http
        .get(application_configuration.entityService.url + "/api/contact/type")
        .then(response => {
          return response.data;
        });
    }
    // To get all contact sub types
    function getContactSubTypes() {
      return $http
        .get(
          application_configuration.entityService.url +
            "/api/contact/type/subtypes"
        )
        .then(response => {
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.data.time_taken = time / 1000;
          return response.data;
        });
    }
    // To insert contact sub types
    function insertContactSubType(subTypeDetails) {
      return $http.post(
        application_configuration.entityService.url +
          "/api/contact/type/subtypes/add",
        subTypeDetails
      );
    }
    // To update contact sub types
    function updateContactSubType(subTypeDetails) {
      return $http.put(
        application_configuration.entityService.url +
          "/api/contact/type/subtypes/" +
          subTypeDetails.id,
        subTypeDetails
      );
    }
    // To delete contact sub types
    function deleteContactSubType(subTypeDetails) {
      return $http.delete(
        application_configuration.entityService.url +
          "/api/contact/type/subtypes/id/" +
          subTypeDetails.id
      );
    }
  }
})();
