(function() {
  "use strict";
  angular.module("rc.prime.contact").factory("ContactService", ContactService);
  ContactService.$inject = ["$http", "application_configuration"];

  function ContactService($http, application_configuration) {
    let API = {};
    API.GetContacts = getContacts;
    API.InsertContact = insertContact;
    API.UpdateContact = updateContact;
    API.DeleteContact = deleteContact;

    API.GetContactTypes = getContactTypes;

    return {
      API
    };

    function getContacts() {
      return $http
        .get(application_configuration.entityService.url + "/api/contact")
        .then(function(response) {
          let time =
            response.config.responseTimestamp -
            response.config.requestTimestamp;
          response.time_taken = time / 1000;
          return response;
        });
    }

    function getContactTypes() {
      return $http
        .get(application_configuration.entityService.url + "/api/contact/type")
        .then(response => {
          return response;
        });
    }

    function insertContact(contactDetails) {
      return $http.post(
        application_configuration.entityService.url + "/api/contact",
        contactDetails
      );
    }

    function updateContact(contactDetails) {
      return $http.put(
        application_configuration.entityService.url +
          "/api/contact/" +
          contactDetails.id,
        contactDetails
      );
    }

    function deleteContact(contactDetails) {
      return $http.delete(
        application_configuration.entityService.url +
          "/api/contact/" +
          contactDetails.id,
        contactDetails
      );
    }
  }
})();
