(() => {
  "use strict";
  angular.module("rc.prime.vendor").factory("VendorService", VendorService);
  VendorService.$inject = ["$http", "application_configuration"];

  function VendorService($http, application_configuration) {
    let API = {};
    let object = {};

    API.GetVendors = getVendors;
    API.GetVendorById = getVendorById;
    API.InsertVendor = insertVendor;
    API.UpdateVendor = updateVendor;
    API.DeleteVendor = deleteVendor;
    API.FetchTotalRecordCount = fetchTotalRecordCount;
    API.GetListOfValues = getListOfValues;
    API.GroupByFieldAndValues = groupByFieldAndValues;
    API.GetVendorProperties = getVendorProperties;
    API.UpdateVendorProperties = updateVendorProperties;
    API.InsertVendorProperties = insertVendorProperties;
    API.DeleteVendorProperties = deleteVendorProperties;
    API.SearchVendors = searchVendors;
    API.GetInsightsByVendorId = getInsightsByVendorId;
    API.InsertVendorPortalAccess = insertVendorPortalAccess;
    API.UpdateVendorPortalAccess = updateVendorPortalAccess;
    API.DeleteVendorPortalAccess = deleteVendorPortalAccess;
    API.GetPortalAccessByVendorId = getPortalAccessByVendorId;
    API.GetModuleDetailsById = getModuleDetailsById;
    API.VendorShortNameDuplicateCheck = vendorShortNameDuplicateCheck;
    API.FetchInventoryMethods = fetchInventoryMethods;
    API.FetchSkusByVendorAndInventoryMethods = fetchSkusByVendorAndInventoryMethods;
    API.SendChangesToAS400 = sendChangesToAS400;
    API.FetchVendorDepartments = fetchVendorDepartments;
    API.FetchVendorDepartmentDetails = fetchVendorDepartmentDetails;
    API.UpsertVendorDepartmentDetails = upsertVendorDepartmentDetails;
    API.DeleteVendorDepartmentDetails = deleteVendorDepartmentDetails;
    API.ValidateWithSecondaryPassword = validateWithSecondaryPassword;
    API.UpdateVendorRMSNumber = updateVendorRMSNumber;

    return {
      API
    };

    function getVendors(paginationObject, filterData, sortObject, groupObject) {
      return $http({
        url: application_configuration.vendorService.url + "/api/vendor",
        method: "GET",
        // Sending objects through query string
        params: {
          pagination: paginationObject,
          filters: filterData,
          sort: sortObject,
          group: groupObject
        }
      }).then(response => {
        // Calculating time taken to fetch records
        let time =
          response.config.responseTimestamp - response.config.requestTimestamp;
        response.time_taken = time / 1000;
        return response;
      });
    }

    function getVendorById(id) {
      return $http
        .get(application_configuration.vendorService.url + "/api/vendor/" + id)
        .then(response => {
          return response.data;
        });
    }

    function insertVendor(vendorDetails) {
      return $http.post(
        application_configuration.vendorService.url + "/api/vendor",
        vendorDetails
      );
    }

    function updateVendor(vendorDetails) {
      return $http.put(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendorDetails.id,
        vendorDetails
      );
    }

    function fetchInventoryMethods() {
      return $http
        .get(application_configuration.vendorService.url + "/api/vendor/inventory/methods")
        .then(response => {
          return response.data;
        });
    }

    function fetchSkusByVendorAndInventoryMethods(vendorId, inventoryMethodIds) {
      return $http
        .get(application_configuration.vendorService.url + "/api/vendor/" + vendorId + "/inventory/methods/skus", {
          params: {
            inventory_method_id: inventoryMethodIds
          }
        })
        .then(response => {
          return response.data;
        });
    }

    function vendorShortNameDuplicateCheck(short_name) {
      return $http
        .get(application_configuration.vendorService.url + "/api/vendor/short/name/" + short_name
        )
        .then(response => {
          return response.data;
        });
    }

    function deleteVendor(vendorDetails) {
      return $http.delete(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendorDetails.id,
        vendorDetails
      );
    }

    function fetchTotalRecordCount() {
      return $http
        .get(application_configuration.vendorService.url + "/api/vendor/count")
        .then(response => {
          return response.data.total_records;
        });
    }

    function getListOfValues(field, values) {
      return $http
        .get(
        application_configuration.vendorService.url +
        "/api/vendor/in?field=" +
        field +
        "&values=" +
        values
        )
        .then(response => {
          return response.data;
        });
    }

    function groupByFieldAndValues(object, page, limit) {
      return $http
        .post(
        application_configuration.vendorService.url +
        "/api/vendor/group?page=" +
        page +
        "&limit=" +
        limit,
        object
        )
        .then(function (response) {
          return response.data;
        });
    }

    function getVendorProperties(vendor_id) {
      return $http
        .get(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendor_id +
        "/properties"
        )
        .then(response => {
          return response;
        });
    }

    function searchVendors(search_field, search_value) {
      //return $http.get(application_configuration.locationService.url + apiEndpoint + '?page=' + page + '&limit=' + limit)
      return $http({
        url:
        application_configuration.vendorService.url + "/api/vendor/search/",
        method: "GET",
        // Sending objects through query string
        params: {
          field: search_field,
          value: search_value
        }
      }).then(response => {
        return response.data;
      });
    }

    function updateVendorProperties(vendorProperties) {
      return $http.put(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendorProperties.vendor_id +
        "/properties",
        vendorProperties
      );
    }

    function insertVendorProperties(vendorProperties) {
      return $http.post(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendorProperties.vendor_id +
        "/properties",
        vendorProperties
      );
    }
    function deleteVendorProperties(vendorProperties) {
      return $http.delete(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendorProperties.vendor_id +
        "/properties",
        vendorProperties
      );
    }
    function getInsightsByVendorId(vendorId) {
      return $http.get(
        application_configuration.vendorService.url +
        "/api/vendor/insights/" +
        vendorId
      );
    }
    function insertVendorPortalAccess(vendorId, object) {
      return $http.post(
        application_configuration.vendorService.url +
        "/api/vendor/portalaccess/" +
        vendorId,
        object
      );
    }
    function updateVendorPortalAccess(vendorId, object) {
      return $http.put(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendorId +
        "/portalaccess/vendoruuid/" +
        object.uuid,
        object
      );
    }
    function deleteVendorPortalAccess(vendorId, vendorPortaluuid) {
      return $http.delete(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendorId +
        "/portalaccess/" +
        vendorPortaluuid +
        "/portalVendoruuid"
      );
    }
    function getPortalAccessByVendorId(vendorId) {
      return $http.get(
        application_configuration.vendorService.url +
        "/api/vendor/" +
        vendorId +
        "/portalaccess"
      );
    }

    function getModuleDetailsById(id) {
      return $http
        .get(application_configuration.entityService.url + "/api/package/module/" + id)
        .then(response => {
          return response.data;
        });
    }

    function sendChangesToAS400(vendorId) {
      return $http
        .post(application_configuration.vendorService.url + "/api/vendor/as400/" + vendorId)
        .then(response => {
          return response.data;
        });
    }

    function fetchVendorDepartments() {
      return $http
        .get(application_configuration.vendorService.url + "/api/vendor/departments/")
        .then(response => {
          return response.data;
        });
    }
    function fetchVendorDepartmentDetails(vendorId) {
      return $http
        .get(application_configuration.vendorService.url + "/api/vendor/department/details/" + vendorId)
        .then(response => {
          return response.data;
        });
    }
    function upsertVendorDepartmentDetails(payload) {
      return $http
        .post(application_configuration.vendorService.url + "/api/vendor/department/details/" + payload.vendor_id, payload)
        .then(response => {
          return response.data;
        });
    }
    function deleteVendorDepartmentDetails(vendorId) {
      return $http
        .delete(application_configuration.vendorService.url + "/api/vendor/department/details/" + vendorId)
        .then(response => {
          return response.data;
        });
    }
    function validateWithSecondaryPassword(secondaryPassword) {
      return $http
        .post(application_configuration.locationService.url + "/api/udd/secondarypassword",
            { secondary_password: secondaryPassword }
        )
        .then(response => {
          return response.data;
        });
    }

    function updateVendorRMSNumber(payload) {
      return $http
        .post(application_configuration.vendorService.url + "/api/vendor/:id/vendor_id/" + payload.vendor_id, payload)
        .then(response => {
          return response.data;
        });
    }
  }
})();
