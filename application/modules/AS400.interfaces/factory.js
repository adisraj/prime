(function () {
    "use strict";
    angular.module("rc.prime.interface").factory("InterfaceService", InterfaceService);
    InterfaceService.$inject = ["$http", "application_configuration"];

    function InterfaceService($http, application_configuration) {
        let API = {};
        let apiEndpoint = "/api/sku";
        API.ReSyncSKUs = reSyncSKUs;
        API.ReSyncRetails = reSyncRetails;
        API.ResyncVendors = resyncVendors;
        API.ResyncSKURetailsByEffectiveDate = resyncSKURetailsByEffectiveDate;

        return {
            API
        };

        function reSyncSKUs(skuIds) {
            let body = {
                sku_ids: skuIds
            }
            return $http.post(application_configuration.itemAndRetailService.url + apiEndpoint + "/interface/resync", body)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function resyncVendors(id) {
            let body = {
                vendor_id: id,
            }
            return $http.post(application_configuration.vendorService.url + "/api/vendor/as400/interface/resync", body)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function reSyncRetails(skuIds) {
            let body = {
                sku_ids: skuIds
            }
            return $http.post(application_configuration.itemAndRetailService.url + "/api/retail/interface/resync", body)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function resyncSKURetailsByEffectiveDate(skuIds) {
          
            return $http.post(application_configuration.itemAndRetailService.url + "/api/retail/interface/resync/byeffectivedate", skuIds)
                .then((response) => {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        }
    }

})();