(() => {
    'use strict'
    angular.module('rc.prime.mto.pricegroup').factory('MTOPriceGroupService', MTOPriceGroupService);
    MTOPriceGroupService.$inject = [
        '$http',
        'application_configuration'
    ];

    function MTOPriceGroupService($http, application_configuration) {
        let API = {};
        API.GetMtoPriceGroups = getMtoPriceGroups;
        API.InsertMtoPriceGroup = insertMtoPriceGroup;
        API.UpdateMtoPriceGroup = updateMtoPriceGroup;
        API.DeleteMtoPriceGroup = deleteMtoPriceGroup;
        API.GetMtoPriceGroupVendors = getMtoPriceGroupVendors;
        API.LinkVendorToMtoPriceGroup = linkVendorToMtoPriceGroup;
        API.UnlinkVendorFromMtoPriceGroup = unlinkVendorFromMtoPriceGroup;
        API.SearchVendorPriceGroups = searchVendorPriceGroups;

        return {
            API
        };

        function getMtoPriceGroups() {
            return $http.get(application_configuration.mtoService.url + '/api/mto/pricegroups')
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.time_taken = (time / 1000);
                    return response;
                });
        };

        function searchVendorPriceGroups(search_field, search_value) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/vendor/pricegroup/search?field=' + search_field + '&value=' + search_value)
                .then((response) => {
                    return response;
                });
        };

        function insertMtoPriceGroup(pricegroupDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/pricegroups', pricegroupDetails);
        };

        function updateMtoPriceGroup(pricegroupDetails) {
            return $http.put(application_configuration.mtoService.url + '/api/mto/pricegroups/' + pricegroupDetails.id, pricegroupDetails);
        };

        function deleteMtoPriceGroup(pricegroupDetails) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/pricegroups/' + pricegroupDetails.id, pricegroupDetails);
        };

        function getMtoPriceGroupVendors(pricegroup_id) {
            return $http.get(application_configuration.mtoService.url + '/api/mto/vendorpricegroup/' + pricegroup_id)
                .then((response) => {
                    return response.data;
                });
        };

        function linkVendorToMtoPriceGroup(linkDetails) {
            return $http.post(application_configuration.mtoService.url + '/api/mto/vendorpricegroup', linkDetails)
                .then((response) => {
                    return response.data;
                });
        };

        function unlinkVendorFromMtoPriceGroup(pricegroup_id, vendor_id) {
            return $http.delete(application_configuration.mtoService.url + '/api/mto/unlink/vendorpricegroup/' + pricegroup_id + '/' + vendor_id).then((response) => {
                return response.data;
            });
        };
    }
})();