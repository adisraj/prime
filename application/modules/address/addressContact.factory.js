(function() {
  "use strict";
  calculus.factory("AddressContactService", AddressContactService);
  AddressContactService.$inject = ["$http", "application_configuration"];

  function AddressContactService($http, application_configuration) {
    let API = {};
    let object = {};
    API.UpdateAddress = updateAddress;
    API.GetAddressTypes = getAddressTypes;
    API.GetAddressList = getAddressList;
    API.GetRegions = getRegions;
    API.GetCitiesByRegion = getCitiesByRegion;
    API.UpdateAddressById = updateAddressById;
    API.InsertAddressByUuidAndInstance = insertAddressByUuidAndInstance;
    API.DeleteAddressById = deleteAddressById;
    API.GetContactTypes = getContactTypes;
    API.GetContactsList = getContactsList;
    API.UpdateContactById = updateContactById;
    API.InsertContactByUuidAndInstance = insertContactByUuidAndInstance;
    API.DeleteContactById = deleteContactById;
    API.StoreVariable = storeVariable;
    API.GetVariable = getVariable;
    API.GetContactSubType = getContactSubType;
    API.LinkContact = linkContact;
    API.DeleteContactLink = deleteContactLink;
    API.InsertCity = insertCity;
    return {
      API
    };

    function updateAddress(addressDetails) {
      return $http
        .put(
          application_configuration.entityService.url +
            "/api/address/update/" +
            addressDetails.id,
          addressDetails
        )
        .then(response => {
          return response.data;
        });
    }

    function getAddressTypes() {
      return $http
        .get(application_configuration.entityService.url + "/api/address/type")
        .then(response => {
          return response.data;
        });
    }

    function getRegions(countryId) {
      return $http
        .get(
          application_configuration.entityService.url +
            "/api/region/country/" +
            countryId
        )
        .then(response => {
          return response.data;
        });
    }

    function getCitiesByRegion(regionId) {
      return $http
        .get(
          application_configuration.entityService.url +
            "/api/region/" +
            regionId +
            "/cities"
        )
        .then(response => {
          return response.data;
        });
    }

    function getAddressList(uuid, instance_id) {
      return $http
        .get(
          application_configuration.entityService.url +
            "/api/address/" +
            uuid +
            "/" +
            instance_id
        )
        .then(response => {
          return response.data;
        });
    }

    function insertAddressByUuidAndInstance(addressDetails) {
      return $http.post(
        application_configuration.entityService.url +
          "/api/address/" +
          addressDetails.uuid +
          "/" +
          addressDetails.instance_id,
        addressDetails
      );
    }

    function insertCity(CityDetails) {
      return $http.post(
        application_configuration.entityService.url +
          "/api/region/" +
          CityDetails.region_id +
          "/cities/",
        CityDetails
      );
    }

    function updateAddressById(addressDetails) {
      return $http.put(
        application_configuration.entityService.url +
          "/api/address/update/" +
          addressDetails.id,
        addressDetails
      );
    }

    function deleteAddressById(addressId) {
      return $http.delete(
        application_configuration.entityService.url +
          "/api/address/remove/" +
          addressId
      );
    }

    function getContactTypes() {
      return $http
        .get(application_configuration.entityService.url + "/api/contact/type")
        .then(response => {
          return response.data;
        });
    }

    function getContactSubType() {
      return $http
        .get(
          application_configuration.entityService.url +
            "/api/contact/type/subtypes"
        )
        .then(response => {
          return response.data;
        });
    }

    function getContactsList(uuid, instance_id, isCacheEnabled) {
      return $http
        .get(
          application_configuration.entityService.url +
            "/api/contact/" +
            uuid +
            "/" +
            instance_id,
          { cache: isCacheEnabled }
        )
        .then(response => {
          return response.data;
        });
    }

    function updateContactById(contactDetails) {
      return $http.put(
        application_configuration.entityService.url +
          "/api/contact/update/" +
          contactDetails.id,
        contactDetails
      );
    }

    function insertContactByUuidAndInstance(contactDetails) {
      return $http.post(
        application_configuration.entityService.url +
          "/api/contact/" +
          contactDetails.uuid +
          "/" +
          contactDetails.instance_id,
        contactDetails
      );
    }

    function linkContact(contactDetails) {
      return $http.post(
        application_configuration.entityService.url +
          "/api/contact/link/" +
          contactDetails.uuid +
          "/" +
          contactDetails.instance_id,
        contactDetails
      );
    }

    function deleteContactById(contactId) {
      return $http.delete(
        application_configuration.entityService.url +
          "/api/contact/remove/" +
          contactId
      );
    }

    function deleteContactLink(contactDetails) {
      return $http.delete(
        application_configuration.entityService.url +
          "/api/contact/remove/" +
          contactDetails.contactId +
          "/" +
          contactDetails.uuid +
          "/" +
          contactDetails.instance_id
      );
    }

    function storeVariable(key, value) {
      object[key] = value;
    }

    function getVariable(key) {
      return object[key];
    }
  }
})();
