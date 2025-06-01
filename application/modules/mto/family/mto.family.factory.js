(function() {
    'use strict'
    angular.module('rc.prime.mto.family').factory('MTOFamilyService', MTOFamilyService);
    MTOFamilyService.$inject = [
        '$http',
        'application_configuration'
    ];

    function MTOFamilyService($http, application_configuration) {
        let API = {};
        API.GetFamilies = getFamilies;
        API.InsertFamily = insertFamily;
        API.UpdateFamily = updateFamily;
        API.DeleteFamily = deleteFamily;
        API.GetFamilyVendors = getFamilyVendors;
        API.UnlinkVendorFromFamily = unlinkVendorFromFamily;
        API.LinkVendorToFamily = linkVendorToFamily;
        API.SearchVendorFamilies = searchVendorFamilies;

        return {
            API
        };

        function getFamilies() {
            return $http.get(application_configuration.mtoService.url + '/api/mto/families')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function searchVendorFamilies(search_field, search_value) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/vendor/family/search?field=' + search_field + '&value=' + search_value)
                .then((response) => {
                    return response;
                });
        };

        function insertFamily(familyDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/families', familyDetails);
        };

        function updateFamily(familyDetails) {
            return $http.put(application_configuration.mtoService.url + '/api/mto/families/' + familyDetails.id, familyDetails);
        };

        function deleteFamily(familyDetails) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/families/' + familyDetails.id, familyDetails);
        };

        function getFamilyVendors(family_id) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/vendorfamily/' + family_id)
                .then((response) => {
                    return response.data;
                });
        };

        function linkVendorToFamily(linkDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/vendorfamily', linkDetails)
                .then((response) => {
                    return response.data;
                });
        };

        function unlinkVendorFromFamily(family_id, vendor_id) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/unlink/vendorfamily/' + family_id + '/' + vendor_id).then((response) => {
                return response.data;
            });
        };
    }
})();