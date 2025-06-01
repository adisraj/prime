(function () {
  'use strict';

  angular
    .module('calculus')
    .factory('VendorPortalService', VendorPortalService)

  /**
   * @namespace VendorPortalService
   * @desc Application wide Jobs http requests
   */
  VendorPortalService.$inject = ['$http', 'application_configuration'];

  function VendorPortalService($http, application_configuration) {
    let API = {};
    let endpoint = '/api/udd/approval';


    API.GetVendorPortalChangeRequests = getVendorPortalChangeRequests;

    return {
      API
    };



    /**
    * @name getVendorPortalChangeRequests
    * @desc Get change requests in notifications view
    */
    function getVendorPortalChangeRequests(filters) {
      return $http.get(`${application_configuration.mercuryService.url}${endpoint}/q`, { params: filters })
        .then(response => {
          return response.data;
        });
    }
  }
})();
